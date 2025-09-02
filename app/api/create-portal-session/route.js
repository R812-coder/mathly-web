// app/api/create-portal-session/route.js
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

export async function POST(req) {
  const pre = preflight(req);
  if (pre) return pre;

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return withCors(req, new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize clients
    const supabase = getSupabaseClient();
    const stripe = getStripeClient();
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return withCors(req, new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // Get user profile with Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return withCors(req, new Response(
        JSON.stringify({ error: 'No subscription found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
    });

    return withCors(req, new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));

  } catch (error) {
    console.error('Create portal session error:', error);
    return withCors(req, new Response(
      JSON.stringify({ error: 'Failed to create portal session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
  }
}

