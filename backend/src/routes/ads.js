import express from 'express';

const router = express.Router();

// Affiliate tags — replace after account approval:
//   Amazon.in  → https://affiliate-program.amazon.in   (tag ends in -21)
//   Amazon.com → https://affiliate-program.amazon.com  (tag ends in -20)
const AMAZON_IN_TAG = 'farmsync-21';
const AMAZON_US_TAG = 'farmsync-20';

// Sponsored banners — swap these for real partner deals or AdMob later.
// Country-specific so India sees INR-relevant brands, US sees USD-relevant brands.
const BANNERS = {
  IN: [
    { emoji: '🌱', title: 'Quality Vegetable Seeds', subtitle: 'Shop top-rated seeds on Amazon.in', url: `https://www.amazon.in/s?k=vegetable+seeds&tag=${AMAZON_IN_TAG}`, sponsor: 'Amazon.in' },
    { emoji: '🧪', title: 'IFFCO Nano Urea', subtitle: 'Boost yield with liquid nano fertiliser', url: 'https://www.iffcobazar.in', sponsor: 'IFFCO Bazar' },
    { emoji: '🌾', title: 'Seeds on Flipkart', subtitle: 'Certified vegetable & herb seeds', url: 'https://www.flipkart.com/search?q=vegetable+seeds', sponsor: 'Flipkart' },
  ],
  US: [
    { emoji: '🌱', title: 'Burpee Heirloom Seeds', subtitle: 'America\'s most trusted seed brand', url: 'https://www.burpee.com', sponsor: 'Burpee' },
    { emoji: '🧑‍🌾', title: 'Johnny\'s Selected Seeds', subtitle: 'Trialled, tested & farm-proven', url: 'https://www.johnnyseeds.com', sponsor: "Johnny's Seeds" },
    { emoji: '💧', title: 'Drip Irrigation Kits', subtitle: 'Save water, grow more on Amazon', url: `https://www.amazon.com/s?k=drip+irrigation+kit&tag=${AMAZON_US_TAG}`, sponsor: 'Amazon' },
  ],
};

// GET /api/ads/banner?country=IN
router.get('/banner', (req, res) => {
  const country = ['IN', 'US'].includes(req.query.country) ? req.query.country : 'IN';
  const pool = BANNERS[country];
  // Rotate by day so it changes daily without any DB
  const banner = pool[Math.floor(Date.now() / 86400000) % pool.length];
  res.json(banner);
});

export default router;
