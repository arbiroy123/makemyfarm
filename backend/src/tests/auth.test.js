import { jest } from '@jest/globals';

// Must be set before JWT signs a token
process.env.JWT_SECRET = 'test-secret-farmsync-2025';
process.env.JWT_EXPIRE = '1h';

// Mock DB and email BEFORE importing routes that use them
const mockQuery = jest.fn();
jest.unstable_mockModule('../database/connection.js', () => ({
  query: mockQuery,
  connectDatabase: jest.fn().mockResolvedValue({}),
  getPool: jest.fn(),
}));

jest.unstable_mockModule('../email/mailer.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({}),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({}),
}));

const { default: express } = await import('express');
const { default: request } = await import('supertest');
const { default: authRoutes } = await import('../routes/auth.js');

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

const TEST_USER = {
  id: 'user-test-uuid-1234',
  email: 'test@farmsync.com',
  first_name: 'Test',
  last_name: 'User',
  experience_level: 'beginner',
  country_code: 'IN',
  subscription_tier: 'free',
  password_hash: '$2a$12$hashedpassword',
};

beforeEach(() => mockQuery.mockReset());

// ── Registration ──────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  test('creates a new user and returns token', async () => {
    // No existing user found
    mockQuery.mockResolvedValueOnce({ rows: [] });
    // INSERT returns the new user
    mockQuery.mockResolvedValueOnce({ rows: [TEST_USER] });

    const res = await request(buildApp())
      .post('/api/auth/register')
      .send({
        email: 'test@farmsync.com',
        password: 'Password1',
        firstName: 'Test',
        lastName: 'User',
        countryCode: 'IN',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('test@farmsync.com');
  });

  test('rejects duplicate email with 409', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'existing-id' }] });

    const res = await request(buildApp())
      .post('/api/auth/register')
      .send({ email: 'test@farmsync.com', password: 'Password1' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already registered/i);
  });

  test('rejects malformed email with 400', async () => {
    const res = await request(buildApp())
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'Password1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid email/i);
  });

  test('rejects weak password with 400', async () => {
    const res = await request(buildApp())
      .post('/api/auth/register')
      .send({ email: 'test@farmsync.com', password: 'weak' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/password/i);
  });

  test('defaults country_code to IN when unsupported code provided', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    mockQuery.mockResolvedValueOnce({ rows: [{ ...TEST_USER, country_code: 'IN' }] });

    const res = await request(buildApp())
      .post('/api/auth/register')
      .send({
        email: 'test@farmsync.com',
        password: 'Password1',
        countryCode: 'ZZ',
      });

    expect(res.status).toBe(201);
    const insertCall = mockQuery.mock.calls[1];
    // country 'ZZ' should have been sanitised to 'IN' before the INSERT
    expect(insertCall[1]).toContain('IN');
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  test('returns token for valid credentials', async () => {
    const { default: bcrypt } = await import('bcryptjs');
    const hash = await bcrypt.hash('Password1', 1);

    mockQuery.mockResolvedValueOnce({
      rows: [{ ...TEST_USER, password_hash: hash, is_verified: true }],
    });

    const res = await request(buildApp())
      .post('/api/auth/login')
      .send({ email: 'test@farmsync.com', password: 'Password1' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('returns 401 for wrong password', async () => {
    const { default: bcrypt } = await import('bcryptjs');
    const hash = await bcrypt.hash('CorrectPass1', 1);

    mockQuery.mockResolvedValueOnce({
      rows: [{ ...TEST_USER, password_hash: hash }],
    });

    const res = await request(buildApp())
      .post('/api/auth/login')
      .send({ email: 'test@farmsync.com', password: 'WrongPass1' });

    expect(res.status).toBe(401);
  });

  test('returns 401 for unknown email', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(buildApp())
      .post('/api/auth/login')
      .send({ email: 'nobody@farmsync.com', password: 'Password1' });

    expect(res.status).toBe(401);
  });

  test('returns 400 when email or password missing', async () => {
    const res = await request(buildApp())
      .post('/api/auth/login')
      .send({ email: 'test@farmsync.com' });

    expect(res.status).toBe(400);
  });
});

// ── Profile ───────────────────────────────────────────────────────────────────

describe('GET /api/auth/profile', () => {
  test('returns user profile with valid token', async () => {
    const { default: jwt } = await import('jsonwebtoken');
    const token = jwt.sign(
      { userId: TEST_USER.id, email: TEST_USER.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    mockQuery.mockResolvedValueOnce({ rows: [TEST_USER] });

    const res = await request(buildApp())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(TEST_USER.email);
  });

  test('returns 401 without token', async () => {
    const res = await request(buildApp()).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  test('returns 403 with tampered token', async () => {
    const res = await request(buildApp())
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiJ9.tampered.signature');
    expect(res.status).toBe(403);
  });
});
