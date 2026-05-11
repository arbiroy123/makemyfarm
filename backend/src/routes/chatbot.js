import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateToken } from './auth.js';

const router = express.Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are KisanBot, an expert agricultural advisor for FarmSync, a farming app used in India and the USA.

For Indian farmers:
- Address crops like rice (dhaan), wheat (gehu), sugarcane (ganna), cotton (kapas), pulses (dal), vegetables, and spices
- Reference Indian seasons: Kharif (June–November), Rabi (November–April), Zaid (April–June)
- Mention PM-KISAN, PMFBY, Kisan Credit Card, e-NAM, and state schemes when relevant
- Use INR (₹) for costs; reference mandi prices and agmarknet
- Reference KVK (Krishi Vigyan Kendra), ICAR, and State Agriculture Departments
- If asked in Hindi, respond fully in Hindi with simple language

For US farmers:
- Address corn, soybeans, wheat, cotton, vegetables, and fruits
- Reference USDA FSA, NRCS, RMA crop insurance, and state extension services
- Use USD ($) for costs
- Reference USDA agricultural zones and university extension programs

Always:
- Be practical and farmer-friendly — avoid jargon
- Suggest when to consult a local agronomist for serious issues
- Consider organic and sustainable options where appropriate
- Keep responses concise and actionable
- If farm context is provided, tailor advice to the specific farm`;

// POST /api/chatbot/chat
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, history = [], farmContext } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messages = [
      ...history.slice(-10).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const systemWithContext = farmContext
      ? `${SYSTEM_PROMPT}\n\nCurrent farm context: ${JSON.stringify(farmContext)}`
      : SYSTEM_PROMPT;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemWithContext,
      messages,
    });

    res.json({ reply: response.content[0].text });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to get response from KisanBot' });
  }
});

// GET /api/chatbot/suggestions?country=IN
router.get('/suggestions', authenticateToken, (req, res) => {
  const { country = 'IN' } = req.query;
  const suggestions = country === 'IN' ? INDIA_SUGGESTIONS : US_SUGGESTIONS;
  res.json({ suggestions });
});

const INDIA_SUGGESTIONS = [
  { id: '1', text: 'मेरी फसल पर कीट लग गए हैं, क्या करूं?', label: 'Pest Attack' },
  { id: '2', text: 'खरीफ मौसम में कौन सी फसल लगाएं?', label: 'Kharif Crops' },
  { id: '3', text: 'मिट्टी की उर्वरता कैसे बढ़ाएं?', label: 'Soil Health' },
  { id: '4', text: 'PM-KISAN के लिए कैसे आवेदन करें?', label: 'PM-KISAN' },
  { id: '5', text: 'फसल बीमा (PMFBY) कैसे कराएं?', label: 'Crop Insurance' },
  { id: '6', text: 'जैविक खेती कैसे शुरू करें?', label: 'Organic Farming' },
];

const US_SUGGESTIONS = [
  { id: '1', text: 'How do I deal with corn rootworm?', label: 'Pest Control' },
  { id: '2', text: 'Best cover crops for winter in the Midwest?', label: 'Cover Crops' },
  { id: '3', text: 'How to apply for USDA FSA loans?', label: 'USDA Loans' },
  { id: '4', text: 'When and how should I do soil testing?', label: 'Soil Testing' },
  { id: '5', text: 'Managing drought stress in soybeans?', label: 'Drought Tips' },
  { id: '6', text: 'How to start regenerative agriculture?', label: 'Regenerative' },
];

export default router;
