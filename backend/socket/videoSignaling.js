const videoRooms = new Map();

export const initVideoSignaling = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-room', ({ meetingId, userId, userName }) => {
      socket.join(meetingId);
      socket.data.userId = userId;
      socket.data.userName = userName;
      socket.data.meetingId = meetingId;

      if (!videoRooms.has(meetingId)) {
        videoRooms.set(meetingId, new Set());
      }
      videoRooms.get(meetingId).add(socket.id);

      const roomSize = videoRooms.get(meetingId).size;
      console.log(`User ${userName} joined room ${meetingId}. Room size: ${roomSize}`);

      socket.to(meetingId).emit('user-joined', {
        socketId: socket.id,
        userId,
        userName,
      });

      if (roomSize === 2) {
        socket.emit('ready-to-call', { roomSize });
      }
    });

    socket.on('offer', ({ meetingId, offer }) => {
      socket.to(meetingId).emit('offer', { offer, fromSocketId: socket.id });
    });

    socket.on('answer', ({ meetingId, answer }) => {
      socket.to(meetingId).emit('answer', { answer, fromSocketId: socket.id });
    });

    socket.on('ice-candidate', ({ meetingId, candidate }) => {
      socket.to(meetingId).emit('ice-candidate', { candidate, fromSocketId: socket.id });
    });

    socket.on('toggle-media', ({ meetingId, audio, video }) => {
      socket.to(meetingId).emit('peer-toggle-media', {
        socketId: socket.id,
        audio,
        video,
      });
    });

    socket.on('leave-room', ({ meetingId }) => {
      handleLeave(socket, meetingId, io);
    });

    socket.on('disconnect', () => {
      if (socket.data.meetingId) {
        handleLeave(socket, socket.data.meetingId, io);
      }
      console.log('Socket disconnected:', socket.id);
    });
  });
};

function handleLeave(socket, meetingId, io) {
  socket.leave(meetingId);
  if (videoRooms.has(meetingId)) {
    videoRooms.get(meetingId).delete(socket.id);
    if (videoRooms.get(meetingId).size === 0) {
      videoRooms.delete(meetingId);
    }
  }
  socket.to(meetingId).emit('peer-left', {
    socketId: socket.id,
    userId: socket.data.userId,
  });
  console.log(`User ${socket.data.userName} left room ${meetingId}`);
}