const { PrismaClient } = require('@prisma/client');

async function testUserSync() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Test de synchronisation des utilisateurs...\n');

    // Test 1: Vérifier les utilisateurs existants
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log('👥 Utilisateurs dans la base:');
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'Sans nom'} (${user.email || 'Pas d\'email'}) - ${user.clerkId}`);
      });
    } else {
      console.log('❌ Aucun utilisateur trouvé');
    }

    // Test 2: Test de l'API de synchronisation
    console.log('\n🔄 Test de l\'API de synchronisation...');
    
    const testUserData = {
      clerkId: 'test_user_' + Date.now(),
      email: 'test@example.com',
      name: 'Utilisateur Test',
      avatarUrl: null
    };

    try {
      const response = await fetch('http://localhost:3000/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUserData),
      });

      if (response.ok) {
        console.log('✅ API de synchronisation fonctionne');
        
        // Vérifier que l'utilisateur a été créé
        const createdUser = await prisma.user.findUnique({
          where: { clerkId: testUserData.clerkId }
        });

        if (createdUser) {
          console.log('✅ Utilisateur créé avec succès:', createdUser.name);
          
          // Nettoyer l'utilisateur de test
          await prisma.user.delete({ where: { id: createdUser.id } });
          console.log('🧹 Utilisateur de test supprimé');
        } else {
          console.log('❌ Utilisateur non trouvé après création');
        }
      } else {
        const error = await response.json();
        console.log('❌ Erreur API:', error);
      }
    } catch (error) {
      console.log('❌ Erreur test API:', error.message);
    }

    // Test 3: Vérifier la configuration
    console.log('\n🔧 Vérification de la configuration...');
    
    const envVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    envVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.log(`✅ ${varName}: Configuré`);
      } else {
        console.log(`❌ ${varName}: Manquant`);
      }
    });

    console.log('\n📊 Résumé:');
    console.log(`- Utilisateurs dans la base: ${users.length}`);
    console.log(`- API de synchronisation: ${users.length > 0 ? 'Fonctionne' : 'À tester'}`);

    if (users.length === 0) {
      console.log('\n⚠️  SOLUTIONS:');
      console.log('1. Connectez-vous avec Clerk sur l\'application');
      console.log('2. Vérifiez que le UserSyncProvider est actif');
      console.log('3. Regardez les logs dans la console du navigateur');
      console.log('4. Vérifiez que l\'API /api/sync-user fonctionne');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserSync();