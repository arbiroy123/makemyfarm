import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Middleware: must be authenticated AND is_admin = true in DB (never trust JWT alone for this)
function requireAdmin(req, res, next) {
  authenticateToken(req, res, async () => {
    try {
      const result = await query('SELECT is_admin FROM users WHERE id = $1', [req.user.userId]);
      if (!result.rows[0]?.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  });
}

// GET /admin/stats — top-line numbers for dashboard cards
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        (SELECT COUNT(*) FROM users)::int                                                         AS total_users,
        (SELECT COUNT(*) FROM farms)::int                                                         AS total_farms,
        (SELECT COUNT(*) FROM crops WHERE status IN ('planted','growing','flowering','fruiting'))::int AS active_crops,
        (SELECT COUNT(*) FROM crops WHERE status = 'harvested')::int                             AS total_harvested,
        (SELECT COUNT(*) FROM vegetable_requests WHERE status = 'pending')::int                  AS pending_requests,
        (SELECT COUNT(*) FROM community_groups WHERE is_active = TRUE)::int                      AS active_groups
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /admin/activity — recent activity feed across all users
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT al.id, al.action, al.details, al.created_at,
             u.first_name, u.last_name,
             f.name AS farm_name
      FROM activity_log al
      JOIN users u ON al.user_id = u.id
      LEFT JOIN farms f ON al.farm_id = f.id
      ORDER BY al.created_at DESC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// GET /admin/vegetable-requests — all requests with submitter info, pending first
router.get('/vegetable-requests', requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT vr.id, vr.vegetable_name, vr.description, vr.reason,
             vr.status, vr.created_at,
             u.first_name, u.last_name, u.email
      FROM vegetable_requests vr
      JOIN users u ON vr.user_id = u.id
      ORDER BY
        CASE WHEN vr.status = 'pending' THEN 0 ELSE 1 END,
        vr.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vegetable requests' });
  }
});

// PUT /admin/vegetable-requests/:id/status — approve or reject
router.put('/vegetable-requests/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
    }

    const result = await query(
      `UPDATE vegetable_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, vegetable_name, status, updated_at`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// GET /admin/users — all users with farm + crop counts
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT
        u.id, u.email, u.first_name, u.last_name,
        u.experience_level, u.is_admin, u.created_at,
        COUNT(DISTINCT f.id)::int AS farm_count,
        COUNT(DISTINCT c.id)::int AS crop_count
      FROM users u
      LEFT JOIN farms f ON f.owner_id = u.id
      LEFT JOIN crops c ON c.farm_id = f.id
      GROUP BY u.id, u.email, u.first_name, u.last_name,
               u.experience_level, u.is_admin, u.created_at
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /admin/users/:id/tier — set subscription tier (for testing)
router.put('/users/:id/tier', requireAdmin, async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['free', 'pro', 'community'].includes(tier)) {
      return res.status(400).json({ error: 'tier must be free, pro, or community' });
    }

    const result = await query(
      `UPDATE users SET subscription_tier = $1 WHERE id = $2
       RETURNING id, email, subscription_tier`,
      [tier, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update tier' });
  }
});

// POST /admin/seed-test-user — create/reset test Pro account (dev convenience)
router.post('/seed-test-user', requireAdmin, async (req, res) => {
  try {
    const bcrypt = (await import('bcryptjs')).default;
    const { v4: uuidv4 } = await import('uuid');

    const email  = 'testpro@farmsync.app';
    const pwHash = await bcrypt.hash('TestPro@123', 12);

    // Upsert user
    const upsert = await query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name,
          experience_level, country_code, subscription_tier)
       VALUES ($1,$2,$3,'Test','Pro','intermediate','IN','pro')
       ON CONFLICT (email) DO UPDATE
         SET subscription_tier = 'pro', first_name = 'Test', last_name = 'Pro'
       RETURNING id, email, subscription_tier`,
      [uuidv4(), email, pwHash]
    );

    const userId = upsert.rows[0].id;

    // Ensure at least one farm exists for testing
    const farmCheck = await query('SELECT id FROM farms WHERE owner_id = $1 LIMIT 1', [userId]);
    if (farmCheck.rows.length === 0) {
      const farmId = uuidv4();
      await query(
        `INSERT INTO farms (id, owner_id, name, description, farm_type, size_sqft,
            location, address, climate_zone)
         VALUES ($1,$2,'Test Backyard','Auto-seeded test farm','backyard',80,
            ST_SetSRID(ST_MakePoint(72.8777,19.0760),4326),'Mumbai, India','Subtropical')`,
        [farmId, userId]
      );
      await query(
        `INSERT INTO farm_collaborators (farm_id, user_id, role) VALUES ($1,$2,'owner')`,
        [farmId, userId]
      );
    }

    res.json({
      message: 'Test Pro user ready',
      email,
      password: 'TestPro@123',
      tier: 'pro',
      userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to seed test user' });
  }
});

export default router;
