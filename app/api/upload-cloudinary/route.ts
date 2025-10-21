import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      level,
      fileUrl,
      fileType,
      filename,
      clerkId,
      uploadedByName,
    } = body;

    // Validation des champs requis
    if (!title || !level || !clerkId || !fileUrl) {
      return NextResponse.json({ 
        error: 'Champs manquants: title, level, clerkId et fileUrl sont requis' 
      }, { status: 400 });
    }

    // Validation du niveau
    const validLevels = ['L1', 'L2', 'L3', 'M1', 'M2'];
    if (!validLevels.includes(level)) {
      return NextResponse.json({ 
        error: 'Niveau invalide. Valeurs acceptées: L1, L2, L3, M1, M2' 
      }, { status: 400 });
    }

    console.log('🔄 Enregistrement du document en base de données...');

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
        fileUrl,
        fileType: fileType || 'application/octet-stream',
        filename: filename || 'document',
        uploadedById: user.id,
        uploadedByName: uploadedByName ?? user.name ?? 'Anonyme',
      },
    });

    console.log('✅ Document créé avec succès:', doc.id);

    return NextResponse.json({ 
      success: true,
      doc,
      message: 'Document enregistré avec succès!'
    });

  } catch (err: any) {
    console.error('❌ Erreur enregistrement:', err);
    
    return NextResponse.json({ 
      error: err.message ?? 'Erreur lors de l\'enregistrement du document' 
    }, { status: 500 });
  }
}
