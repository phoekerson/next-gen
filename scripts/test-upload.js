#!/usr/bin/env node

// Script de test pour vérifier l'upload et le téléchargement
const fs = require('fs');
const path = require('path');

console.log('🧪 Test de l\'application LBS Docs\n');

// Vérifier les fichiers essentiels
const essentialFiles = [
  'app/api/upload/route.ts',
  'app/api/download/route.ts',
  'app/api/docs/route.ts',
  'app/api/sync-user/route.ts',
  'components/UploadForm.tsx',
  'components/DocumentCard.tsx',
  'lib/cloudinary.ts',
  'lib/prisma.ts',
  'middleware.ts',
  'prisma/schema.prisma'
];

console.log('📁 Vérification des fichiers essentiels:');
let allFilesExist = true;

essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

// Vérifier les variables d'environnement
console.log('\n🔧 Vérification des variables d\'environnement:');
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

let allEnvVarsExist = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`);
  } else {
    console.log(`❌ ${envVar} - MANQUANT`);
    allEnvVarsExist = false;
  }
});

// Résumé
console.log('\n📊 Résumé:');
console.log(`Fichiers: ${allFilesExist ? '✅ Tous présents' : '❌ Fichiers manquants'}`);
console.log(`Variables d'environnement: ${allEnvVarsExist ? '✅ Toutes définies' : '❌ Variables manquantes'}`);

if (allFilesExist && allEnvVarsExist) {
  console.log('\n🎉 Configuration complète! Vous pouvez lancer l\'application avec:');
  console.log('   npm run dev');
  console.log('\n💡 Pour tester:');
  console.log('   1. Ouvrez http://localhost:3000');
  console.log('   2. Connectez-vous avec Clerk');
  console.log('   3. Testez l\'upload d\'un fichier');
  console.log('   4. Testez le téléchargement');
} else {
  console.log('\n⚠️  Configuration incomplète. Vérifiez les éléments manquants.');
  process.exit(1);
}
