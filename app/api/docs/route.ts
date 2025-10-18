import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Validation des paramètres
    const validLevels = ['L1', 'L2', 'L3', 'M1', 'M2'];
    if (level && !validLevels.includes(level)) {
      return NextResponse.json({ 
        error: 'Niveau invalide. Valeurs acceptées: L1, L2, L3, M1, M2' 
      }, { status: 400 });
    }

    const where = level ? { level: level as any } : {};
    const skip = (page - 1) * limit;

    const [docs, totalCount] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { 
          uploadedBy: {
            select: {
              id: true,
              name: true,
              avatarUrl: true
            }
          }
        },
        skip,
        take: limit,
      }),
      prisma.document.count({ where })
    ]);

    return NextResponse.json({ 
      docs,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (err: any) {
    console.error('❌ Erreur lors de la récupération des documents:', err);
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des documents' 
    }, { status: 500 });
  }
}