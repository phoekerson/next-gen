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
    
    console.log('🔍 Public ID:', publicId);

    try {
      // Déterminer le type de ressource basé sur l'extension du fichier
      const fileExtension = document.filename.toLowerCase().split('.').pop();
      let resourceType = 'image'; // par défaut
      
      if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(fileExtension || '')) {
        resourceType = 'raw';
      } else if (['mp4', 'avi', 'mov', 'wmv'].includes(fileExtension || '')) {
        resourceType = 'video';
      } else if (['mp3', 'wav', 'aac', 'ogg'].includes(fileExtension || '')) {
        resourceType = 'video'; // audio est traité comme video dans Cloudinary
      }

      console.log('🔍 Type de ressource détecté:', resourceType, 'pour extension:', fileExtension);

      // Utiliser l'API Cloudinary pour télécharger le fichier directement
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      });

      console.log('📦 Fichier récupéré via API:', {
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes
      });

      // Télécharger le fichier depuis l'URL sécurisée
      const downloadResponse = await fetch(result.secure_url);
      
      if (!downloadResponse.ok) {
        throw new Error(`Erreur lors du téléchargement: ${downloadResponse.status}`);
      }

      const fileBuffer = await downloadResponse.arrayBuffer();
      
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
      headers.set('Content-Type', downloadResponse.headers.get('Content-Type') || 'application/octet-stream');
      headers.set('Content-Length', fileBuffer.byteLength.toString());

      console.log(`✅ Fichier téléchargé: ${document.filename} (${fileBuffer.byteLength} bytes)`);

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });

    } catch (apiError: any) {
      console.error('❌ Erreur API Cloudinary:', apiError);
      
      // Fallback: essayer l'URL originale
      console.log('🔄 Fallback vers URL originale...');
      const originalResponse = await fetch(document.fileUrl);
      
      if (!originalResponse.ok) {
        throw new Error(`Erreur API Cloudinary et URL originale: ${apiError.message}`);
      }

      const fileBuffer = await originalResponse.arrayBuffer();
      
      const safeFilename = document.filename
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x00-\x7F]/g, '')
        .replace(/["\\]/g, '')
        .trim();

      const headers = new Headers();
      headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
      headers.set('Content-Type', originalResponse.headers.get('Content-Type') || 'application/octet-stream');
      headers.set('Content-Length', fileBuffer.byteLength.toString());

      console.log(`✅ Fichier téléchargé via fallback: ${document.filename} (${fileBuffer.byteLength} bytes)`);

      return new NextResponse(fileBuffer, {
        status: 200,
        headers,
      });
    }

  } catch (err: any) {
    console.error('❌ Erreur lors du téléchargement direct:', err);
    return NextResponse.json({ 
      error: 'Erreur lors du téléchargement: ' + err.message
    }, { status: 500 });
  }
}
