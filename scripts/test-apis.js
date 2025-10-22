const { PrismaClient } = require('@prisma/client');

async function testAPIs() {
  const prisma = new PrismaClient();

  try {
    console.log('🧪 Test des APIs de l\'application...\n');

    // Test 1: API /api/docs
    console.log('1️⃣ Test API /api/docs');
    try {
      const response = await fetch('http://localhost:3000/api/docs');
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ API /api/docs fonctionne - ${data.docs?.length || 0} documents trouvés`);
      } else {
        console.log(`❌ API /api/docs erreur: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ API /api/docs erreur: ${error.message}`);
    }

    // Test 2: Vérification des utilisateurs
    console.log('\n2️⃣ Test synchronisation utilisateurs');
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    
    if (users.length > 0) {
      console.log(`✅ ${users.length} utilisateurs trouvés dans la base:`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name || 'Sans nom'} (${user.clerkId})`);
      });
    } else {
      console.log('⚠️  Aucun utilisateur trouvé. Vérifiez le webhook Clerk.');
    }

    // Test 3: Vérification des documents
    console.log('\n3️⃣ Test documents');
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { uploadedBy: true }
    });
    
    if (docs.length > 0) {
      console.log(`✅ ${docs.length} documents trouvés:`);
      docs.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.title} (${doc.level}) - ${doc.filename}`);
      });
    } else {
      console.log('ℹ️  Aucun document trouvé. Testez l\'upload.');
    }

    // Test 4: Vérification des URLs Supabase
    console.log('\n4️⃣ Test URLs Supabase');
    const docsWithUrls = await prisma.document.findMany({
      where: {
        fileUrl: {
          contains: 'supabase'
        }
      },
      take: 1
    });

    if (docsWithUrls.length > 0) {
      const doc = docsWithUrls[0];
      console.log(`✅ URL Supabase trouvée: ${doc.fileUrl}`);
      
      // Test de l'URL
      try {
        const urlResponse = await fetch(doc.fileUrl, { method: 'HEAD' });
        if (urlResponse.ok) {
          console.log('✅ URL Supabase accessible');
        } else {
          console.log(`⚠️  URL Supabase non accessible: ${urlResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ Erreur test URL: ${error.message}`);
      }
    } else {
      console.log('ℹ️  Aucun document avec URL Supabase trouvé');
    }

    console.log('\n🎯 Résumé des tests:');
    console.log(`- Utilisateurs: ${users.length}`);
    console.log(`- Documents: ${docs.length}`);
    console.log(`- URLs Supabase: ${docsWithUrls.length}`);

    if (users.length === 0) {
      console.log('\n⚠️  RECOMMANDATIONS:');
      console.log('1. Configurez le webhook Clerk');
      console.log('2. Inscrivez-vous avec un nouveau compte');
      console.log('3. Vérifiez les logs du serveur');
    }

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIs();
