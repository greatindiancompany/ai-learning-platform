// ============================================================================
// Billing Routes (Stripe)
// ============================================================================

import express from 'express';
import billingController from '../controllers/billingController.js';
import { authenticateParent } from '../middleware/authMiddleware.js';

const router = express.Router();

// ============================================================================
// CHECKOUT & PORTAL
// ============================================================================

// Create checkout session (activate subscription after trial)
router.post('/create-checkout-session', authenticateParent, billingController.createCheckoutSession);

// Create customer portal session (manage subscription)
router.post('/create-portal-session', authenticateParent, billingController.createPortalSession);

// Get subscription info
router.get('/subscription', authenticateParent, billingController.getSubscriptionInfo);

// ============================================================================
// WEBHOOKS
// ============================================================================

// Stripe webhook handler (no auth - Stripe verifies signature)
// IMPORTANT: This must use raw body, not JSON parsed body
router.post('/webhook', express.raw({ type: 'application/json' }), billingController.handleWebhook);

export default router;
