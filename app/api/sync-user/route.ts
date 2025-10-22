import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clerkId, email, name, avatarUrl } = body;

    if (!clerkId) {
      return NextResponse.json({ error: 'clerkId manquant' }, { status: 400 });
    }

    console.log('🔄 Synchronisation utilisateur:', { clerkId, email, name });

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { 
        email, 
        name, 
        avatarUrl 
      },
      create: { 
        clerkId, 
        email, 
        name, 
        avatarUrl 
      },
    });

    console.log('Utilisateur synchronisé:', user.id);
    return NextResponse.json({ success: true, user });

  } catch (err: any) {
    console.error(' Erreur synchronisation utilisateur:', err);
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
  }
}