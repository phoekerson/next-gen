// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fileBase64,
      title,
      description,
      level,
      filename,
      fileType,
      clerkId,
      uploadedByName,
    } = body;

    // Validation des champs requis
    if (!fileBase64 || !title || !level || !clerkId || !filename) {
      return NextResponse.json({ 
        error: 'Champs manquants: fileBase64, title, level, clerkId et filename sont requis' 
      }, { status: 400 });
    }

    // Validation du format de fichier
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ 
        error: 'Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX' 
      }, { status: 400 });
    }

    // Validation du niveau
    const validLevels = ['L1', 'L2', 'L3', 'M1', 'M2'];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ 
        error: 'Niveau invalide. Valeurs acceptées: L1, L2, L3, M1, M2' 
      }, { status: 400 });
    }

    // Vérification de la configuration Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Configuration Cloudinary manquante');
      return NextResponse.json({ 
        error: 'Configuration Cloudinary manquante. Vérifiez les variables d\'environnement.' 
      }, { status: 500 });
    }

    console.log('🔄 Début de l\'upload vers Cloudinary...');
    
    // Upload vers Cloudinary avec gestion d'erreur améliorée
    const result = await cloudinary.uploader.upload(fileBase64, {
      resource_type: 'auto',
      folder: `lbs_documents/${level}`,
      public_id: `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      overwrite: false,
      tags: [`level_${level}`, 'lbs_document'],
      // Configuration pour permettre l'accès public
      access_mode: 'public',
      use_filename: false,
      unique_filename: true
    });

    console.log('✅ Upload Cloudinary réussi:', result.secure_url);

    // Assure la présence de l'utilisateur
    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      console.log('🔄 Création d\'un nouvel utilisateur:', clerkId);
      user = await prisma.user.create({
        data: { 
          clerkId, 
          name: uploadedByName ?? 'Utilisateur' 
        },
      });
    } else {
      console.log('✅ Utilisateur existant trouvé:', user.name);
    }

    console.log('🔄 Création du document en base de données...');
    
    const doc = await prisma.document.create({
      data: {
        title,
        description: description || '',
        level,
        fileUrl: result.secure_url,
        fileType,
        filename,
        uploadedById: user.id,
        uploadedByName: uploadedByName ?? user.name ?? 'Anonyme',
      },
    });

    console.log('✅ Document créé avec succès:', doc.id);

    return NextResponse.json({ 
      success: true,
      doc,
      message: 'Upload réussi!'
    });

  } catch (err: any) {
    console.error('❌ Erreur upload:', err);
    
    // Gestion d'erreurs spécifiques
    if (err.message?.includes('Invalid file type')) {
      return NextResponse.json({ 
        error: 'Type de fichier non supporté par Cloudinary' 
      }, { status: 400 });
    }
    
    if (err.message?.includes('File too large')) {
      return NextResponse.json({ 
        error: 'Fichier trop volumineux. Taille maximale: 100MB' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: err.message ?? 'Erreur lors de l\'upload' 
    }, { status: 500 });
  }
}
