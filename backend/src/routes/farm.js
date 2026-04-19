import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create a new farm
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, farmType, sizeSqft, latitude, longitude, address, climateZone } = req.body;
    const farmId = uuidv4();

    const result = await query(
      `INSERT INTO farms (id, owner_id, name, description, farm_type, size_sqft, location, address, climate_zone)
       VALUES ($1, $2, $3, $4, $5, $6, ST_GeomFromText('POINT($7 $8)', 4326), $9, $10)
       RETURNING *`,
      [farmId, req.user.userId, name, description, farmType, sizeSqft, longitude, latitude, address, climateZone]
    );

    // Add owner as collaborator
    await query(
      `INSERT INTO farm_collaborators (farm_id, user_id, role) VALUES ($1, $2, $3)`,
      [farmId, req.user.userId, 'owner']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create farm' });
  }
});

// Get user's farms
router.get('/my-farms', authenticateToken, async (req, res) => {
  try {
    const result = await query(
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

    res.json(result.rows);
  } catch (error) {
    console.error(error);
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
