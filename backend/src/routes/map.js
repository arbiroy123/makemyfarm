import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get nearby public farms (within radius)
router.get('/nearby-farms', async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const result = await query(
      `SELECT f.id, f.name, f.farm_type, f.size_sqft, ST_AsGeoJSON(f.location) as location,
              f.address, f.climate_zone, u.first_name, u.last_name,
              ST_Distance(f.location, ST_GeomFromText('POINT($2 $1)', 4326)) / 1000 as distance_km
       FROM farms f
       JOIN users u ON f.owner_id = u.id
       WHERE f.is_public = TRUE
       AND ST_DWithin(f.location, ST_GeomFromText('POINT($2 $1)', 4326), $3 * 1000)
       ORDER BY distance_km
       LIMIT 50`,
      [latitude, longitude, radiusKm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch nearby farms' });
  }
});

// Get nearby community groups
router.get('/nearby-groups', async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const result = await query(
      `SELECT cg.id, cg.name, cg.description, ST_AsGeoJSON(cg.location) as location,
              cg.address, cg.member_count,
              ST_Distance(cg.location, ST_GeomFromText('POINT($2 $1)', 4326)) / 1000 as distance_km
       FROM community_groups cg
       WHERE cg.is_active = TRUE
       AND ST_DWithin(cg.location, ST_GeomFromText('POINT($2 $1)', 4326), $3 * 1000)
       ORDER BY distance_km
       LIMIT 50`,
      [latitude, longitude, radiusKm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch nearby groups' });
  }
});

// Update user location
router.put('/update-location', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    await query(
      `UPDATE users 
       SET location = ST_GeomFromText('POINT($2 $1)', 4326)
       WHERE id = $3`,
      [latitude, longitude, req.user.userId]
    );

    res.json({ message: 'Location updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

export default router;
