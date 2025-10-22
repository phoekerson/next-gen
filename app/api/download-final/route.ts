import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const docId = searchParams.get('id');

    if (!docId) {
      return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    // Récupérer le document
    const doc = await prisma.document.findUnique({
      where: { id: parseInt(docId) },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
    }

    // Télécharger le fichier depuis Supabase
    const response = await fetch(doc.fileUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erreur lors du téléchargement du fichier' },
        { status: 500 }
      );
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Déterminer le type MIME
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.filename)}"`,
      },
    });
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}