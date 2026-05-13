import { jest } from '@jest/globals';

process.env.JWT_SECRET = 'test-secret-farmsync-2025';
process.env.JWT_EXPIRE = '1h';

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
const { default: farmRoutes } = await import('../routes/farm.js');
const { default: jwt } = await import('jsonwebtoken');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/farms', farmRoutes);
  return app;
}

function makeToken(userId = 'user-test-uuid', email = 'test@farmsync.com') {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

const SAMPLE_FARM = {
  id: 'farm-uuid-1234',
  owner_id: 'user-test-uuid',
  name: 'My Backyard',
  description: 'Test farm',
  farm_type: 'backyard',
  size_sqft: 400,
  climate_zone: 'tropical',
  collaborator_count: '1',
  created_at: new Date().toISOString(),
};

beforeEach(() => mockQuery.mockReset());

describe('GET /api/farms/my-farms', () => {
  test('returns list of farms for authenticated user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [SAMPLE_FARM] });

    const res = await request(buildApp())
      .get('/api/farms/my-farms')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('My Backyard');
  });

  test('returns empty array when user has no farms', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(buildApp())
      .get('/api/farms/my-farms')
      .set('Authorization', `Bearer ${makeToken()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('returns 401 without token', async () => {
    const res = await request(buildApp()).get('/api/farms/my-farms');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/farms', () => {
  test('creates a farm for a free user under limit', async () => {
    // checkSubscriptionLimit: SELECT subscription_tier → free user, 0 existing farms
    mockQuery.mockResolvedValueOnce({ rows: [{ subscription_tier: 'free' }] });
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '0' }] }); // farm count
    // INSERT farm
    mockQuery.mockResolvedValueOnce({ rows: [SAMPLE_FARM] });
    // INSERT collaborator
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(buildApp())
      .post('/api/farms')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        name: 'My Backyard',
        description: 'Test farm',
        farmType: 'backyard',
        sizeSqft: 400,
        latitude: 28.6139,
        longitude: 77.2090,
        climateZone: 'tropical',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('My Backyard');
  });

  test('blocks farm creation when free tier limit reached', async () => {
    // checkSubscriptionLimit: free user, already at 1 farm
    mockQuery.mockResolvedValueOnce({ rows: [{ subscription_tier: 'free' }] });
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const res = await request(buildApp())
      .post('/api/farms')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({ name: 'Second Farm', farmType: 'backyard', sizeSqft: 100 });

    expect(res.status).toBe(403);
    expect(res.body.upgradeRequired).toBe(true);
  });

  test('pro user can create farms without limit', async () => {
    // checkSubscriptionLimit: pro user → always allowed
    mockQuery.mockResolvedValueOnce({ rows: [{ subscription_tier: 'pro' }] });
    // INSERT farm
    mockQuery.mockResolvedValueOnce({ rows: [SAMPLE_FARM] });
    // INSERT collaborator
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(buildApp())
      .post('/api/farms')
      .set('Authorization', `Bearer ${makeToken()}`)
      .send({
        name: 'My Backyard',
        farmType: 'backyard',
        sizeSqft: 400,
        latitude: 28.6,
        longitude: 77.2,
      });

    expect(res.status).toBe(201);
  });
});
