import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io('http://127.0.0.1:3004/');
  } else if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export default getSocket;
