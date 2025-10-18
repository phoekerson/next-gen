import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clerkId, email, name, avatarUrl } = body;

    if (!clerkId) {
      return NextResponse.json({ error: 'clerkId missing' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: { email, name, avatarUrl },
      create: { clerkId, email, name, avatarUrl },
    });

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error('sync-user error:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
