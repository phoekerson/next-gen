#!/usr/bin/env node

// Script de test pour le téléchargement
console.log('🧪 Test du système de téléchargement\n');

// Vérifier les fichiers de téléchargement
const downloadFiles = [
  'app/api/download/route.ts',
  'app/api/download-file/route.ts',
  'components/DocumentCard.tsx'
];

console.log('📁 Vérification des fichiers de téléchargement:');
let allFilesExist = true;

downloadFiles.forEach(file => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

console.log('\n🔧 Instructions de test:');
console.log('1. Démarrez l\'application: npm run dev');
console.log('2. Connectez-vous avec Clerk');
console.log('3. Upload un fichier PDF');
console.log('4. Testez le bouton "Télécharger" (utilise /api/download-file)');
console.log('5. Testez le bouton "Ouvrir directement" (lien direct Cloudinary)');

if (allFilesExist) {
  console.log('\n✅ Tous les fichiers de téléchargement sont présents!');
  console.log('\n💡 Si vous obtenez encore une erreur 401:');
  console.log('   - Vérifiez votre configuration Cloudinary');
  console.log('   - Assurez-vous que les fichiers sont uploadés correctement');
  console.log('   - Vérifiez les logs de la console pour plus de détails');
} else {
  console.log('\n❌ Fichiers manquants détectés!');
}
