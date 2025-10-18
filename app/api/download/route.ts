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

    console.log('📥 Tentative de téléchargement:', {
      documentId: document.id,
      filename: document.filename,
      fileUrl: document.fileUrl,
      userId
    });

    // Vérification de la configuration Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Configuration Cloudinary manquante pour le téléchargement');
      return NextResponse.json({ 
        error: 'Configuration Cloudinary manquante' 
      }, { status: 500 });
    }

    // Génération d'une URL signée Cloudinary
    const cloudinary = require('cloudinary').v2;
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Extraction du public_id depuis l'URL
    const urlParts = document.fileUrl.split('/');
    const cloudName = urlParts[urlParts.indexOf('upload') + 1];
    const version = urlParts[urlParts.indexOf('upload') + 2];
    const publicId = urlParts.slice(urlParts.indexOf('upload') + 3).join('/').replace(/\.[^/.]+$/, "");
    
    console.log('🔍 Public ID extrait:', publicId);
    
    // Génération d'une URL signée avec expiration
    const signedUrl = cloudinary.url(publicId, {
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 heure
      resource_type: 'auto',
      transformation: [
        { flags: 'attachment' },
        { filename: document.filename }
      ]
    });
    
    console.log('🔗 URL signée générée:', signedUrl);

    // Log du téléchargement pour statistiques
    console.log(`✅ Téléchargement autorisé: ${document.filename} par utilisateur ${userId}`);

    return NextResponse.json({ 
      downloadUrl: signedUrl,
      filename: document.filename,
      title: document.title,
      message: 'URL de téléchargement générée avec succès'
    });

  } catch (err: any) {
    console.error('❌ Erreur lors du téléchargement:', err);
    return NextResponse.json({ 
      error: 'Erreur lors de la génération du lien de téléchargement: ' + err.message
    }, { status: 500 });
  }
}
