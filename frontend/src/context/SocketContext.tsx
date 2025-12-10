import React, { createContext, useCallback, useContext, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type SocketContextType = {
  socket: Socket | null;
  connect: () => Socket;
  disconnect: () => void;
  leaveRoom: (roomName?: string) => Promise<any>;
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const connect = useCallback(() => {
    if (!socket) {
      const s = io('http://127.0.0.1:3004/');
      setSocket(s);
      return s;
    }
    if (!socket.connected) socket.connect();
    return socket;
  }, [socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      try {
        socket.disconnect();
      } catch (e) {
        // ignore
      }
      setSocket(null);
    }
  }, [socket]);

  const leaveRoom = useCallback((roomName?: string) => {
    return new Promise((resolve) => {
      if (socket && roomName) {
        try {
          socket.emit('leaveRoom', { roomName }, (res: any) => {
            resolve(res);
            try { socket.disconnect(); } catch (e) {}
            setSocket(null);
          });
        } catch (err) {
          resolve({ ok: false, error: err });
        }
      } else {
        resolve({ ok: false, reason: 'no socket or no room' });
      }
    });
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, connect, disconnect, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export default SocketContext;
