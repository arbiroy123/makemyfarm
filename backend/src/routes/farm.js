import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';
import { checkSubscriptionLimit } from '../middleware/checkSubscriptionLimit.js';

const router = express.Router();

// Create a new farm
router.post('/', authenticateToken, async (req, res) => {
  try {
    const limit = await checkSubscriptionLimit(req.user.userId, 'farm');
    if (!limit.allowed) {
      return res.status(403).json({ error: limit.message, upgradeRequired: true });
    }

    const { name, description, farmType, sizeSqft, latitude, longitude, address, climateZone } = req.body;
    const farmId = uuidv4();

    let result;
    try {
      // Try with PostGIS geography column first
      result = await query(
        `INSERT INTO farms (id, owner_id, name, description, farm_type, size_sqft, location, address, climate_zone)
         VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326), $9, $10)
         RETURNING *`,
        [farmId, req.user.userId, name, description, farmType, sizeSqft, longitude, latitude, address, climateZone]
      );
    } catch (geoErr) {
      // Fallback: insert without PostGIS location (stores other data, location left null)
      console.warn('PostGIS unavailable, inserting farm without geolocation:', geoErr.message);
      result = await query(
        `INSERT INTO farms (id, owner_id, name, description, farm_type, size_sqft, address, climate_zone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [farmId, req.user.userId, name, description, farmType, sizeSqft, address, climateZone]
      );
    }

    // Add owner as collaborator
    await query(
      `INSERT INTO farm_collaborators (farm_id, user_id, role) VALUES ($1, $2, $3)`,
      [farmId, req.user.userId, 'owner']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Farm creation error:', error.message);
    res.status(500).json({
      error: 'Failed to create farm',
      detail: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
});

// Get user's farms
router.get('/my-farms', authenticateToken, async (req, res) => {
  try {
    let result;
    try {
      result = await query(
        `SELECT f.*,
                ST_AsGeoJSON(f.location) as location_geojson,
                COUNT(DISTINCT fc.user_id) as collaborator_count
         FROM farms f
         JOIN farm_collaborators fc ON f.id = fc.farm_id
         WHERE fc.user_id = $1
         GROUP BY f.id
         ORDER BY f.created_at DESC`,
        [req.user.userId]
      );
    } catch {
      // PostGIS unavailable — fall back to query without geo function
      result = await query(
        `SELECT f.*,
                COUNT(DISTINCT fc.user_id) as collaborator_count
         FROM farms f
         JOIN farm_collaborators fc ON f.id = fc.farm_id
         WHERE fc.user_id = $1
         GROUP BY f.id
         ORDER BY f.created_at DESC`,
        [req.user.userId]
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Fetch farms error:', error.message);
    res.status(500).json({ error: 'Failed to fetch farms' });
  }
});

// Get single farm details
router.get('/:farmId', async (req, res) => {
  try {
    const result = await query(
      `SELECT f.*, ST_AsGeoJSON(f.location) as location_geojson
       FROM farms f
       WHERE f.id = $1`,
      [req.params.farmId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Farm not found' });
    }

    // Get collaborators
    const collaborators = await query(
      `SELECT fc.user_id, u.first_name, u.last_name, u.email, fc.role
       FROM farm_collaborators fc
       JOIN users u ON fc.user_id = u.id
       WHERE fc.farm_id = $1`,
      [req.params.farmId]
    );

    res.json({
      ...result.rows[0],
      collaborators: collaborators.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch farm' });
  }
});

// Update farm
router.put('/:farmId', authenticateToken, async (req, res) => {
  try {
    const { name, description, farmType, sizeSqft, climateZone, isPublic } = req.body;

    // Check ownership
    const ownerCheck = await query(
      `SELECT * FROM farm_collaborators WHERE farm_id = $1 AND user_id = $2 AND role = 'owner'`,
      [req.params.farmId, req.user.userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this farm' });
    }

    const result = await query(
      `UPDATE farms 
       SET name = $2, description = $3, farm_type = $4, size_sqft = $5, climate_zone = $6, is_public = $7
       WHERE id = $1
       RETURNING *`,
      [req.params.farmId, name, description, farmType, sizeSqft, climateZone, isPublic]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update farm' });
  }
});

// Add collaborator to farm
router.post('/:farmId/collaborators', authenticateToken, async (req, res) => {
  try {
    const { email, role } = req.body;

    // Verify ownership
    const ownerCheck = await query(
      `SELECT * FROM farm_collaborators WHERE farm_id = $1 AND user_id = $2 AND role = 'owner'`,
      [req.params.farmId, req.user.userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to add collaborators' });
    }

    // Find user by email
    const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add as collaborator
    const result = await query(
      `INSERT INTO farm_collaborators (farm_id, user_id, role) VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.farmId, userResult.rows[0].id, role || 'contributor']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// Season report — crop counts, total yield, best performers
router.get('/:farmId/season-report', authenticateToken, async (req, res) => {
  try {
    const farmAccess = await query(
      `SELECT 1 FROM farm_collaborators WHERE farm_id = $1 AND user_id = $2`,
      [req.params.farmId, req.user.userId]
    );
    if (farmAccess.rows.length === 0) return res.status(403).json({ error: 'Not authorized' });

    const counts = await query(
      `SELECT status, COUNT(*) as count FROM crops WHERE farm_id = $1 GROUP BY status`,
      [req.params.farmId]
    );
    const totalYield = await query(
      `SELECT COALESCE(SUM(yield_quantity), 0) as total FROM crops WHERE farm_id = $1 AND status = 'harvested'`,
      [req.params.farmId]
    );
    const topCrops = await query(
      `SELECT v.name as vegetable_name, SUM(c.yield_quantity) as total_yield, COUNT(*) as times_planted
       FROM crops c JOIN vegetables v ON c.vegetable_id = v.id
       WHERE c.farm_id = $1 AND c.status = 'harvested'
       GROUP BY v.name ORDER BY total_yield DESC NULLS LAST LIMIT 5`,
      [req.params.farmId]
    );

    const statusMap = {};
    counts.rows.forEach(r => { statusMap[r.status] = parseInt(r.count); });
    const total = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const harvested = statusMap['harvested'] || 0;
    const failed = statusMap['failed'] || 0;
    const successRate = total > 0 ? Math.round((harvested / total) * 100) : 0;

    res.json({
      counts: statusMap,
      total,
      harvested,
      failed,
      totalYieldKg: parseFloat(totalYield.rows[0].total) || 0,
      successRate,
      topCrops: topCrops.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate season report' });
  }
});

// Get farm activity log (for real-time updates)
router.get('/:farmId/activity', async (req, res) => {
  try {
    const result = await query(
      `SELECT al.*, u.first_name, u.last_name
       FROM activity_log al
       JOIN users u ON al.user_id = u.id
       WHERE al.farm_id = $1
       ORDER BY al.created_at DESC
       LIMIT 50`,
      [req.params.farmId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

export default router;
