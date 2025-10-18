// lib/cloudinary-utils.ts
import cloudinary from './cloudinary';

export async function generateSignedDownloadUrl(fileUrl: string, filename: string) {
  try {
    // Extraction du public_id depuis l'URL Cloudinary
    const urlParts = fileUrl.split('/');
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
        { filename: filename }
      ]
    });
    
    return signedUrl;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL signée:', error);
    throw error;
  }
}

export async function uploadFileToCloudinary(fileBase64: string, options: {
  folder: string;
  filename: string;
  level: string;
}) {
  try {
    const result = await cloudinary.uploader.upload(fileBase64, {
      resource_type: 'auto',
      folder: options.folder,
      public_id: `${Date.now()}_${options.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      overwrite: false,
      tags: [`level_${options.level}`, 'lbs_document'],
      // Configuration pour permettre l'accès public
      access_mode: 'public',
      use_filename: false,
      unique_filename: true
    });

    return result;
  } catch (error) {
    console.error('Erreur lors de l\'upload Cloudinary:', error);
    throw error;
  }
}
