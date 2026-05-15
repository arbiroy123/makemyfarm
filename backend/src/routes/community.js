import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create community group
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description, latitude, longitude, address } = req.body;
    const groupId = uuidv4();

    const result = await query(
      `INSERT INTO community_groups (id, name, description, location, address, admin_id)
       VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($5, $4), 4326), $6, $7)
       RETURNING *`,
      [groupId, name, description, latitude, longitude, address, req.user.userId]
    );

    // Add creator as member
    await query(
      `INSERT INTO community_members (group_id, user_id, role) VALUES ($1, $2, 'admin')`,
      [groupId, req.user.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get user's community groups
router.get('/my-groups', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT cg.*, COUNT(DISTINCT cm.user_id) as member_count
       FROM community_groups cg
       JOIN community_members cm ON cg.id = cm.group_id
       WHERE cm.user_id = $1
       GROUP BY cg.id
       ORDER BY cg.created_at DESC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Join group
router.post('/groups/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `INSERT INTO community_members (group_id, user_id, role) VALUES ($1, $2, 'member')
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [req.params.groupId, req.user.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Post to group
router.post('/groups/:groupId/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, imageUrls } = req.body;
    const postId = uuidv4();

    const result = await query(
      `INSERT INTO community_posts (id, group_id, author_id, title, content, category, image_urls)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [postId, req.params.groupId, req.user.userId, title, content, category, imageUrls || []]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get group posts
router.get('/groups/:groupId/posts', async (req, res) => {
  try {
    const result = await query(
      `SELECT cp.*, u.first_name, u.last_name, u.profile_image_url,
              COUNT(DISTINCT pcom.id) as comment_count
       FROM community_posts cp
       JOIN users u ON cp.author_id = u.id
       LEFT JOIN post_comments pcom ON cp.id = pcom.post_id
       WHERE cp.group_id = $1
       GROUP BY cp.id, u.id
       ORDER BY cp.created_at DESC`,
      [req.params.groupId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Comment on post
router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = uuidv4();

    const result = await query(
      `INSERT INTO post_comments (id, post_id, author_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [commentId, req.params.postId, req.user.userId, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

export default router;
