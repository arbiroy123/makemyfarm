import express from 'express';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Nearby listings within a radius — public, no auth required
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radiusKm = 40 } = req.query;
    if (!latitude || !longitude) return res.status(400).json({ error: 'Location required' });

    const result = await query(
      `SELECT ml.*, u.first_name, u.last_name, u.email,
              ROUND((ST_Distance(ml.location, ST_SetSRID(ST_MakePoint($2::float, $1::float), 4326)::geography) / 1000)::numeric, 1) AS distance_km
       FROM marketplace_listings ml
       JOIN users u ON ml.user_id = u.id
       WHERE ml.is_active = true
         AND ST_DWithin(ml.location, ST_SetSRID(ST_MakePoint($2::float, $1::float), 4326)::geography, $3::float * 1000)
         AND (ml.expires_at IS NULL OR ml.expires_at > NOW())
       ORDER BY distance_km ASC
       LIMIT 50`,
      [latitude, longitude, radiusKm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// My listings
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM marketplace_listings WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Create listing
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { vegetableName, quantityKg, pricePerKg, listingType, description, photos, latitude, longitude } = req.body;
    if (!vegetableName) return res.status(400).json({ error: 'Vegetable name required' });
    if (!latitude || !longitude) return res.status(400).json({ error: 'Location required' });

    const id = uuidv4();
    const result = await query(
      `INSERT INTO marketplace_listings
         (id, user_id, vegetable_name, quantity_kg, price_per_kg, listing_type, description, photos, location, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
         ST_SetSRID(ST_MakePoint($10::float, $9::float), 4326)::geography,
         NOW() + INTERVAL '30 days')
       RETURNING *`,
      [id, req.user.userId, vegetableName, quantityKg || null, pricePerKg || 0,
       listingType || 'free', description || null, photos || [], latitude, longitude]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT ml.*, u.first_name, u.last_name, u.email
       FROM marketplace_listings ml
       JOIN users u ON ml.user_id = u.id
       WHERE ml.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Update listing (close / reactivate)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await query(`SELECT user_id FROM marketplace_listings WHERE id = $1`, [req.params.id]);
    if (listing.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    if (listing.rows[0].user_id !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });

    const { isActive } = req.body;
    const result = await query(
      `UPDATE marketplace_listings SET is_active = $2 WHERE id = $1 RETURNING *`,
      [req.params.id, isActive ?? false]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const listing = await query(`SELECT user_id FROM marketplace_listings WHERE id = $1`, [req.params.id]);
    if (listing.rows.length === 0) return res.status(404).json({ error: 'Listing not found' });
    if (listing.rows[0].user_id !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });

    await query(`DELETE FROM marketplace_listings WHERE id = $1`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

export default router;
