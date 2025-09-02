# Mathly Web - Subscription & Entitlement System

This is the web application for Mathly, featuring a complete subscription system with Stripe integration and Supabase backend.

## Features

- 🔐 **Authentication**: Supabase Auth with Google OAuth and magic links
- 💳 **Subscriptions**: Stripe-powered monthly/yearly plans
- 🎯 **Entitlement Management**: Real-time Pro status updates
- 🌐 **Chrome Extension Integration**: CORS-enabled API endpoints
- 📱 **Responsive UI**: Modern design with Tailwind CSS

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site URLs
NEXT_PUBLIC_SITE_URL=https://getmathly.com
NEXT_PUBLIC_WEB_URL=https://getmathly.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in your Stripe dashboard)
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_YEARLY=price_...
```

## Stripe Setup

### 1. Create Products and Prices

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create two products:
   - **Mathly Pro Monthly** - $9.99/month
   - **Mathly Pro Yearly** - $99.99/year
3. Copy the Price IDs to your environment variables

### 2. Configure Customer Portal

1. Go to **Settings → Customer Portal** in Stripe
2. Enable subscriptions management
3. Allow cancellation
4. Set return URL to: `${NEXT_PUBLIC_SITE_URL}/checkout/success`

### 3. Set up Webhooks

1. Go to **Developers → Webhooks** in Stripe
2. Add endpoint: `${NEXT_PUBLIC_SITE_URL}/api/webhooks`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.paused`
   - `customer.subscription.resumed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 4. Enable Customer Emails

1. Go to **Settings → Customer emails** in Stripe
2. Enable:
   - Successful payments
   - Invoices

## Supabase Setup

### 1. Create Profiles Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  subscription_status TEXT,
  current_period_end TIMESTAMPTZ,
  plan TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Configure Authentication

1. Go to **Authentication → Settings** in Supabase
2. Add your site URL to allowed redirect URLs
3. Configure Google OAuth if using Google sign-in

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

### Installation

```bash
npm install
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Testing Stripe Integration

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to http://localhost:3000/api/webhooks`
4. Use test card `4242 4242 4242 4242` for successful payments

## Deployment

### Vercel

1. Connect your GitHub repository
2. Add all environment variables to Vercel
3. Deploy

**Important**: Add environment variables to all environments (Development/Preview/Production)

### Environment Variables in Production

Ensure these are set in your production environment:
- All variables from `.env.local`
- `NEXT_PUBLIC_SITE_URL` should point to your production domain
- `STRIPE_SECRET_KEY` should use live keys for production

## API Endpoints

### Authentication Required
- `GET /api/entitlement` - Get user subscription status
- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/create-portal-session` - Create billing portal session

### Public
- `POST /api/webhooks` - Stripe webhook handler
- `GET /api/confirm-subscription` - Confirm subscription after checkout

### CORS Support

All API endpoints support CORS for Chrome extension integration:
- Allows `chrome-extension://` origins
- Supports credentials for authenticated requests
- Handles preflight requests automatically

## Chrome Extension Integration

The web app provides APIs for the Chrome extension to:
1. Check user entitlement status
2. Verify Pro membership
3. Handle authentication tokens

The extension should:
1. Store Supabase JWT in `chrome.storage.local.mathly_token`
2. Call `/api/entitlement` with `Authorization: Bearer <token>`
3. Store `mly_premium` boolean in `chrome.storage.sync`

## Troubleshooting

### Common Issues

1. **Build fails with "supabaseKey is required"**
   - Ensure all environment variables are set
   - Check `.env.local` file exists

2. **CORS errors from Chrome extension**
   - Verify `NEXT_PUBLIC_SITE_URL` is set correctly
   - Check webhook endpoint configuration

3. **Stripe webhooks not working**
   - Verify webhook secret in environment
   - Check webhook endpoint URL in Stripe dashboard
   - Use Stripe CLI for local testing

4. **Subscription status not updating**
   - Check webhook events in Stripe dashboard
   - Verify Supabase service role key has proper permissions
   - Check browser console for API errors

### Support

For issues related to:
- **Stripe**: Check Stripe dashboard logs and webhook events
- **Supabase**: Check Supabase logs and database policies
- **Web App**: Check browser console and network tab
- **Chrome Extension**: Check extension console and storage

## License

This project is proprietary software owned by Mathly.
