import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Push offline changes to server
router.post('/push', authenticateToken, async (req, res) => {
  try {
    const { changes } = req.body;

    if (!Array.isArray(changes)) {
      return res.status(400).json({ error: 'Changes must be an array' });
    }

    const results = [];

    for (const change of changes) {
      const { entityType, entityId, operation, payload } = change;

      // Log to sync queue
      await query(
        `INSERT INTO sync_queue (user_id, entity_type, entity_id, operation, payload, synced)
         VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [req.user.userId, entityType, entityId, operation, JSON.stringify(payload)]
      );

      results.push({ entityId, operation, status: 'synced' });
    }

    res.json({
      synced: results.length,
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Get pending changes for offline client
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM sync_queue WHERE user_id = $1 AND synced = FALSE ORDER BY created_at`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending changes' });
  }
});

// Mark sync as complete
router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    const { syncIds } = req.body;

    await query(
      `UPDATE sync_queue SET synced = TRUE, synced_at = NOW()
       WHERE id = ANY($1::uuid[])`,
      [syncIds]
    );

    res.json({ message: 'Sync confirmed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to confirm sync' });
  }
});

export default router;
