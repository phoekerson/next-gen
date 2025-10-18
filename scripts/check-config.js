#!/usr/bin/env node

// Script de vérification de la configuration
console.log('🔍 Vérification de la configuration...\n');

const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET',
  'DATABASE_URL',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

let allGood = true;

console.log('📋 Variables d\'environnement:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${envVar}: MANQUANTE`);
    allGood = false;
  }
});

console.log('\n📦 Dépendances:');
try {
  const packageJson = require('../package.json');
  const requiredDeps = [
    '@clerk/nextjs',
    'cloudinary',
    '@prisma/client',
    'prisma'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep] || packageJson.devDependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: MANQUANTE`);
      allGood = false;
    }
  });
} catch (error) {
  console.log('❌ Impossible de lire package.json');
  allGood = false;
}

if (allGood) {
  console.log('\n🎉 Configuration OK! Vous pouvez lancer l\'application.');
} else {
  console.log('\n⚠️  Configuration incomplète. Vérifiez les éléments manquants.');
  process.exit(1);
}
