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

export default router;
