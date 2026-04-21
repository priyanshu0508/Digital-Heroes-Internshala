import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Check if they are already active
  const { data: profile } = await supabase
    .from('profiles')
    .select('sub_status, stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  if (profile?.sub_status === 'active') {
    return NextResponse.redirect(new URL('/dashboard?message=You are already subscribed', request.url))
  }

  try {
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan')
    
    const priceId = plan === 'yearly' 
      ? process.env.STRIPE_YEARLY_PRICE_ID 
      : process.env.STRIPE_MONTHLY_PRICE_ID

    if (!priceId) {
      throw new Error(`Price ID is not configured for ${plan || 'monthly'} plan`)
    }

    // Setup the rigorous configuration for a powerful subscription tier
    const sessionConfig: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?message=Subscription Activated!`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?message=Checkout Cancelled`,
      client_reference_id: user.id, // CRITICAL: This links the webhook correctly
      customer_email: profile?.email || user.email,
    }

    // If a user previously cancelled but returns to buy again, reuse their existing Customer ID
    if (profile?.stripe_customer_id) {
      sessionConfig.customer = profile.stripe_customer_id
      // Stripe strictly forbids providing both customer ID and customer_email
      delete sessionConfig.customer_email
    }

    const stripeSession = await stripe.checkout.sessions.create(sessionConfig)

    if (stripeSession.url) {
      return NextResponse.redirect(stripeSession.url)
    }

    throw new Error('No URL generated')
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.redirect(new URL(`/dashboard?message=${encodeURIComponent(err.message)}`, request.url))
  }
}
