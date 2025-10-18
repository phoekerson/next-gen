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

    console.log('📥 Téléchargement final:', {
      documentId: document.id,
      filename: document.filename,
      userId,
      fileUrl: document.fileUrl
    });

    // Essayer plusieurs méthodes de téléchargement
    const methods = [
      // Méthode 1: URL originale avec headers de téléchargement
      async () => {
        console.log('🔄 Méthode 1: URL originale avec headers');
        const response = await fetch(document.fileUrl);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          return {
            buffer,
            contentType: response.headers.get('content-type') || 'application/octet-stream'
          };
        }
        throw new Error(`URL originale: ${response.status}`);
      },

      // Méthode 2: URL avec flag attachment
      async () => {
        console.log('🔄 Méthode 2: URL avec flag attachment');
        const urlWithAttachment = document.fileUrl.replace('/upload/', '/upload/fl_attachment/');
        const response = await fetch(urlWithAttachment);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          return {
            buffer,
            contentType: response.headers.get('content-type') || 'application/octet-stream'
          };
        }
        throw new Error(`URL attachment: ${response.status}`);
      },

      // Méthode 3: URL avec transformation de téléchargement
      async () => {
        console.log('🔄 Méthode 3: URL avec transformation');
        const urlWithTransform = document.fileUrl.replace('/upload/', '/upload/fl_attachment/');
        const response = await fetch(urlWithTransform);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          return {
            buffer,
            contentType: response.headers.get('content-type') || 'application/octet-stream'
          };
        }
        throw new Error(`URL transform: ${response.status}`);
      }
    ];

    let lastError: Error | null = null;

    // Essayer chaque méthode jusqu'à ce qu'une fonctionne
    for (let i = 0; i < methods.length; i++) {
      try {
        const result = await methods[i]();
        
        if (result) {
          console.log(`✅ Méthode ${i + 1} réussie!`);
          
          // Nettoyer le nom de fichier
          const safeFilename = document.filename
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\x00-\x7F]/g, '')
            .replace(/["\\]/g, '')
            .trim();

          // Création de la réponse avec le fichier
          const headers = new Headers();
          headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
          headers.set('Content-Type', result.contentType);
          headers.set('Content-Length', result.buffer.byteLength.toString());

          console.log(`✅ Fichier téléchargé: ${document.filename} (${result.buffer.byteLength} bytes)`);

          return new NextResponse(result.buffer, {
            status: 200,
            headers,
          });
        }
      } catch (error) {
        console.error(`❌ Méthode ${i + 1} échouée:`, error);
        lastError = error as Error;
        continue;
      }
    }

    // Si toutes les méthodes échouent
    throw lastError || new Error('Toutes les méthodes de téléchargement ont échoué');

  } catch (err: any) {
    console.error('❌ Erreur lors du téléchargement final:', err);
    return NextResponse.json({ 
      error: 'Erreur lors du téléchargement: ' + (err.message || 'Erreur inconnue')
    }, { status: 500 });
  }
}
