import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get vegetable recommendations based on climate, season, and difficulty
router.get('/vegetables', authenticateToken, async (req, res) => {
  try {
    const { climateZone, season, difficulty } = req.query;

    let sql = `SELECT * FROM vegetables WHERE 1=1`;
    const params = [];

    if (climateZone) {
      sql += ` AND $${params.length + 1} = ANY(climate_zones)`;
      params.push(climateZone);
    }

    if (season) {
      sql += ` AND season = $${params.length + 1}`;
      params.push(season);
    }

    if (difficulty) {
      sql += ` AND difficulty_level = $${params.length + 1}`;
      params.push(difficulty);
    }

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get care guide for a specific vegetable
router.get('/vegetable/:vegetableId', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, scientific_name, difficulty_level, days_to_harvest, spacing_cm,
              min_temp_celsius, optimal_temp_celsius, max_temp_celsius, 
              water_frequency_days, sunlight_hours, soil_type, ph_min, ph_max,
              season, climate_zones, can_greenhouse, yields_per_plant,
              planting_tips, care_tips, pest_diseases, companion_plants
       FROM vegetables WHERE id = $1`,
      [req.params.vegetableId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vegetable not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vegetable guide' });
  }
});

// Get seasonal recommendations for user's location
router.get('/seasonal', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT timezone FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get current season based on user's timezone (simplified)
    const currentMonth = new Date().getMonth();
    let season = 'spring';
    if (currentMonth >= 3 && currentMonth < 6) season = 'spring';
    else if (currentMonth >= 6 && currentMonth < 9) season = 'summer';
    else if (currentMonth >= 9 && currentMonth < 12) season = 'fall';
    else season = 'winter';

    // Get user's farms for climate zones
    const farmsResult = await query(
      `SELECT DISTINCT climate_zone FROM farms WHERE owner_id = $1`,
      [req.user.userId]
    );

    const climateZones = farmsResult.rows.map(f => f.climate_zone);

    // Recommend vegetables
    let sql = `SELECT * FROM vegetables WHERE season ILIKE $1`;
    const params = [season];

    if (climateZones.length > 0) {
      sql += ` AND (`;
      for (let i = 0; i < climateZones.length; i++) {
        if (i > 0) sql += ` OR `;
        sql += `$${params.length + 1} = ANY(climate_zones)`;
        params.push(climateZones[i]);
      }
      sql += `)`;
    }

    const recommendations = await query(sql, params);

    res.json({
      season,
      climateZones,
      recommendations: recommendations.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get all vegetables (database)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, scientific_name, difficulty_level, days_to_harvest, season, image_url
       FROM vegetables
       ORDER BY name`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vegetables' });
  }
});

export default router;
