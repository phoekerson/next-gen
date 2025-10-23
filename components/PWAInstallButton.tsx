'use client';

import { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Détecter Chrome/Chromium
    const chrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    setIsChrome(chrome);

    // Détecter si l'app est déjà installée
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event received');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Vérifier si l'utilisateur a déjà refusé cette session
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    
    // Logique d'affichage améliorée
    if (dismissed === 'true') {
      setShowInstallPrompt(false);
    } else if (!standalone) {
      // Afficher le prompt si :
      // 1. Pas installé ET
      // 2. (Chrome/Chromium OU iOS) ET
      // 3. Pas déjà refusé
      if (chrome || iOS) {
        // Attendre un peu pour voir si beforeinstallprompt arrive
        setTimeout(() => {
          if (!deferredPrompt && !standalone) {
            setShowInstallPrompt(true);
          }
        }, 2000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    console.log('Install button clicked, deferredPrompt:', !!deferredPrompt);
    
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        console.log('Installation outcome:', outcome);
        
        if (outcome === 'accepted') {
          console.log('PWA installée avec succès');
        } else {
          console.log('Installation PWA refusée');
        }
        
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } catch (error) {
        console.error('Erreur lors de l\'installation:', error);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas beforeinstallprompt
      console.log('Pas de deferredPrompt disponible, affichage instructions manuelles');
      // On peut afficher des instructions manuelles ici
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Debug info (à supprimer en production)
  useEffect(() => {
    console.log('PWA Install Button State:', {
      isIOS,
      isChrome,
      isStandalone,
      showInstallPrompt,
      hasDeferredPrompt: !!deferredPrompt
    });
  }, [isIOS, isChrome, isStandalone, showInstallPrompt, deferredPrompt]);

  // Ne pas afficher si déjà installée ou si l'utilisateur a refusé
  if (isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 max-w-xs sm:max-w-sm">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 p-3 sm:p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">Installer l'app</h3>
              <p className="text-xs text-gray-600 hidden sm:block">Accès rapide depuis votre écran d'accueil</p>
              <p className="text-xs text-gray-600 sm:hidden">Accès rapide</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
          </button>
        </div>

        {isIOS ? (
          <div className="space-y-2 sm:space-y-3">
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
              <p className="text-xs text-gray-700 mb-1 sm:mb-2">
                Pour installer sur iOS :
              </p>
              <ol className="text-xs text-gray-600 space-y-1">
                <li>1. Appuyez sur le bouton Partager <span className="inline-block">⎋</span></li>
                <li>2. Sélectionnez "Sur l'écran d'accueil" <span className="inline-block">➕</span></li>
                <li>3. Appuyez sur "Ajouter"</li>
              </ol>
            </div>
            <button
              onClick={handleDismiss}
              className="w-full bg-gray-100 text-gray-700 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Compris
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Installation rapide</span>
              <span className="sm:hidden">Installation rapide</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
              >
                <span className="hidden sm:inline">Installer maintenant</span>
                <span className="sm:hidden">Installer</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-gray-500 hover:text-gray-700 transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Plus tard</span>
                <span className="sm:hidden">Non</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
