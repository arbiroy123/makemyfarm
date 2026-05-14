import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/succession/calculate — calculate a succession schedule (no DB write)
router.get('/calculate', authenticateToken, async (req, res) => {
  try {
    const { vegetableId, intervalWeeks = 2, batches = 3, startDate } = req.query;

    if (!vegetableId) {
      return res.status(400).json({ error: 'vegetableId required' });
    }

    const vegResult = await query(
      'SELECT id, name, days_to_harvest, difficulty_level, season FROM vegetables WHERE id = $1',
      [vegetableId]
    );

    if (vegResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vegetable not found' });
    }

    const veg = vegResult.rows[0];
    const start = startDate ? new Date(startDate) : new Date();
    const intervalDays = parseInt(intervalWeeks) * 7;
    const batchCount = Math.min(parseInt(batches), 6); // cap at 6

    const schedule = Array.from({ length: batchCount }, (_, i) => {
      const plantDate = new Date(start);
      plantDate.setDate(plantDate.getDate() + i * intervalDays);

      const harvestDate = new Date(plantDate);
      harvestDate.setDate(harvestDate.getDate() + veg.days_to_harvest);

      return {
        batch: i + 1,
        plantingDate: plantDate.toISOString().split('T')[0],
        harvestDate: harvestDate.toISOString().split('T')[0],
        daysFromNow: i * intervalDays,
      };
    });

    res.json({
      vegetable: veg,
      intervalWeeks: parseInt(intervalWeeks),
      batches: batchCount,
      schedule,
      tip: `Plant Batch 2 when Batch 1 starts flowering — you'll have fresh ${veg.name} every ${intervalWeeks} weeks!`,
    });
  } catch (error) {
    console.error('Succession calculate error:', error);
    res.status(500).json({ error: 'Failed to calculate succession plan' });
  }
});

// GET /api/succession/farm/:farmId — list saved plans for a farm
router.get('/farm/:farmId', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT sp.*, v.name AS vegetable_name, v.days_to_harvest
       FROM succession_plans sp
       JOIN vegetables v ON sp.vegetable_id = v.id
       WHERE sp.farm_id = $1 AND sp.user_id = $2
       ORDER BY sp.created_at DESC`,
      [req.params.farmId, req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get succession plans error:', error);
    res.status(500).json({ error: 'Failed to fetch succession plans' });
  }
});

// POST /api/succession — save a succession plan
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { farmId, vegetableId, intervalWeeks, batches, firstPlantingDate } = req.body;

    if (!farmId || !vegetableId || !firstPlantingDate) {
      return res.status(400).json({ error: 'farmId, vegetableId, firstPlantingDate required' });
    }

    const farmAccess = await query(
      'SELECT id FROM farm_collaborators WHERE farm_id = $1 AND user_id = $2',
      [farmId, req.user.userId]
    );
    if (farmAccess.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorised for this farm' });
    }

    const planId = uuidv4();
    const result = await query(
      `INSERT INTO succession_plans
         (id, farm_id, user_id, vegetable_id, interval_weeks, batches, first_planting_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [planId, farmId, req.user.userId, vegetableId, intervalWeeks || 2, batches || 3, firstPlantingDate]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Save succession plan error:', error);
    res.status(500).json({ error: 'Failed to save succession plan' });
  }
});

// DELETE /api/succession/:id — remove a plan
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM succession_plans WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete succession plan error:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

export default router;
