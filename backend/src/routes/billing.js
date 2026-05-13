import express from 'express';
import Stripe from 'stripe';
import { query } from '../database/connection.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Lazy init — server starts fine without STRIPE_SECRET_KEY (e.g. local dev)
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to your .env to use billing.');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

const PRICES = {
  IN: { priceId: process.env.STRIPE_PRO_PRICE_ID_IN, amount: '₹99', currency: 'INR' },
  US: { priceId: process.env.STRIPE_PRO_PRICE_ID_US, amount: '$4.99', currency: 'USD' },
};
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// GET /api/billing/status — current user's subscription info
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT subscription_tier, stripe_customer_id, stripe_subscription_id, subscription_expires_at, country_code
       FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const region = PRICES[user.country_code] ?? PRICES.IN;
    res.json({
      tier: user.subscription_tier,
      isPro: user.subscription_tier === 'pro',
      stripeCustomerId: user.stripe_customer_id,
      subscriptionId: user.stripe_subscription_id,
      expiresAt: user.subscription_expires_at,
      country: user.country_code,
      price: region.amount,
      currency: region.currency,
      limits: {
        farms: user.subscription_tier === 'free' ? 1 : null,
        crops: user.subscription_tier === 'free' ? 5 : null,
      },
    });
  } catch (error) {
    console.error('Billing status error:', error);
    res.status(500).json({ error: 'Failed to fetch billing status' });
  }
});

// POST /api/billing/create-checkout-session — create Stripe Checkout for Pro
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      `SELECT email, subscription_tier, stripe_customer_id, country_code FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = userResult.rows[0];

    if (user.subscription_tier === 'pro') {
      return res.status(400).json({ error: 'Already subscribed to Pro' });
    }

    const region = PRICES[user.country_code] ?? PRICES.IN;
    if (!region.priceId) {
      return res.status(500).json({ error: `Stripe price not configured for region ${user.country_code}` });
    }

    // Reuse existing Stripe customer or create new one
    const stripe = getStripe();
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: req.user.userId },
      });
      customerId = customer.id;
      await query(
        `UPDATE users SET stripe_customer_id = $1 WHERE id = $2`,
        [customerId, req.user.userId]
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: region.priceId, quantity: 1 }],
      success_url: `${APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/billing/cancel`,
      metadata: { userId: req.user.userId },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/billing/webhook — Stripe webhook (raw body, verified by signature)
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId && session.subscription) {
          await query(
            `UPDATE users
             SET subscription_tier = 'pro',
                 stripe_subscription_id = $1,
                 subscription_expires_at = NULL
             WHERE id = $2`,
            [session.subscription, userId]
          );
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const sub = event.data.object;
        await query(
          `UPDATE users
           SET subscription_tier = 'free',
               stripe_subscription_id = NULL,
               subscription_expires_at = NOW()
           WHERE stripe_subscription_id = $1`,
          [sub.id]
        );
        break;
      }

      case 'invoice.payment_failed': {
        // Optionally notify user — for now just log
        console.warn('Payment failed for subscription:', event.data.object.subscription);
        break;
      }

      default:
        // Unhandled event type — ignore
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// POST /api/billing/cancel — cancel active subscription
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT stripe_subscription_id FROM users WHERE id = $1`,
      [req.user.userId]
    );

    const subId = result.rows[0]?.stripe_subscription_id;
    if (!subId) return res.status(400).json({ error: 'No active subscription found' });

    await getStripe().subscriptions.cancel(subId);

    await query(
      `UPDATE users SET subscription_tier = 'free', stripe_subscription_id = NULL WHERE id = $1`,
      [req.user.userId]
    );

    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;
