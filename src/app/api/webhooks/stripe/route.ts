import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const subscription = event.data.object as Stripe.Subscription

  switch (event.type) {
    case 'checkout.session.completed':
      if (session.client_reference_id) {
        // First time subscription setup
        await supabaseAdmin
          .from('profiles')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            sub_status: 'active',
          })
          .eq('id', session.client_reference_id)
      }
      break

    case 'customer.subscription.updated':
      // Fetch the profile matching this subscription to update its status
      await supabaseAdmin
        .from('profiles')
        .update({
          sub_status: subscription.status === 'active' ? 'active' : 'past_due',
        })
        .eq('stripe_subscription_id', subscription.id)
      break

    case 'customer.subscription.deleted':
      await supabaseAdmin
        .from('profiles')
        .update({
          sub_status: 'cancelled',
        })
        .eq('stripe_subscription_id', subscription.id)
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true }, { status: 200 })
}
