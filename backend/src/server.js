import express from 'express';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// node-cron loaded dynamically so the server starts even if the package is not yet in the container volume

// Routes
import authRoutes from './routes/auth.js';
import farmRoutes from './routes/farm.js';
import cropRoutes from './routes/crop.js';
import communityRoutes from './routes/community.js';
import recommendationRoutes from './routes/recommendations.js';
import mapRoutes from './routes/map.js';
import syncRoutes from './routes/sync.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes, { runWeatherAlerts, runDailyGrowTips, runFrostAlerts } from './routes/notifications.js';
import diseaseRoutes from './routes/disease.js';
import achievementsRoutes from './routes/achievements.js';
import calendarRoutes from './routes/calendar.js';
import marketplaceRoutes from './routes/marketplace.js';
import plannerRoutes from './routes/planner.js';
import chatbotRoutes from './routes/chatbot.js';
import financialsRoutes from './routes/financials.js';
import schemesRoutes from './routes/schemes.js';
import billingRoutes from './routes/billing.js';
import adsRoutes from './routes/ads.js';
import taskRoutes from './routes/tasks.js';
import storiesRoutes from './routes/stories.js';
import successionRoutes from './routes/succession.js';
import rateLimit from 'express-rate-limit';

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

// Stripe webhook needs raw body — must be registered BEFORE express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || false,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' },
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

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
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/financials', financialsRoutes);
app.use('/api/schemes', schemesRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/succession', successionRoutes);

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
    await connectDatabase();
    console.log('✓ Database connected');

    server.listen(PORT, () => {
      console.log(`🌱 FarmSync Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

    // Scheduled cron jobs
    try {
      const { default: cron } = await import('node-cron');

      // 7 AM — daily grow tips push
      cron.schedule('0 7 * * *', async () => {
        console.log('Running daily grow tips...');
        await runDailyGrowTips();
      });

      // 6 PM — frost & weather alerts for growing crops
      cron.schedule('0 18 * * *', async () => {
        console.log('Running frost/weather alerts...');
        await runFrostAlerts();
      });

      // 8 PM — harvest-ready weather check (existing)
      cron.schedule('0 20 * * *', async () => {
        console.log('Running harvest weather alerts...');
        await runWeatherAlerts();
      });

      console.log('✓ Crons scheduled: grow tips (7 AM), frost alerts (6 PM), weather alerts (8 PM)');
    } catch {
      console.warn('⚠ node-cron not available — scheduled jobs disabled (run: npm install node-cron)');
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

export { io };
