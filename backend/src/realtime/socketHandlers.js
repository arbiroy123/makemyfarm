import { query } from '../database/connection.js';

export function setupSocketHandlers(io) {
  const activeFarmUsers = {}; // Track active users per farm

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join farm room
    socket.on('join-farm', async (farmId, userId) => {
      socket.join(`farm-${farmId}`);

      if (!activeFarmUsers[farmId]) {
        activeFarmUsers[farmId] = [];
      }
      activeFarmUsers[farmId].push({ userId, socketId: socket.id });

      // Notify others of active users
      io.to(`farm-${farmId}`).emit('active-users', {
        count: activeFarmUsers[farmId].length,
        users: activeFarmUsers[farmId]
      });
    });

    // Real-time crop update
    socket.on('crop-updated', async (farmId, cropData) => {
      io.to(`farm-${farmId}`).emit('crop-updated', cropData);

      // Log activity
      await query(
        `INSERT INTO activity_log (farm_id, user_id, action, details)
         VALUES ($1, $2, 'crop_updated', $3)`,
        [farmId, cropData.updatedBy, JSON.stringify(cropData)]
      );
    });

    // Real-time comment on farm activity
    socket.on('farm-comment', (farmId, comment) => {
      io.to(`farm-${farmId}`).emit('farm-comment', comment);
    });

    // Real-time collaboration - multiple users editing
    socket.on('user-editing', (farmId, editData) => {
      socket.broadcast.to(`farm-${farmId}`).emit('user-editing', editData);
    });

    // Leave farm
    socket.on('leave-farm', (farmId, userId) => {
      socket.leave(`farm-${farmId}`);
      if (activeFarmUsers[farmId]) {
        activeFarmUsers[farmId] = activeFarmUsers[farmId].filter(
          u => u.socketId !== socket.id
        );
      }

      io.to(`farm-${farmId}`).emit('active-users', {
        count: activeFarmUsers[farmId]?.length || 0,
        users: activeFarmUsers[farmId] || []
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);

      // Clean up from all farm rooms
      for (const farmId in activeFarmUsers) {
        activeFarmUsers[farmId] = activeFarmUsers[farmId].filter(
          u => u.socketId !== socket.id
        );
      }
    });
  });
}
