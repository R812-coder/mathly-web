// app/api/confirm-subscription/route.js
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
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

export async function GET(req) {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return withCors(req, new Response(
        JSON.stringify({ error: 'Missing session_id parameter' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }

    // Initialize clients
    const stripe = getStripeClient();
    const supabase = getSupabaseClient();

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return withCors(req, new Response(
        JSON.stringify({ error: 'Invalid session ID' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    const customer = await stripe.customers.retrieve(session.customer);

    // Find user by Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', session.customer)
      .single();

    if (!profile) {
      return withCors(req, new Response(
        JSON.stringify({ error: 'User profile not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }

    // Determine if user is premium based on subscription status
    const isPremium = ['active', 'trialing'].includes(subscription.status);
    
    // Get plan name from subscription
    const plan = subscription.items.data[0]?.price.recurring?.interval || null;
    
    // Calculate current period end
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Update profile immediately (idempotent)
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        is_premium: isPremium,
        subscription_status: subscription.status,
        current_period_end: currentPeriodEnd,
        plan: plan,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
      });

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return withCors(req, new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      ));
    }

    return withCors(req, new Response(
      JSON.stringify({
        success: true,
        premium: isPremium,
        status: subscription.status,
        plan: plan,
        periodEnd: currentPeriodEnd,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    ));

  } catch (error) {
    console.error('Confirm subscription error:', error);
    return withCors(req, new Response(
      JSON.stringify({ error: 'Failed to confirm subscription' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    ));
  }
}
