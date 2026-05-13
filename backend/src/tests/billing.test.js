import { jest } from '@jest/globals';

process.env.JWT_SECRET = 'test-secret-farmsync-2025';
process.env.JWT_EXPIRE = '1h';
process.env.STRIPE_PRO_PRICE_ID_IN = 'price_test_india';
process.env.STRIPE_PRO_PRICE_ID_US = 'price_test_usa';

const mockQuery = jest.fn();
jest.unstable_mockModule('../database/connection.js', () => ({
  query: mockQuery,
  connectDatabase: jest.fn(),
  getPool: jest.fn(),
}));

jest.unstable_mockModule('../email/mailer.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({}),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({}),
}));

const { default: express } = await import('express');
const { default: request } = await import('supertest');
const { authenticateToken } = await import('../routes/auth.js');
const { default: billingRoutes } = await import('../routes/billing.js');
const { default: jwt } = await import('jsonwebtoken');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/billing', billingRoutes);
  return app;
}

function makeToken(userId = 'user-123', email = 'test@farmsync.com') {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

beforeEach(() => mockQuery.mockReset());

describe('GET /api/billing/status', () => {
  test('free Indian user gets ₹99 price and isPro=false', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        subscription_tier: 'free',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_expires_at: null,
        country_code: 'IN',
      }],
    });

    const res = await request(buildApp())
      .get('/api/billing/status')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.isPro).toBe(false);
    expect(res.body.price).toBe('₹99');
    expect(res.body.currency).toBe('INR');
    expect(res.body.country).toBe('IN');
    expect(res.body.limits.farms).toBe(1);
    expect(res.body.limits.crops).toBe(5);
  });

  test('pro US user gets $4.99 price and isPro=true', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        subscription_tier: 'pro',
        stripe_customer_id: 'cus_test',
        stripe_subscription_id: 'sub_test',
        subscription_expires_at: null,
        country_code: 'US',
      }],
    });

    const res = await request(buildApp())
      .get('/api/billing/status')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.isPro).toBe(true);
    expect(res.body.price).toBe('$4.99');
    expect(res.body.currency).toBe('USD');
    expect(res.body.limits.farms).toBeNull();
    expect(res.body.limits.crops).toBeNull();
  });

  test('returns 401 without auth token', async () => {
    const res = await request(buildApp()).get('/api/billing/status');
    expect(res.status).toBe(401);
  });

  test('returns 404 when user not found in DB', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(buildApp())
      .get('/api/billing/status')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(404);
  });

  test('falls back to IN pricing for unknown country code', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        subscription_tier: 'free',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_expires_at: null,
        country_code: 'XX',
      }],
    });

    const res = await request(buildApp())
      .get('/api/billing/status')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.price).toBe('₹99');
  });
});

describe('GET /api/ads/banner', () => {
  test('returns Indian banner for IN country', async () => {
    const { default: adsRoutes } = await import('../routes/ads.js');
    const app = express();
    app.use('/api/ads', adsRoutes);

    const res = await request(app).get('/api/ads/banner?country=IN');

    expect(res.status).toBe(200);
    expect(res.body.emoji).toBeDefined();
    expect(res.body.title).toBeDefined();
    expect(res.body.url).toMatch(/amazon\.in|iffco|flipkart/i);
  });

  test('returns US banner for US country', async () => {
    const { default: adsRoutes } = await import('../routes/ads.js');
    const app = express();
    app.use('/api/ads', adsRoutes);

    const res = await request(app).get('/api/ads/banner?country=US');

    expect(res.status).toBe(200);
    expect(res.body.url).toMatch(/burpee|johnnyseeds|amazon\.com/i);
  });

  test('defaults to IN banner for unsupported country', async () => {
    const { default: adsRoutes } = await import('../routes/ads.js');
    const app = express();
    app.use('/api/ads', adsRoutes);

    const res = await request(app).get('/api/ads/banner?country=FR');
    expect(res.status).toBe(200);
    expect(res.body.url).toMatch(/amazon\.in|iffco|flipkart/i);
  });
});
