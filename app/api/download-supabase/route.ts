import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin, supabaseBucket } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
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

    const document = await prisma.document.findUnique({
      where: { id: parseInt(documentId) },
      include: { uploadedBy: true }
    });

    if (!document) {
      return NextResponse.json({ 
        error: 'Document non trouvé' 
      }, { status: 404 });
    }

    console.log('📥 Téléchargement Supabase:', {
      documentId: document.id,
      filename: document.filename,
      userId
    });

    // Vérification de la configuration Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Configuration Supabase manquante');
      return NextResponse.json({ 
        error: 'Configuration Supabase manquante' 
      }, { status: 500 });
    }

    // Extraire le chemin du fichier depuis l'URL Supabase
    // Format: https://dznoiwrhrrqwmihdjkhe.storage.supabase.co/storage/v1/object/public/documents/lbs_documents/L1/filename.pdf
    let filePath: string;
    
    try {
      const url = new URL(document.fileUrl);
      const pathParts = url.pathname.split('/');
      const documentsIndex = pathParts.indexOf('documents');
      
      if (documentsIndex === -1 || documentsIndex === pathParts.length - 1) {
        throw new Error('URL Supabase invalide - pas de segment "documents"');
      }
      
      filePath = pathParts.slice(documentsIndex + 1).join('/');
      console.log('Chemin du fichier extrait:', filePath);
      
    } catch (error) {
      console.error('Erreur extraction chemin:', error);
      return NextResponse.json({ 
        error: 'Impossible d\'extraire le chemin du fichier' 
      }, { status: 400 });
    }

    // Télécharger le fichier depuis Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(supabaseBucket)
      .download(filePath);

    if (downloadError) {
      console.error('Erreur téléchargement Supabase:', downloadError);
      return NextResponse.json({ 
        error: 'Erreur lors du téléchargement: ' + downloadError.message 
      }, { status: 500 });
    }

    if (!fileData) {
      return NextResponse.json({ 
        error: 'Fichier non trouvé' 
      }, { status: 404 });
    }

    // Convertir le Blob en ArrayBuffer
    const fileBuffer = await fileData.arrayBuffer();

    // Création de la réponse avec le fichier
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${document.filename}"`);
    headers.set('Content-Type', document.fileType || 'application/octet-stream');
    headers.set('Content-Length', fileBuffer.byteLength.toString());

    console.log(`Fichier téléchargé: ${document.filename} (${fileBuffer.byteLength} bytes)`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (err: any) {
    console.error('Erreur lors du téléchargement:', err);
    return NextResponse.json({ 
      error: 'Erreur lors du téléchargement: ' + err.message
    }, { status: 500 });
  }
}

