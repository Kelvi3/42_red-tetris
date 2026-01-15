import { expect } from 'chai'
import { startServer } from './helpers/server'
const io = require('socket.io-client')

describe('Server integration', function(){
  this.timeout(5000)
  let srv
  const params = { host: '127.0.0.1', port: 3333, url: 'http://127.0.0.1:3333' }

  before((done) => {
    startServer(params, (err, server) => {
      if (err) return done(err)
      srv = server
      done()
    })
  })

  after((done) => {
    if (srv && srv.stop) srv.stop(() => done())
    else done()
  })

  it('joinRoom without roomName and action=join returns roomError', (done) => {
    const socket = io(params.url, { transports: ['websocket'], forceNew: true })

    socket.on('connect', () => {
      socket.emit('joinRoom', { playerName: 'p', roomName: '', action: 'join' })
    })

    socket.on('roomError', (msg) => {
      expect(msg).to.match(/Room name is required/)
      socket.close()
      done()
    })
  })

  it('can create a room, another socket can join and startGame works with 2 players', (done) => {
    const socket1 = io(params.url, { transports: ['websocket'], forceNew: true })
    let roomName
    let socket2

    socket1.on('connect', () => {
      socket1.emit('joinRoom', { playerName: 'host', action: 'create' })
    })

    socket1.on('playerJoined', (payload) => {
      if (!roomName) {
        roomName = payload.name
        socket1.emit('startGame', { roomName })
      }
    })

    socket1.on('roomError', (msg) => {
      expect(msg).to.equal('Cannot start game with less than 2 players.')

      socket2 = io(params.url, { transports: ['websocket'], forceNew: true })
      socket2.on('connect', () => {
        socket2.emit('joinRoom', { playerName: 'p2', roomName, action: 'join' })
      })

      socket2.on('playerJoined', (payload) => {
        socket1.emit('startGame', { roomName })
      })
    })

    socket1.on('gameStarted', (data) => {
      expect(data).to.have.property('pieceSequence')
      expect(data).to.have.property('players')
      socket2.emit('canJoinRoom', { roomName, playerName: 'p2' }, (res) => {
        expect(res).to.deep.equal({ ok: true })

        socket2.emit('nextPiece', { roomName, socketId: socket2.id })
      })

      socket2.once('updatePiece', (payload) => {
        expect(payload).to.have.property('piece')

        socket2.emit('rotatePiece', { roomName, socketId: socket2.id })
      })

      socket2.once('updatePiece', (payload) => {
        socket2.emit('movePiece', { roomName, move: 'right', socketId: socket2.id })
      })

      socket2.once('updatePiece', (payload) => {
        socket1.once('youWin', (w) => {
          expect(w).to.have.property('winnerName')
        })

        socket2.emit('playerLost', { roomName, playerName: 'p2' }, (res2) => {
          expect(res2 && res2.ok).to.equal(true)
          socket1.close()
          socket2.close()
          done()
        })
      })
    })
  })

  it('rejects joining a non-existent room by name', (done) => {
    const roomName = `ghost-${Date.now()}`
    const socket = io(params.url, { transports: ['websocket'], forceNew: true })

    socket.on('connect', () => {
      socket.emit('joinRoom', { playerName: 'lone', roomName, action: 'join' })
    })

    socket.on('roomError', (msg) => {
      expect(msg).to.match(/does not exist/)
      socket.close()
      done()
    })
  })

  it('prevents a non-host from starting the game', (done) => {
    const roomName = `no-host-start-${Date.now()}`
    const socket1 = io(params.url, { transports: ['websocket'], forceNew: true })
    const socket2 = io(params.url, { transports: ['websocket'], forceNew: true })
    let started = false

    const cleanUp = () => {
      socket1.close()
      socket2.close()
    }

    const failStart = () => {
      started = true
      cleanUp()
      done(new Error('non-host should not start the game'))
    }

    socket1.on('gameStarted', failStart)
    socket2.on('gameStarted', failStart)

    socket1.on('connect', () => {
      socket1.emit('joinRoom', { playerName: 'host', roomName, action: 'create' })
    })

    socket2.on('connect', () => {
      socket2.emit('joinRoom', { playerName: 'guest', roomName, action: 'join' })
    })

    socket2.on('playerJoined', () => {
      socket2.emit('startGame', { roomName })
      setTimeout(() => {
        if (!started) {
          cleanUp()
          done()
        }
      }, 400)
    })
  })

  it('broadcasts penalty lines to opponents when rows are cleared', (done) => {
    const roomName = `penalty-${Date.now()}`
    const socket1 = io(params.url, { transports: ['websocket'], forceNew: true })
    const socket2 = io(params.url, { transports: ['websocket'], forceNew: true })

    const cleanUp = () => {
      socket1.close()
      socket2.close()
    }

    socket1.on('connect', () => {
      socket1.emit('joinRoom', { playerName: 'h', roomName, action: 'create' })
    })

    socket2.on('connect', () => {
      socket2.emit('joinRoom', { playerName: 'g', roomName, action: 'join' })
    })

    socket1.on('updatePlayerList', (list) => {
      if (list && list.length === 2) {
        socket1.emit('startGame', { roomName })
      }
    })

    socket1.on('penaltyLines', (payload) => {
      try {
        expect(payload.lines).to.equal(2)
        expect(payload.sender).to.equal('g')
        cleanUp()
        done()
      } catch (err) {
        cleanUp()
        done(err)
      }
    })

    socket2.on('gameStarted', () => {
      socket2.emit('linesCleared', { roomName, rowsCleared: 2 })
    })
  })

  it('relays opponent state updates to other players', (done) => {
    const roomName = `state-${Date.now()}`
    const socket1 = io(params.url, { transports: ['websocket'], forceNew: true })
    const socket2 = io(params.url, { transports: ['websocket'], forceNew: true })

    const cleanUp = () => {
      socket1.close()
      socket2.close()
    }

    socket1.on('connect', () => {
      socket1.emit('joinRoom', { playerName: 'alpha', roomName, action: 'create' })
    })

    socket2.on('connect', () => {
      socket2.emit('joinRoom', { playerName: 'beta', roomName, action: 'join' })
    })

    socket1.on('updatePlayerList', (list) => {
      if (list && list.length === 2) {
        socket1.emit('startGame', { roomName })
      }
    })

    socket1.on('opponentStateUpdate', (payload) => {
      try {
        expect(payload).to.have.property('socketId')
        expect(payload).to.have.property('state')
        expect(payload.state).to.deep.equal({ board: [[1]] })
        cleanUp()
        done()
      } catch (err) {
        cleanUp()
        done(err)
      }
    })

    socket2.on('gameStarted', () => {
      socket2.emit('updatePlayerState', { roomName, state: { board: [[1]] } })
    })
  })

  it('cleans up rooms when players leave before the game starts', (done) => {
    const roomName = `leave-${Date.now()}`
    const socket1 = io(params.url, { transports: ['websocket'], forceNew: true })
    const socket2 = io(params.url, { transports: ['websocket'], forceNew: true })

    const cleanUp = () => {
      socket1.close()
      socket2.close()
    }

    socket1.on('connect', () => {
      socket1.emit('joinRoom', { playerName: 'host', roomName, action: 'create' })
    })

    socket2.on('connect', () => {
      socket2.emit('joinRoom', { playerName: 'guest', roomName, action: 'join' })
    })

    socket2.on('playerJoined', () => {
      socket2.emit('leaveRoom', { roomName }, (res) => {
        try {
          expect(res && res.ok).to.equal(true)
          socket2.close()
          socket1.emit('leaveRoom', { roomName }, (res2) => {
            try {
              expect(res2 && res2.ok).to.equal(true)
              cleanUp()
              done()
            } catch (err) {
              cleanUp()
              done(err)
            }
          })
        } catch (err) {
          cleanUp()
          done(err)
        }
      })
    })
  })
})

