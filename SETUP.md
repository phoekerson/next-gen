# 🚀 Guide de Configuration - LBS Docs

## Prérequis

- Node.js 18+ 
- Compte Cloudinary
- Compte Clerk
- Base de données PostgreSQL (Neon recommandé)

## 1. Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
```

## 2. Configuration Cloudinary

1. Créez un compte sur [Cloudinary](https://cloudinary.com/)
2. Dans le Dashboard, récupérez :
   - Cloud Name
   - API Key  
   - API Secret
3. Ajoutez ces valeurs dans votre `.env.local`

## 3. Configuration Clerk

1. Créez un compte sur [Clerk](https://clerk.com/)
2. Créez une nouvelle application
3. Dans l'onglet "API Keys", récupérez :
   - Publishable Key
   - Secret Key
4. Configurez les URLs de redirection :
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

## 4. Configuration de la Base de Données

### Option A: Neon (Recommandé)

1. Créez un compte sur [Neon](https://neon.tech/)
2. Créez une nouvelle base de données
3. Copiez l'URL de connexion dans `DATABASE_URL`

### Option B: PostgreSQL Local

```bash
# Installation PostgreSQL
# Windows (avec Chocolatey)
choco install postgresql

# macOS (avec Homebrew)  
brew install postgresql

# Linux (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib
```

## 5. Installation et Démarrage

```bash
# Installation des dépendances
npm install

# Vérification de la configuration
npm run check-config

# Génération du client Prisma
npm run db:generate

# Application des migrations
npm run db:migrate

# Démarrage en développement
npm run dev
```

## 6. Vérification

1. Ouvrez http://localhost:3000
2. Créez un compte avec Clerk
3. Testez l'upload d'un document
4. Vérifiez le téléchargement

## 🔧 Scripts Disponibles

- `npm run dev` - Démarrage en développement
- `npm run build` - Build de production
- `npm run start` - Démarrage en production
- `npm run check-config` - Vérification de la configuration
- `npm run db:generate` - Génération du client Prisma
- `npm run db:push` - Push du schéma vers la DB
- `npm run db:migrate` - Application des migrations
- `npm run db:studio` - Interface Prisma Studio

## 🐛 Résolution de Problèmes

### Erreur "Variables d'environnement Cloudinary manquantes"
- Vérifiez que toutes les variables CLOUDINARY_* sont définies dans `.env.local`

### Erreur "Database connection failed"
- Vérifiez l'URL de la base de données
- Assurez-vous que la base de données est accessible

### Erreur "Clerk authentication failed"
- Vérifiez les clés Clerk dans `.env.local`
- Vérifiez la configuration des URLs de redirection

### Erreur d'upload
- Vérifiez la configuration Cloudinary
- Vérifiez la taille du fichier (max 100MB)
- Vérifiez le format du fichier (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX)

## 📁 Structure du Projet

```
next-gen-phoekerson/
├── app/
│   ├── api/
│   │   ├── docs/          # API pour récupérer les documents
│   │   ├── download/      # API pour télécharger les fichiers
│   │   ├── sync-user/     # API pour synchroniser les utilisateurs
│   │   └── upload/        # API pour uploader les fichiers
│   ├── dashboard/         # Page principale
│   └── layout.tsx         # Layout principal
├── components/
│   ├── DocumentCard.tsx   # Composant pour afficher un document
│   ├── Header.tsx         # En-tête de l'application
│   └── UploadForm.tsx     # Formulaire d'upload
├── lib/
│   ├── cloudinary.ts      # Configuration Cloudinary
│   ├── prisma.ts          # Configuration Prisma
│   └── utils.ts           # Utilitaires
├── prisma/
│   └── schema.prisma      # Schéma de base de données
└── scripts/
    └── check-config.js    # Script de vérification
```

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Ajoutez les variables d'environnement dans Vercel
3. Déployez automatiquement

### Autres Plateformes

Assurez-vous de configurer :
- Les variables d'environnement
- La base de données PostgreSQL
- Les domaines autorisés dans Clerk

---

💡 **Besoin d'aide ?** Vérifiez les logs de la console et les messages d'erreur pour diagnostiquer les problèmes.
