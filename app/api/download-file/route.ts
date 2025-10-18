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

    console.log('📥 Téléchargement direct via serveur:', {
      documentId: document.id,
      filename: document.filename,
      userId
    });

    // Vérification de la configuration Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Configuration Cloudinary manquante pour le téléchargement');
      return NextResponse.json({ 
        error: 'Configuration Cloudinary manquante' 
      }, { status: 500 });
    }

    // Génération d'une URL signée Cloudinary pour le téléchargement
    const cloudinary = require('cloudinary').v2;
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Extraction du public_id depuis l'URL
    const urlParts = document.fileUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) {
      throw new Error('URL Cloudinary invalide');
    }
    
    const publicId = urlParts.slice(uploadIndex + 2).join('/').replace(/\.[^/.]+$/, "");
    
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

    // Téléchargement du fichier depuis Cloudinary avec l'URL signée
    const response = await fetch(signedUrl);
    
    if (!response.ok) {
      console.error(`❌ Erreur Cloudinary: ${response.status} - ${response.statusText}`);
      console.error('URL signée:', signedUrl);
      throw new Error(`Erreur lors de la récupération du fichier: ${response.status}`);
    }

    const fileBuffer = await response.arrayBuffer();
    
    // Création de la réponse avec le fichier
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${document.filename}"`);
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    headers.set('Content-Length', fileBuffer.byteLength.toString());

    console.log(`✅ Fichier téléchargé: ${document.filename} (${fileBuffer.byteLength} bytes)`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (err: any) {
    console.error('❌ Erreur lors du téléchargement direct:', err);
    return NextResponse.json({ 
      error: 'Erreur lors du téléchargement: ' + err.message
    }, { status: 500 });
  }
}
