import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Plant a new crop
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { farmId, vegetableId, plantingDate, expectedHarvestDate, quantity, growingMethod, notes } = req.body;
    const cropId = uuidv4();

    // Verify farm ownership/collaboration
    const farmAccess = await query(
      `SELECT * FROM farm_collaborators WHERE farm_id = $1 AND user_id = $2`,
      [farmId, req.user.userId]
    );

    if (farmAccess.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await query(
      `INSERT INTO crops (id, farm_id, vegetable_id, quantity_planted, planting_date, expected_harvest_date, status, growing_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'planted', $7, $8)
       RETURNING *`,
      [cropId, farmId, vegetableId, quantity, plantingDate, expectedHarvestDate, growingMethod || 'outdoor', notes]
    );

    // Log activity
    await query(
      `INSERT INTO activity_log (farm_id, user_id, action, details)
       VALUES ($1, $2, 'crop_planted', $3)`,
      [farmId, req.user.userId, JSON.stringify({ cropId, vegetableId })]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to plant crop' });
  }
});

// Get single crop with full vegetable guide
router.get('/:cropId', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*,
              v.name as vegetable_name, v.scientific_name, v.description,
              v.difficulty_level, v.days_to_harvest, v.spacing_cm,
              v.min_temp_celsius, v.optimal_temp_celsius, v.max_temp_celsius,
              v.water_frequency_days, v.sunlight_hours, v.soil_type,
              v.ph_min, v.ph_max, v.season, v.climate_zones,
              v.yields_per_plant, v.planting_tips, v.care_tips,
              v.pest_diseases, v.companion_plants
       FROM crops c
       JOIN vegetables v ON c.vegetable_id = v.id
       WHERE c.id = $1`,
      [req.params.cropId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch crop' });
  }
});

// Get farm crops
router.get('/farm/:farmId', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, v.name as vegetable_name, v.difficulty_level, v.days_to_harvest
       FROM crops c
       JOIN vegetables v ON c.vegetable_id = v.id
       WHERE c.farm_id = $1
       ORDER BY c.planting_date DESC`,
      [req.params.farmId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
});

// Update crop status
router.put('/:cropId', authenticateToken, async (req, res) => {
  try {
    const { status, yieldQuantity, harvestDate, notes, photos } = req.body;

    const cropData = await query('SELECT farm_id FROM crops WHERE id = $1', [req.params.cropId]);
    if (cropData.rows.length === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    const farmId = cropData.rows[0].farm_id;

    // Verify authorization
    const farmAccess = await query(
      `SELECT * FROM farm_collaborators WHERE farm_id = $1 AND user_id = $2`,
      [farmId, req.user.userId]
    );

    if (farmAccess.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await query(
      `UPDATE crops 
       SET status = $2, yield_quantity = $3, actual_harvest_date = $4, notes = $5, photos = $6
       WHERE id = $1
       RETURNING *`,
      [req.params.cropId, status, yieldQuantity, harvestDate, notes, photos || []]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update crop' });
  }
});

export default router;
