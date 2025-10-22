const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('🔄 Test de connexion à la base de données...');
    
    // Test de connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    // Test de création d'utilisateur
    console.log('🔄 Test de création d\'utilisateur...');
    const testUser = await prisma.user.upsert({
      where: { clerkId: 'test_user_123' },
      update: { name: 'Test User Updated' },
      create: { 
        clerkId: 'test_user_123',
        email: 'test@example.com',
        name: 'Test User'
      },
    });
    console.log('✅ Utilisateur créé/mis à jour:', testUser);

    // Test de création de document
    console.log('🔄 Test de création de document...');
    const testDoc = await prisma.document.create({
      data: {
        title: 'Document de test',
        description: 'Ceci est un document de test',
        level: 'L1',
        fileUrl: 'https://example.com/test.pdf',
        fileType: 'application/pdf',
        filename: 'test.pdf',
        uploadedById: testUser.id,
        uploadedByName: 'Test User',
      },
    });
    console.log('✅ Document créé:', testDoc);

    // Test de récupération des documents
    console.log('🔄 Test de récupération des documents...');
    const docs = await prisma.document.findMany({
      include: { uploadedBy: true }
    });
    console.log('✅ Documents récupérés:', docs.length);

    // Nettoyage
    await prisma.document.delete({ where: { id: testDoc.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('🧹 Données de test supprimées');

    console.log('🎉 Tous les tests de base de données sont passés !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
