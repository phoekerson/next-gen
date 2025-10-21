import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    // Vérification de l'authentification
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentification requise pour télécharger des fichiers' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get('id');

    if (!documentId) {
      return NextResponse.json({ 
        error: 'ID du document requis' 
      }, { status: 400 });
    }

    // Récupération du document
    const document = await prisma.document.findUnique({
      where: { id: parseInt(documentId) },
      include: { uploadedBy: true }
    });

    if (!document) {
      return NextResponse.json({ 
        error: 'Document non trouvé' 
      }, { status: 404 });
    }

    console.log('📥 Redirection vers Cloudinary:', {
      documentId: document.id,
      filename: document.filename,
      userId,
      fileUrl: document.fileUrl
    });

    // Redirection directe vers l'URL Cloudinary
    return NextResponse.redirect(document.fileUrl);

  } catch (err: any) {
    console.error('❌ Erreur lors de la redirection:', err);
    return NextResponse.json({ 
      error: 'Erreur lors de la redirection: ' + err.message
    }, { status: 500 });
  }
}
