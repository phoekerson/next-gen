import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    // Vérification de l'authentification
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentification requise' 
      }, { status: 401 });
    }

    const body = await req.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json({ 
        error: 'ID du document requis' 
      }, { status: 400 });
    }

    // Récupération du document
    const document = await prisma.document.findUnique({
      where: { id: parseInt(documentId) }
    });

    if (!document) {
      return NextResponse.json({ 
        error: 'Document non trouvé' 
      }, { status: 404 });
    }

    // Vérification de la configuration Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ 
        error: 'Configuration Cloudinary manquante' 
      }, { status: 500 });
    }

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
    
    console.log('🔍 Rendre public le fichier:', publicId);

    // Rendre le fichier public
    const result = await cloudinary.api.update(publicId, {
      resource_type: 'auto',
      access_mode: 'public'
    });

    console.log('✅ Fichier rendu public:', result);

    return NextResponse.json({ 
      success: true,
      message: 'Fichier rendu public avec succès',
      result
    });

  } catch (err: any) {
    console.error('❌ Erreur lors de la configuration publique:', err);
    return NextResponse.json({ 
      error: 'Erreur lors de la configuration: ' + err.message
    }, { status: 500 });
  }
}
