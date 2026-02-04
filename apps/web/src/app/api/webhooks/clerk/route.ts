import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  // Get webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create webhook instance
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify webhook
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Create user in Supabase
    try {
      const { error } = await supabase.from('users').insert({
        id: id,
        email: email_addresses[0]?.email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        role: 'client', // Default role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error creating user in Supabase:', error);
        // Don't fail the webhook - Clerk user is already created
      }
    } catch (error) {
      console.error('Error syncing user to Supabase:', error);
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Update user in Supabase
    try {
      const { error } = await supabase
        .from('users')
        .update({
          email: email_addresses[0]?.email_address,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
      }
    } catch (error) {
      console.error('Error syncing user update to Supabase:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    // Soft delete or mark as deleted in Supabase
    try {
      const { error } = await supabase
        .from('users')
        .update({
          deleted_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting user in Supabase:', error);
      }
    } catch (error) {
      console.error('Error syncing user deletion to Supabase:', error);
    }
  }

  return new Response('Webhook processed', { status: 200 });
}
