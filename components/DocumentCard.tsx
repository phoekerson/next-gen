'use client';
import Link from 'next/link';
import { useState } from 'react';

interface DocumentCardProps {
  doc: {
    id: number;
    title: string;
    description: string;
    filename: string;
    fileUrl: string;
    level: string;
    uploadedByName: string;
    createdAt: string;
  };
  isSignedIn: boolean;
}

export default function DocumentCard({ doc, isSignedIn }: DocumentCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [fixingAccess, setFixingAccess] = useState(false);
  const [testingRedirect, setTestingRedirect] = useState(false);

  const handleDownload = async () => {
    if (!isSignedIn) return;
    
    setDownloading(true);
    try {
      console.log('🔄 Début du téléchargement pour document:', doc.id);
      
      // Faire une requête fetch pour récupérer le fichier
      const response = await fetch(`/api/download-final?id=${doc.id}`);
      
      console.log('📡 Réponse API download-final:', { 
        status: response.status, 
        contentType: response.headers.get('content-type') 
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      // Récupération du fichier comme blob
      const blob = await response.blob();
      
      console.log('📦 Blob reçu:', { 
        size: blob.size, 
        type: blob.type 
      });
      
      // Création d'une URL temporaire pour le blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Créer un lien temporaire pour télécharger le fichier
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = doc.filename;
      link.style.display = 'none';
      
      // Ajouter le lien au DOM, le cliquer, puis le supprimer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL du blob
      window.URL.revokeObjectURL(blobUrl);
      
      console.log('✅ Téléchargement lancé avec succès');
      
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement: ' + (error as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  const handleFixAccess = async () => {
    if (!isSignedIn) return;
    
    setFixingAccess(true);
    try {
      console.log('🔧 Correction de l\'accès pour le document:', doc.id);
      
      const response = await fetch('/api/fix-public-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: doc.id })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la correction');
      }
      
      console.log('✅ Accès corrigé:', data);
      alert(data.message || 'Accès au fichier corrigé avec succès!');
      
    } catch (error) {
      console.error('❌ Erreur correction accès:', error);
      alert('Erreur: ' + (error as Error).message);
    } finally {
      setFixingAccess(false);
    }
  };

  const handleTestRedirect = async () => {
    if (!isSignedIn) return;
    
    setTestingRedirect(true);
    try {
      console.log('🔄 Test de redirection pour document:', doc.id);
      
      // Ouvrir directement l'API de redirection dans un nouvel onglet
      const downloadUrl = `/api/download-redirect?id=${doc.id}`;
      window.open(downloadUrl, '_blank');
      
      console.log('✅ Redirection lancée');
      
    } catch (error) {
      console.error('❌ Erreur redirection:', error);
      alert('Erreur: ' + (error as Error).message);
    } finally {
      setTestingRedirect(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          {/* Titre */}
          <h3 className="font-semibold text-lg text-gray-900 truncate mb-2">
            {doc.title}
          </h3>

          {/* Description */}
          {doc.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {doc.description}
            </p>
          )}

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-medium">
              {doc.level}
            </span>
            <span className="text-gray-500">
              par {doc.uploadedByName}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {/* Nom du fichier */}
          <div className="text-xs text-gray-400 mt-2 truncate" title={doc.filename}>
            📄 {doc.filename}
          </div>
        </div>

         {/* Actions */}
         <div className="flex flex-col gap-2 flex-shrink-0">
           {isSignedIn ? (
             <>
               <button 
                 onClick={handleDownload}
                 disabled={downloading}
                 className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
               >
                 {downloading ? (
                   <span className="flex items-center gap-2">
                     <span className="animate-spin">⏳</span>
                     <span>Téléchargement...</span>
                   </span>
                 ) : (
                   <span className="flex items-center gap-2">
                     <span>⬇️</span>
                     <span>Télécharger</span>
                   </span>
                 )}
               </button>
               
               <button 
                 onClick={handleFixAccess}
                 disabled={fixingAccess}
                 className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
               >
                 {fixingAccess ? (
                   <span className="flex items-center gap-2">
                     <span className="animate-spin">⏳</span>
                     <span>Correction...</span>
                   </span>
                 ) : (
                   <span className="flex items-center gap-2">
                     <span>🔧</span>
                     <span>Corriger accès</span>
                   </span>
                 )}
               </button>
               
               <button 
                 onClick={handleTestRedirect}
                 disabled={testingRedirect}
                 className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
               >
                 {testingRedirect ? (
                   <span className="flex items-center gap-2">
                     <span className="animate-spin">⏳</span>
                     <span>Test...</span>
                   </span>
                 ) : (
                   <span className="flex items-center gap-2">
                     <span>🚀</span>
                     <span>Test Redirect</span>
                   </span>
                 )}
               </button>
               
               <a 
                 href={doc.fileUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors text-center whitespace-nowrap"
               >
                 <span className="flex items-center gap-2 justify-center">
                   <span>👁️</span>
                   <span>Aperçu</span>
                 </span>
               </a>
             </>
           ) : (
             <Link href="/sign-in">
               <button className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors whitespace-nowrap">
                 🔒 Se connecter
               </button>
             </Link>
           )}
         </div>
      </div>
    </div>
  );
}