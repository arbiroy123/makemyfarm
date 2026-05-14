import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/stories — paginated community feed filtered by country
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const userResult = await query(
      'SELECT country_code FROM users WHERE id = $1',
      [req.user.userId]
    );
    const country = userResult.rows[0]?.country_code || 'IN';

    const result = await query(
      `SELECT gs.id, gs.vegetable_name, gs.photo_url, gs.lesson, gs.caption,
              gs.climate_zone, gs.country_code, gs.likes_count, gs.created_at,
              u.first_name, u.last_name, u.experience_level,
              EXISTS(
                SELECT 1 FROM grow_story_likes gsl
                WHERE gsl.story_id = gs.id AND gsl.user_id = $1
              ) AS has_liked
       FROM grow_stories gs
       JOIN users u ON gs.user_id = u.id
       WHERE gs.country_code = $2
       ORDER BY gs.created_at DESC
       LIMIT $3 OFFSET $4`,
      [req.user.userId, country, parseInt(limit), offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Stories fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// GET /api/stories/my — stories posted by current user
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT gs.*, u.first_name, u.last_name
       FROM grow_stories gs
       JOIN users u ON gs.user_id = u.id
       WHERE gs.user_id = $1
       ORDER BY gs.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('My stories error:', error);
    res.status(500).json({ error: 'Failed to fetch your stories' });
  }
});

// POST /api/stories — create a grow story
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { vegetableName, photoUrl, lesson, caption, cropId, climateZone } = req.body;

    if (!vegetableName || !lesson || lesson.trim().length < 10) {
      return res.status(400).json({ error: 'Vegetable name and a lesson (10+ chars) are required' });
    }

    const storyId = uuidv4();
    const userResult = await query(
      'SELECT country_code FROM users WHERE id = $1',
      [req.user.userId]
    );
    const countryCode = userResult.rows[0]?.country_code || 'IN';

    const result = await query(
      `INSERT INTO grow_stories
         (id, user_id, crop_id, vegetable_name, photo_url, lesson, caption, climate_zone, country_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        storyId,
        req.user.userId,
        cropId || null,
        vegetableName,
        photoUrl || null,
        lesson.trim(),
        caption?.trim() || null,
        climateZone || null,
        countryCode,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// POST /api/stories/:id/like — toggle like on a story
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query(
      'SELECT id FROM grow_story_likes WHERE story_id = $1 AND user_id = $2',
      [id, req.user.userId]
    );

    if (existing.rows.length > 0) {
      await query('DELETE FROM grow_story_likes WHERE story_id = $1 AND user_id = $2', [id, req.user.userId]);
      await query('UPDATE grow_stories SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1', [id]);
      return res.json({ liked: false });
    }

    await query('INSERT INTO grow_story_likes (story_id, user_id) VALUES ($1, $2)', [id, req.user.userId]);
    await query('UPDATE grow_stories SET likes_count = likes_count + 1 WHERE id = $1', [id]);
    res.json({ liked: true });
  } catch (error) {
    console.error('Like story error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// DELETE /api/stories/:id — delete own story
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM grow_stories WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found or not yours' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

export default router;
