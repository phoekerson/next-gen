import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Level } from "@/lib/types";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const levelParam = searchParams.get('level');

    const where: any = {};
    if (levelParam && Object.values(Level).includes(levelParam as Level)) {
      where.level = levelParam as Level;
    }

    const docs = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        filename: true,
        fileUrl: true,
        fileType: true,
        level: true,
        uploadedByName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ docs });
  } catch (error) {
    console.error('Erreur récupération documents:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des documents' },
      { status: 500 }
    );
  }
}