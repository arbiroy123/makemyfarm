import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../database/connection.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../email/mailer.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, experienceLevel } = req.body;

    // Validate input
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, number' });
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Create user
    const newUser = await query(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, experience_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, experience_level`,
      [userId, email, hashedPassword, firstName, lastName, experienceLevel || 'novice']
    );

    // Send verification email (non-blocking — don't fail registration if email is unavailable)
    sendVerificationEmail(email, userId).catch(err =>
      console.warn('Verification email could not be sent:', err.message)
    );

    const token = jwt.sign(
      { userId: newUser.rows[0].id, email: newUser.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      message: 'User registered successfully. Verification email sent.',
      user: newUser.rows[0],
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const userData = user.rows[0];
    const passwordMatch = await bcrypt.compare(password, userData.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: userData.id, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        experienceLevel: userData.experience_level
      },
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.post('/verify-token', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await query('SELECT id, email, first_name, last_name, experience_level, location, timezone FROM users WHERE id = $1', [req.user.userId]);
    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, experienceLevel, timezone, location } = req.body;

    const updated = await query(
      `UPDATE users 
       SET first_name = $2, last_name = $3, experience_level = $4, timezone = $5, location = $6
       WHERE id = $1
       RETURNING id, email, first_name, last_name, experience_level`,
      [req.user.userId, firstName, lastName, experienceLevel, timezone, location]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Password reset request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.json({ message: 'If email exists, reset link will be sent' });
    }

    await sendPasswordResetEmail(email, user.rows[0].id);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

export { router as default, authenticateToken };
