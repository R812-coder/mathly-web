// app/api/entitlement/route.js
import { createClient } from '@supabase/supabase-js';
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

export async function GET(req) {
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
    
    // Initialize Supabase client
    const supabase = getSupabaseClient();
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return withCors(req, new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // Get user profile with subscription data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_premium, subscription_status, current_period_end, plan, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "not found" - we'll create a default profile
      console.error('Error fetching profile:', profileError);
    }

    // If no profile exists, create one with default values
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          is_premium: false,
          subscription_status: null,
          current_period_end: null,
          plan: null,
          stripe_customer_id: null,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return withCors(req, new Response(
          JSON.stringify({ error: 'Failed to create user profile' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        ));
      }
      
      return withCors(req, new Response(
        JSON.stringify({
          premium: false,
          status: null,
          plan: null,
          customer: null,
          periodEnd: null,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // Return profile data
    return withCors(req, new Response(
      JSON.stringify({
        premium: profile.is_premium || false,
        status: profile.subscription_status,
        plan: profile.plan,
        customer: profile.stripe_customer_id,
        periodEnd: profile.current_period_end,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    ));

  } catch (error) {
    console.error('Entitlement endpoint error:', error);
    return withCors(req, new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
  }
}
