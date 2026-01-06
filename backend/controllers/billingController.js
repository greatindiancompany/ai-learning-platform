// ============================================================================
// Billing Controller (Stripe Integration)
// ============================================================================
// Handles subscription management, checkout sessions, and webhooks
// ============================================================================

import Stripe from 'stripe';
import { supabase } from '../utils/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://inspir.uk';

// ============================================================================
// CHECKOUT SESSION
// ============================================================================

/**
 * Create Checkout Session (for activating subscription after trial)
 * POST /api/billing/create-checkout-session
 * Body: { parent_id }
 * Requires: Parent authentication
 */
export const createCheckoutSession = async (req, res) => {
    try {
        const parent_id = req.parent_id;

        // Fetch parent account
        const { data: parent, error } = await supabase
            .from('parent_accounts')
            .select('*')
            .eq('id', parent_id)
            .single();

        if (error || !parent) {
            return res.status(404).json({
                error: 'Parent not found',
                message: 'Parent account does not exist'
            });
        }

        // Get or create Stripe customer
        let customerId = parent.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: parent.email,
                metadata: {
                    parent_id: parent.id,
                    account_type: parent.account_type
                }
            });

            customerId = customer.id;

            // Save customer ID to database
            await supabase
                .from('parent_accounts')
                .update({ stripe_customer_id: customerId })
                .eq('id', parent_id);
        }

        // Count current students
        const { count: studentCount } = await supabase
            .from('student_accounts')
            .select('id', { count: 'exact', head: true })
            .eq('parent_id', parent_id);

        // Create checkout session
        // Note: You need to create a price in Stripe dashboard first
        // For now, we'll use a placeholder price_id
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    // Replace with actual price ID from Stripe dashboard
                    // price: process.env.STRIPE_PRICE_ID_STUDENT_PROFILE,
                    price: 'price_1234567890', // Placeholder - create in Stripe
                    quantity: studentCount || 1, // Charge for current students
                },
            ],
            subscription_data: {
                metadata: {
                    parent_id: parent.id,
                }
            },
            success_url: `${FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/billing?canceled=true`,
            metadata: {
                parent_id: parent.id,
            }
        });

        res.json({
            success: true,
            session_id: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({
            error: 'Checkout failed',
            message: 'Failed to create checkout session'
        });
    }
};

/**
 * Create Customer Portal Session (for managing subscription)
 * POST /api/billing/create-portal-session
 * Requires: Parent authentication
 */
export const createPortalSession = async (req, res) => {
    try {
        const parent_id = req.parent_id;

        // Fetch parent account
        const { data: parent, error } = await supabase
            .from('parent_accounts')
            .select('stripe_customer_id')
            .eq('id', parent_id)
            .single();

        if (error || !parent || !parent.stripe_customer_id) {
            return res.status(404).json({
                error: 'No subscription found',
                message: 'You must subscribe first before accessing the billing portal'
            });
        }

        // Create portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: parent.stripe_customer_id,
            return_url: `${FRONTEND_URL}/dashboard`,
        });

        res.json({
            success: true,
            url: session.url
        });
    } catch (error) {
        console.error('Error creating portal session:', error);
        res.status(500).json({
            error: 'Portal access failed',
            message: 'Failed to create billing portal session'
        });
    }
};

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

/**
 * Handle Stripe Webhooks
 * POST /api/billing/webhook
 * Stripe sends events when subscriptions change
 */
export const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Verify webhook signature
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;

            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
};

// ============================================================================
// WEBHOOK EVENT HANDLERS
// ============================================================================

const handleCheckoutCompleted = async (session) => {
    const parentId = session.metadata.parent_id;

    console.log(`✅ Checkout completed for parent: ${parentId}`);

    // Update parent account status
    await supabase
        .from('parent_accounts')
        .update({
            subscription_status: 'active',
            stripe_subscription_id: session.subscription,
            student_limit: 999 // Unlimited after subscription
        })
        .eq('id', parentId);
};

const handleSubscriptionCreated = async (subscription) => {
    const customerId = subscription.customer;

    // Find parent by Stripe customer ID
    const { data: parent } = await supabase
        .from('parent_accounts')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (parent) {
        await supabase
            .from('parent_accounts')
            .update({
                subscription_status: 'active',
                stripe_subscription_id: subscription.id,
                student_limit: 999
            })
            .eq('id', parent.id);

        console.log(`✅ Subscription created for parent: ${parent.id}`);
    }
};

const handleSubscriptionUpdated = async (subscription) => {
    const customerId = subscription.customer;
    const status = subscription.status; // active, past_due, canceled, etc.

    // Find parent by Stripe customer ID
    const { data: parent } = await supabase
        .from('parent_accounts')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (parent) {
        let subscriptionStatus = 'active';

        if (status === 'past_due') {
            subscriptionStatus = 'past_due';
        } else if (status === 'canceled' || status === 'unpaid') {
            subscriptionStatus = 'canceled';
        } else if (status === 'incomplete' || status === 'incomplete_expired') {
            subscriptionStatus = 'expired';
        }

        await supabase
            .from('parent_accounts')
            .update({
                subscription_status: subscriptionStatus,
                stripe_subscription_id: subscription.id
            })
            .eq('id', parent.id);

        console.log(`📝 Subscription updated for parent: ${parent.id} - Status: ${subscriptionStatus}`);
    }
};

const handleSubscriptionDeleted = async (subscription) => {
    const customerId = subscription.customer;

    // Find parent by Stripe customer ID
    const { data: parent } = await supabase
        .from('parent_accounts')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

    if (parent) {
        await supabase
            .from('parent_accounts')
            .update({
                subscription_status: 'canceled',
                student_limit: 0 // Lock account when subscription ends
            })
            .eq('id', parent.id);

        console.log(`❌ Subscription canceled for parent: ${parent.id}`);
    }
};

const handlePaymentSucceeded = async (invoice) => {
    const customerId = invoice.customer;

    console.log(`💳 Payment succeeded for customer: ${customerId}`);
    // Payment successful - subscription remains active
};

const handlePaymentFailed = async (invoice) => {
    const customerId = invoice.customer;

    // Find parent by Stripe customer ID
    const { data: parent } = await supabase
        .from('parent_accounts')
        .select('id, email')
        .eq('stripe_customer_id', customerId)
        .single();

    if (parent) {
        await supabase
            .from('parent_accounts')
            .update({
                subscription_status: 'past_due'
            })
            .eq('id', parent.id);

        console.log(`⚠️ Payment failed for parent: ${parent.id}`);
        // TODO: Send email notification about failed payment
    }
};

// ============================================================================
// SUBSCRIPTION INFO
// ============================================================================

/**
 * Get subscription info for parent
 * GET /api/billing/subscription
 * Requires: Parent authentication
 */
export const getSubscriptionInfo = async (req, res) => {
    try {
        const parent_id = req.parent_id;

        // Fetch parent account
        const { data: parent, error } = await supabase
            .from('parent_accounts')
            .select('subscription_status, trial_end_date, stripe_customer_id, stripe_subscription_id, student_limit')
            .eq('id', parent_id)
            .single();

        if (error || !parent) {
            return res.status(404).json({
                error: 'Parent not found',
                message: 'Parent account does not exist'
            });
        }

        // If they have a Stripe subscription, fetch details
        let subscriptionDetails = null;
        if (parent.stripe_subscription_id) {
            try {
                const subscription = await stripe.subscriptions.retrieve(parent.stripe_subscription_id);
                subscriptionDetails = {
                    status: subscription.status,
                    current_period_end: new Date(subscription.current_period_end * 1000),
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    plan_amount: subscription.items.data[0]?.price?.unit_amount / 100,
                    plan_currency: subscription.items.data[0]?.price?.currency,
                };
            } catch (stripeError) {
                console.error('Error fetching Stripe subscription:', stripeError);
            }
        }

        res.json({
            success: true,
            subscription_status: parent.subscription_status,
            trial_end_date: parent.trial_end_date,
            student_limit: parent.student_limit,
            stripe_details: subscriptionDetails
        });
    } catch (error) {
        console.error('Error fetching subscription info:', error);
        res.status(500).json({
            error: 'Failed to fetch subscription',
            message: 'An error occurred while fetching subscription information'
        });
    }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
    createCheckoutSession,
    createPortalSession,
    handleWebhook,
    getSubscriptionInfo
};
