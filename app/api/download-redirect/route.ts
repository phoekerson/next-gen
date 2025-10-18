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

    console.log('📥 Téléchargement par redirection:', {
      documentId: document.id,
      filename: document.filename,
      userId
    });

    // Nettoyer le nom de fichier
    const safeFilename = document.filename
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/["\\]/g, '')
      .trim();

    // Construire l'URL Cloudinary avec le flag attachment
    let downloadUrl = document.fileUrl;
    
    // Ajouter le flag fl_attachment si ce n'est pas déjà présent
    if (!downloadUrl.includes('fl_attachment')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    console.log('🔗 URL de téléchargement:', downloadUrl);

    // Créer une redirection 302 avec les headers appropriés
    const headers = new Headers();
    headers.set('Location', downloadUrl);
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    
    // Ajouter des headers pour forcer le téléchargement
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    return new NextResponse(null, {
      status: 302,
      headers,
    });

  } catch (err: any) {
    console.error('❌ Erreur lors du téléchargement par redirection:', err);
    return NextResponse.json({ 
      error: 'Erreur lors du téléchargement: ' + err.message
    }, { status: 500 });
  }
}
