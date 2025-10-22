const { createClient } = require('@supabase/supabase-js');

async function setupSupabaseBucket() {
  // Utilisez vos vraies valeurs ici
  const supabaseUrl = 'https://dznoiwrhrrqwmihdjkhe.supabase.co';
  const supabaseServiceKey = 'VOTRE_SERVICE_ROLE_KEY_ICI'; // Remplacez par votre vraie clé

  if (supabaseServiceKey === 'VOTRE_SERVICE_ROLE_KEY_ICI') {
    console.error('❌ Veuillez remplacer SUPABASE_SERVICE_ROLE_KEY par votre vraie clé');
    console.log('📋 Instructions :');
    console.log('1. Allez sur https://supabase.com/dashboard');
    console.log('2. Sélectionnez votre projet');
    console.log('3. Allez dans Settings > API');
    console.log('4. Copiez la "service_role" key (pas l\'anon key)');
    console.log('5. Remplacez VOTRE_SERVICE_ROLE_KEY_ICI dans ce script');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Vérification du bucket "documents"...');
    
    // Lister les buckets existants
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erreur lors de la liste des buckets:', listError);
      return;
    }

    console.log('📦 Buckets existants:', buckets?.map(b => b.name));

    // Vérifier si le bucket "documents" existe
    const documentsBucket = buckets?.find(bucket => bucket.name === 'documents');
    
    if (!documentsBucket) {
      console.log('🔄 Création du bucket "documents"...');
      
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: true,
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'video/avi',
          'video/quicktime'
        ],
        fileSizeLimit: 10485760 // 10MB
      });

      if (error) {
        console.error('❌ Erreur création bucket:', error);
        return;
      }

      console.log('✅ Bucket "documents" créé avec succès');
    } else {
      console.log('✅ Bucket "documents" existe déjà');
    }

    console.log('🎉 Configuration Supabase terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

setupSupabaseBucket();