import { Server, Socket } from 'socket.io';

// Extend the Socket type to include the emitToUser method
// declare module 'socket.io' {
//   interface Socket {
//     emitToUser(userId: string, event: string, data: any): void;
//   }
// }

const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected');


    // On disconnect, clean up
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

export const socketHelper = { socket };