import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// GET /api/financials/farm/:farmId/summary
router.get('/farm/:farmId/summary', authenticateToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const year = req.query.year || new Date().getFullYear();

    const [expensesResult, incomeResult] = await Promise.all([
      query(
        `SELECT category, SUM(amount) AS total FROM financial_records
         WHERE farm_id = $1 AND type = 'expense' AND EXTRACT(YEAR FROM record_date) = $2
         GROUP BY category ORDER BY total DESC`,
        [farmId, year]
      ),
      query(
        `SELECT category, SUM(amount) AS total FROM financial_records
         WHERE farm_id = $1 AND type = 'income' AND EXTRACT(YEAR FROM record_date) = $2
         GROUP BY category ORDER BY total DESC`,
        [farmId, year]
      ),
    ]);

    const totalExpense = expensesResult.rows.reduce((s, r) => s + parseFloat(r.total), 0);
    const totalIncome = incomeResult.rows.reduce((s, r) => s + parseFloat(r.total), 0);
    const profit = totalIncome - totalExpense;
    const roi = totalExpense > 0 ? ((profit / totalExpense) * 100).toFixed(1) : 0;

    res.json({
      year,
      totalIncome,
      totalExpense,
      profit,
      roi: parseFloat(roi),
      expenseBreakdown: expensesResult.rows,
      incomeBreakdown: incomeResult.rows,
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

// GET /api/financials/farm/:farmId/trend
router.get('/farm/:farmId/trend', authenticateToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const year = req.query.year || new Date().getFullYear();

    const result = await query(
      `SELECT EXTRACT(MONTH FROM record_date) AS month, type, SUM(amount) AS total
       FROM financial_records
       WHERE farm_id = $1 AND EXTRACT(YEAR FROM record_date) = $2
       GROUP BY month, type ORDER BY month`,
      [farmId, year]
    );

    // Shape into 12-month array
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    result.rows.forEach(row => {
      const idx = parseInt(row.month) - 1;
      months[idx][row.type] = parseFloat(row.total);
    });

    res.json({ trend: months, year });
  } catch (error) {
    console.error('Trend error:', error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

// GET /api/financials/farm/:farmId
router.get('/farm/:farmId', authenticateToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const { type, limit = 50, offset = 0 } = req.query;

    let query = `SELECT * FROM financial_records WHERE farm_id = $1`;
    const params = [farmId];

    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }

    params.push(parseInt(limit), parseInt(offset));
    query += ` ORDER BY record_date DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await query(query, params);
    res.json({ records: result.rows });
  } catch (error) {
    console.error('Records fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// POST /api/financials/farm/:farmId
router.post('/farm/:farmId', authenticateToken, async (req, res) => {
  try {
    const { farmId } = req.params;
    const { type, category, amount, currency = 'INR', description, record_date, crop_id } = req.body;

    if (!type || !category || amount === undefined) {
      return res.status(400).json({ error: 'type, category, and amount are required' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be income or expense' });
    }

    const result = await query(
      `INSERT INTO financial_records (farm_id, crop_id, type, category, amount, currency, description, record_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [farmId, crop_id || null, type, category, parseFloat(amount), currency, description || '', record_date || new Date(), req.user.id]
    );

    res.status(201).json({ record: result.rows[0] });
  } catch (error) {
    console.error('Add record error:', error);
    res.status(500).json({ error: 'Failed to add record' });
  }
});

// DELETE /api/financials/:recordId
router.delete('/:recordId', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `DELETE FROM financial_records WHERE id = $1 AND created_by = $2 RETURNING id`,
      [req.params.recordId, req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found or not authorized' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete record error:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

export default router;
