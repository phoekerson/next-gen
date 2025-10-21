import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paramsToSign } = body;

    if (!paramsToSign) {
      return NextResponse.json({ 
        error: 'Paramètres manquants' 
      }, { status: 400 });
    }

    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Configuration Cloudinary manquante');
      return NextResponse.json({ 
        error: 'Configuration Cloudinary manquante' 
      }, { status: 500 });
    }

    // Génération de la signature
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign, 
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      signature,
    });

  } catch (err: any) {
    console.error('Erreur lors de la signature:', err);
    return NextResponse.json({ 
      error: 'Erreur lors de la signature des paramètres' 
    }, { status: 500 });
  }
}
