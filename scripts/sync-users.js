const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@clerk/nextjs/server');

const prisma = new PrismaClient();

async function syncAllUsers() {
  try {
    console.log('🔄 Début de la synchronisation des utilisateurs...');
    
    // Note: Cette approche nécessite d'utiliser l'API Clerk côté serveur
    // Pour l'instant, on va créer un script qui peut être exécuté manuellement
    
    console.log('⚠️  Pour synchroniser les utilisateurs existants:');
    console.log('1. Allez sur le dashboard Clerk');
    console.log('2. Exportez la liste des utilisateurs');
    console.log('3. Utilisez l\'endpoint /api/sync-user pour chaque utilisateur');
    console.log('4. Ou configurez le webhook Clerk pour les nouveaux utilisateurs');
    
    console.log('✅ Script terminé');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAllUsers();

