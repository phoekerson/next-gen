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

    console.log('📥 Téléchargement direct:', {
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

    // Extraction du public_id depuis l'URL Cloudinary
    // Format attendu: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    let publicId;
    
    try {
      // Méthode 1: Extraction manuelle
      const urlParts = document.fileUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      
      if (uploadIndex === -1) {
        throw new Error('URL Cloudinary invalide - pas de segment "upload"');
      }
      
      // Prendre tout après 'upload' et avant l'extension
      const pathAfterUpload = urlParts.slice(uploadIndex + 1);
      publicId = pathAfterUpload.join('/');
      
      // Supprimer l'extension du fichier
      publicId = publicId.replace(/\.[^/.]+$/, "");
      
      console.log('🔍 Public ID extrait (méthode manuelle):', publicId);
      console.log('🔍 URL originale:', document.fileUrl);
      
    } catch (error) {
      console.error('❌ Erreur extraction manuelle:', error);
      
      // Méthode 2: Utiliser l'API Cloudinary pour extraire le public_id
      try {
        const cloudinaryUrl = new URL(document.fileUrl);
        const pathname = cloudinaryUrl.pathname;
        
        // Extraire le public_id depuis le pathname
        // Format: /image/upload/v1234567890/folder/filename.jpg
        const pathParts = pathname.split('/');
        const uploadIndex = pathParts.indexOf('upload');
        
        if (uploadIndex !== -1 && pathParts.length > uploadIndex + 1) {
          const pathAfterUpload = pathParts.slice(uploadIndex + 1);
          publicId = pathAfterUpload.join('/').replace(/\.[^/.]+$/, "");
          console.log('🔍 Public ID extrait (méthode URL):', publicId);
        } else {
          throw new Error('Impossible d\'extraire le public_id');
        }
      } catch (urlError) {
        console.error('❌ Erreur extraction URL:', urlError);
        throw new Error('Impossible d\'extraire le public_id depuis l\'URL Cloudinary');
      }
    }
    
    // Génération d'une URL signée Cloudinary pour le téléchargement
    let fileBuffer;
    
    try {
      console.log('🔄 Génération d\'URL signée Cloudinary...');
      
      // Générer une URL signée avec les bonnes transformations
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
      
      // Télécharger le fichier depuis l'URL signée
      const response = await fetch(signedUrl);
      
      if (!response.ok) {
        console.error(`❌ Erreur URL signée: ${response.status} - ${response.statusText}`);
        throw new Error(`Erreur URL signée: ${response.status}`);
      }
      
      fileBuffer = await response.arrayBuffer();
      console.log('✅ Fichier téléchargé via URL signée');
      
    } catch (signedError) {
      console.error('❌ Erreur URL signée:', signedError);
      
      // Fallback: Utiliser l'URL originale avec une requête authentifiée
      try {
        console.log('🔄 Fallback: URL originale avec authentification...');
        
        // Créer une URL signée simple sans transformations
        const simpleSignedUrl = cloudinary.url(publicId, {
          sign_url: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          resource_type: 'auto'
        });
        
        console.log('🔗 URL signée simple:', simpleSignedUrl);
        
        const response = await fetch(simpleSignedUrl);
        if (!response.ok) {
          throw new Error(`Erreur URL simple: ${response.status}`);
        }
        
        fileBuffer = await response.arrayBuffer();
        console.log('✅ Fichier téléchargé via URL simple');
        
      } catch (simpleError) {
        console.error('❌ Erreur URL simple:', simpleError);
        
        // Dernier recours: Redirection vers l'URL originale
        console.log('🔄 Dernier recours: Redirection...');
        
        // Retourner une redirection vers l'URL originale
        return NextResponse.redirect(document.fileUrl);
      }
    }
    
    // Création de la réponse avec le fichier
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${document.filename}"`);
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Length', fileBuffer.byteLength.toString());

    console.log(`✅ Fichier téléchargé: ${document.filename} (${fileBuffer.byteLength} bytes)`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (err: any) {
    console.error('❌ Erreur lors du téléchargement:', err);
    return NextResponse.json({ 
      error: 'Erreur lors du téléchargement: ' + err.message
    }, { status: 500 });
  }
}
