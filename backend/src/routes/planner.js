import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// All vegetables for planner (name + companions)
router.get('/vegetables', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, companion_plants, difficulty_level FROM vegetables ORDER BY name`,
      []
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vegetables' });
  }
});

// Companion data for a specific vegetable
router.get('/companions/:vegetableId', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, companion_plants FROM vegetables WHERE id = $1`,
      [req.params.vegetableId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Vegetable not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch companions' });
  }
});

// Get user's saved garden plans
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT gp.*, f.name as farm_name
       FROM garden_plans gp
       LEFT JOIN farms f ON gp.farm_id = f.id
       WHERE gp.user_id = $1
       ORDER BY gp.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Save a garden plan
router.post('/plans', authenticateToken, async (req, res) => {
  try {
    const { farmId, name, gridData } = req.body;
    const id = uuidv4();
    const result = await query(
      `INSERT INTO garden_plans (id, user_id, farm_id, name, grid_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, req.user.userId, farmId || null, name || 'My Garden', JSON.stringify(gridData || {})]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save plan' });
  }
});

// Delete a garden plan
router.delete('/plans/:planId', authenticateToken, async (req, res) => {
  try {
    const plan = await query(`SELECT user_id FROM garden_plans WHERE id = $1`, [req.params.planId]);
    if (plan.rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    if (plan.rows[0].user_id !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    await query(`DELETE FROM garden_plans WHERE id = $1`, [req.params.planId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

export default router;
