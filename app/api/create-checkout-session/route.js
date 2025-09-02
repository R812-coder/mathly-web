// app/api/create-checkout-session/route.js
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

    // Parse request body
    const { priceId, plan } = await req.json();
    
    if (!priceId || !plan) {
      return withCors(req, new Response(
        JSON.stringify({ error: 'Missing priceId or plan' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // Get or create user profile
    let { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // If no Stripe customer exists, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Update profile with Stripe customer ID
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          stripe_customer_id: customerId,
        });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancelled`,
      metadata: {
        supabase_user_id: user.id,
        plan: plan,
      },
    });

    return withCors(req, new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));

  } catch (error) {
    console.error('Create checkout session error:', error);
    return withCors(req, new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
  }
}

