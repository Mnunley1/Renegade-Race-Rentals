import { httpRouter } from 'convex/server';
import Stripe from 'stripe';
import { httpAction } from './_generated/server';

// Helper function to get Stripe instance
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });
}

const http = httpRouter();

http.route({
  path: '/stripe/webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature', { status: 400 });
    }

    try {
      const stripe = getStripe();
      const event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );

      console.log('Received webhook event:', event.type);

      // Handle the event
      await ctx.runMutation('stripe:handleWebhook', {
        eventType: event.type,
        paymentIntentId: event.data.object.id,
        data: event.data.object,
      });

      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('Webhook error:', error);
      return new Response('Webhook error', { status: 400 });
    }
  }),
});

export default http;
