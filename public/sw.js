// Service Worker simple pour LBS Docs PWA
console.log('Service Worker chargé');

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(self.clients.claim());
});

// Interception des requêtes basique
self.addEventListener('fetch', (event) => {
  // Pour l'instant, on laisse passer toutes les requêtes
  // On peut ajouter du cache plus tard
});

// Gestion des notifications push (optionnel)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification de LBS Docs',
      icon: '/logo.webp',
      badge: '/logo.webp',
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'LBS Docs', options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
