import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin, supabaseBucket } from '@/lib/supabase';
import { Level } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const level = formData.get('level') as string;

    // Validation
    if (!file || !title || !level) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    if (!Object.values(Level).includes(level as Level)) {
      return NextResponse.json({ error: 'Niveau invalide' }, { status: 400 });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}_${sanitizedFilename}`;
    const filePath = `lbs_documents/${level}/${uniqueFilename}`;

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(supabaseBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Erreur upload Supabase:', uploadError);
      return NextResponse.json({ 
        error: 'Erreur lors de l\'upload: ' + uploadError.message 
      }, { status: 500 });
    }

    // Obtenir l'URL publique du fichier
    const { data: urlData } = supabaseAdmin.storage
      .from(supabaseBucket)
      .getPublicUrl(filePath);

    const fileUrl = urlData.publicUrl;

    // Récupérer ou créer l'utilisateur
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      // Si l'utilisateur n'existe pas, le créer avec les données de base
      user = await prisma.user.create({
        data: { 
          clerkId: userId, 
          name: 'Utilisateur' 
        },
      });
    }

    // Créer le document
    const doc = await prisma.document.create({
      data: {
        title,
        description: description || '',
        level: level as Level,
        fileUrl,
        fileType: file.type || 'application/octet-stream',
        filename: file.name,
        uploadedById: user.id,
        uploadedByName: user.name || 'Anonyme',
      },
    });

    return NextResponse.json({ 
      success: true,
      doc,
      message: 'Upload réussi!'
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'upload: ' + (error as Error).message
    }, { status: 500 });
  }
}