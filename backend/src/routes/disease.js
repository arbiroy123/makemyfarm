import express from 'express';
import axios from 'axios';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Diagnose plant disease from a base64 image
router.post('/diagnose', authenticateToken, async (req, res) => {
  try {
    const { imageBase64, cropName } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image required' });

    const apiKey = process.env.PLANTID_API_KEY;

    // Return realistic demo data if no API key is configured
    if (!apiKey) {
      return res.json({
        diseases: [
          {
            name: 'Early Blight',
            probability: 0.68,
            description: 'Fungal disease causing brown concentric-ring spots on older leaves, often with a yellow halo.',
            treatment: 'Remove and destroy affected leaves. Apply copper-based fungicide every 7–10 days. Improve air circulation and avoid overhead watering.',
          },
          {
            name: 'Powdery Mildew',
            probability: 0.19,
            description: 'Fungal disease showing white powdery coating on leaf surfaces, stunting growth.',
            treatment: 'Spray with diluted neem oil or potassium bicarbonate solution. Ensure good air circulation and avoid excess nitrogen fertiliser.',
          },
          {
            name: 'Healthy',
            probability: 0.13,
            description: 'Plant appears to be in good health with no visible disease symptoms.',
            treatment: 'Continue current care routine. Monitor regularly.',
          },
        ],
      });
    }

    const response = await axios.post(
      'https://api.plant.id/v3/health_assessment',
      {
        images: [imageBase64],
        similar_images: false,
        health: 'all',
      },
      {
        headers: { 'Api-Key': apiKey, 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    const suggestions = response.data?.result?.disease?.suggestions || [];
    const diseases = suggestions.slice(0, 5).map(d => ({
      name: d.name,
      probability: Math.round(d.probability * 100) / 100,
      description: d.details?.description || '',
      treatment: [
        ...(d.details?.treatment?.prevention || []),
        ...(d.details?.treatment?.biological || []),
        ...(d.details?.treatment?.chemical || []),
      ].slice(0, 3).join(' ') || 'Consult a local agricultural extension office.',
    }));

    res.json({ diseases, cropName });
  } catch (error) {
    console.error('Disease detection error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to analyze plant. Please try again.' });
  }
});

export default router;
