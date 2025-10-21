# Configuration Cloudinary

Pour utiliser le système d'upload avec Cloudinary, vous devez configurer les variables d'environnement suivantes :

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Comment obtenir ces valeurs

1. Créez un compte sur [Cloudinary](https://cloudinary.com)
2. Connectez-vous à votre dashboard
3. Dans la section "Product Environment Credentials", vous trouverez :
   - **Cloud Name** : Votre nom de cloud
   - **API Key** : Votre clé API
   - **API Secret** : Votre secret API

## Configuration du preset d'upload (optionnel)

Pour une sécurité optimale, vous pouvez configurer un preset d'upload dans Cloudinary :

1. Allez dans Settings > Upload
2. Créez un nouveau preset d'upload
3. Configurez les restrictions (taille, formats, etc.)
4. Utilisez le nom du preset dans votre configuration

## Test de la configuration

Une fois les variables configurées, redémarrez votre serveur de développement :

```bash
npm run dev
```

Le système d'upload devrait maintenant fonctionner avec le widget Cloudinary.
