import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Fonction pour nettoyer le nom de fichier des caractères non-ASCII
function sanitizeFilename(filename: string): string {
  return filename
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^\x00-\x7F]/g, '') // Supprime les caractères non-ASCII
    .replace(/["\\]/g, '') // Supprime les guillemets et backslashes
    .trim();
}

// Fonction pour encoder le filename selon RFC 5987
function encodeRFC5987(filename: string): string {
  return `UTF-8''${encodeURIComponent(filename)}`;
}

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

    console.log('📥 Téléchargement:', {
      documentId: document.id,
      filename: document.filename,
      userId,
      fileUrl: document.fileUrl
    });

    // Nettoyer le nom de fichier pour les caractères ASCII seulement
    const safeFilename = sanitizeFilename(document.filename);
    
    // Utiliser le format RFC 5987 pour supporter les noms de fichiers internationaux
    const encodedFilename = encodeRFC5987(document.filename);

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
     
     // Génération d'une URL signée simple sans transformations
     const signedUrl = cloudinary.url(publicId, {
       sign_url: true,
       expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 heure
       resource_type: 'auto'
     });
     
     console.log('🔗 URL signée générée:', signedUrl);

     // Téléchargement du fichier depuis Cloudinary avec l'URL signée
     const response = await fetch(signedUrl);
     
     if (!response.ok) {
       console.error(`❌ Erreur Cloudinary: ${response.status} - ${response.statusText}`);
       console.error('URL signée:', signedUrl);
       console.error('Public ID:', publicId);
       
       // Si l'URL signée échoue, essayer l'URL originale
       console.log('🔄 Tentative avec l\'URL originale...');
       const originalResponse = await fetch(document.fileUrl);
       
       if (!originalResponse.ok) {
         throw new Error(`Erreur lors de la récupération du fichier: ${response.status} (signée) et ${originalResponse.status} (originale)`);
       }
       
       // Utiliser la réponse originale
       const fileBuffer = await originalResponse.arrayBuffer();
       
       // Création de la réponse avec le fichier
       const headers = new Headers();
       headers.set('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=${encodedFilename}`);
       headers.set('Content-Type', originalResponse.headers.get('Content-Type') || 'application/octet-stream');
       headers.set('Content-Length', fileBuffer.byteLength.toString());

       console.log(`✅ Fichier téléchargé via URL originale: ${document.filename} (${fileBuffer.byteLength} bytes)`);

       return new NextResponse(fileBuffer, {
         status: 200,
         headers,
       });
     }

     const fileBuffer = await response.arrayBuffer();
     
     // Création de la réponse avec le fichier
     const headers = new Headers();
     headers.set('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=${encodedFilename}`);
     headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
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