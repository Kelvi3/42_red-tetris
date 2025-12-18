import { describe, it, expect } from 'vitest'
import { createBoard, checkCollision } from '../gameHelper'
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants'

describe('gameHelper', () => {
  it('createBoard returns correct dimensions filled with null', () => {
    const b = createBoard()
    expect(Array.isArray(b)).toBe(true)
    expect(b.length).toBe(BOARD_HEIGHT)
    for (const row of b) {
      expect(Array.isArray(row)).toBe(true)
      expect(row.length).toBe(BOARD_WIDTH)
      for (const cell of row) expect(cell).toBeNull()
    }
  })

  it('checkCollision: valid move in empty space should not collide', () => {
    const board = createBoard()
    const player = {
      tetromino: [[1]],
      pos: { x: 3, y: 0 }
    }
    const collided = checkCollision(player as any, board as any, { x: 0, y: 0 })
    expect(collided).toBe(false)
  })

  it('checkCollision: collision with left wall', () => {
    const board = createBoard()
    const player = {
      tetromino: [[1]],
      pos: { x: 0, y: 0 }
    }
    const collided = checkCollision(player as any, board as any, { x: -1, y: 0 })
    expect(collided).toBe(true)
  })

  it('checkCollision: collision with right wall', () => {
    const board = createBoard()
    const player = {
      tetromino: [[1]],
      pos: { x: BOARD_WIDTH - 1, y: 0 }
    }
    const collided = checkCollision(player as any, board as any, { x: 1, y: 0 })
    expect(collided).toBe(true)
  })

  it('checkCollision: collision with floor', () => {
    const board = createBoard()
    const player = {
      tetromino: [[1]],
      pos: { x: 3, y: BOARD_HEIGHT - 1 }
    }
    const collided = checkCollision(player as any, board as any, { x: 0, y: 1 })
    expect(collided).toBe(true)
  })

  it('checkCollision: collision with placed block', () => {
    const board = createBoard()

    board[5][5] = 'X'
    const player = {
      tetromino: [[1]],
      pos: { x: 5, y: 4 }
    }
    const collided = checkCollision(player as any, board as any, { x: 0, y: 1 })
    expect(collided).toBe(true)
  })
})
