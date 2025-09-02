// app/api/webhooks/route.js
export const runtime = "nodejs";

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { preflight, withCors } from '../_cors';

// Initialize Supabase client only when environment variables are available
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
};

// Initialize Stripe client only when environment variables are available
const getStripeClient = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    throw new Error('Missing Stripe environment variables');
  }
  
  return new Stripe(stripeKey);
};

export async function POST(req) {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return withCors(req, new Response('Missing stripe-signature header', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      }));
    }

    // Initialize Stripe client
    const stripe = getStripeClient();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return withCors(req, new Response('Invalid signature', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      }));
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        await handleSubscriptionUpdated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return withCors(req, new Response('Webhook processed successfully', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    }));
  } catch (error) {
    console.error('Webhook error:', error);
    return withCors(req, new Response('Webhook processing failed', { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    }));
  }
}

async function handleCheckoutSessionCompleted(session) {
  try {
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();
    
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const customer = await stripe.customers.retrieve(session.customer);
    
    // Find user by Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', session.customer)
      .single();

    if (profile) {
      await updateProfileFromSubscription(profile.id, subscription, customer);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  try {
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();
    
    const customer = await stripe.customers.retrieve(subscription.customer);
    
    // Find user by Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (profile) {
      await updateProfileFromSubscription(profile.id, subscription, customer);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function updateProfileFromSubscription(userId, subscription, customer) {
  try {
    const supabase = getSupabaseClient();
    
    // Determine if user is premium based on subscription status
    const isPremium = ['active', 'trialing'].includes(subscription.status);
    
    // Get plan name from subscription
    const plan = subscription.items.data[0]?.price.recurring?.interval || null;
    
    // Calculate current period end
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Update profile
    await supabase
      .from('profiles')
      .upsert({
        id: userId,
        is_premium: isPremium,
        subscription_status: subscription.status,
        current_period_end: currentPeriodEnd,
        plan: plan,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
      });

    console.log(`Updated profile for user ${userId}: premium=${isPremium}, status=${subscription.status}`);
  } catch (error) {
    console.error('Error updating profile from subscription:', error);
  }
}
