import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Routes
import authRoutes from './routes/auth.js';
import farmRoutes from './routes/farm.js';
import cropRoutes from './routes/crop.js';
import communityRoutes from './routes/community.js';
import recommendationRoutes from './routes/recommendations.js';
import mapRoutes from './routes/map.js';
import syncRoutes from './routes/sync.js';

// Real-time handlers
import { setupSocketHandlers } from './realtime/socketHandlers.js';

// Database
import { connectDatabase } from './database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/sync', syncRoutes);

// Socket.io Real-time Handlers
setupSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Database initialization and server start
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✓ Database connected');

    // Start server
    server.listen(PORT, () => {
      console.log(`🌱 FarmSync Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

export { io };
