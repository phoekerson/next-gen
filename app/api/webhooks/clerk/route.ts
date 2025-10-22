import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Veuillez ajouter CLERK_WEBHOOK_SECRET dans .env');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Erreur vérification webhook:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  const eventType = evt.type;

  // Création d'utilisateur lors de l'inscription
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Étudiant';
      
      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0]?.email_address || null,
          name: fullName,
          avatarUrl: image_url || null,
        },
      });
      console.log('✅ Utilisateur créé dans Supabase:', id);
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      return new Response('Error: User creation failed', { status: 500 });
    }
  }

  // Mise à jour d'utilisateur
  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'Étudiant';
      
      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address || null,
          name: fullName,
          avatarUrl: image_url || null,
        },
      });
      console.log('✅ Utilisateur mis à jour:', id);
    } catch (error) {
      console.error('❌ Erreur mise à jour utilisateur:', error);
    }
  }

  // Suppression d'utilisateur
  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      await prisma.user.delete({
        where: { clerkId: id || '' },
      });
      console.log('✅ Utilisateur supprimé:', id);
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
    }
  }

  return new Response('Webhook traité', { status: 200 });
}