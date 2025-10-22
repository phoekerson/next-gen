'use client';

import { useState } from 'react';

export default function PWATestButton() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];
    
    // Test 1: Service Worker
    if ('serviceWorker' in navigator) {
      results.push(' Service Worker supporté');
    } else {
      results.push(' Service Worker non supporté');
    }

    // Test 2: HTTPS ou localhost
    const isSecure = location.protocol === 'https:' || 
                     location.hostname === 'localhost' || 
                     location.hostname === '127.0.0.1' ||
                     location.hostname.includes('192.168');
    if (isSecure) {
      results.push(' HTTPS ou localhost détecté');
    } else {
      results.push(' HTTPS requis pour PWA');
    }

    // Test 3: Manifest - vérifier plusieurs façons
    const manifestLink = document.querySelector('link[rel="manifest"]');
    const hasManifestRoute = window.location.pathname.includes('manifest') || 
                            document.querySelector('link[href*="manifest"]');
    
    if (manifestLink || hasManifestRoute) {
      results.push(' Manifest détecté');
    } else {
      // Vérifier si le manifest est accessible
      fetch('/manifest.json')
        .then(response => {
          if (response.ok) {
            results.push(' Manifest accessible via /manifest.json');
          } else {
            results.push(' Manifest non accessible');
          }
        })
        .catch(() => {
          results.push(' Manifest non trouvé');
        });
    }

    // Test 4: Display mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) {
      results.push(' App déjà installée');
    } else {
      results.push('ℹ App pas encore installée');
    }

    // Test 5: Browser support
    const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isChrome) {
      results.push(' Chrome détecté');
    } else if (isEdge) {
      results.push(' Edge détecté');
    } else if (isIOS) {
      results.push(' iOS Safari détecté');
    } else {
      results.push(' Navigateur non optimisé pour PWA');
    }

    // Test 6: BeforeInstallPrompt support
    if ('BeforeInstallPromptEvent' in window) {
      results.push(' BeforeInstallPrompt supporté');
    } else {
      results.push(' BeforeInstallPrompt non supporté');
    }

    setTestResults(results);
  };

}
