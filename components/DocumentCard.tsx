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

  const handleDownload = async () => {
    if (!isSignedIn) return;
    
    setDownloading(true);
    try {
      console.log('🔄 Début du téléchargement pour document:', doc.id);

      const params = new URLSearchParams({ id: String(doc.id) });
      const downloadUrl = `/api/download-final?${params.toString()}`;

      const res = await fetch(downloadUrl, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.status === 401) {
        throw new Error('Non authentifié. Veuillez vous connecter.');
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Erreur téléchargement (${res.status}): ${text || res.statusText}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = doc.filename || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      console.log('Téléchargement démarré');
      
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement: ' + (error as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          {/* Titre */}
          <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate mb-2">
            {doc.title}
          </h3>

          {/* Description */}
          {doc.description && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
              {doc.description}
            </p>
          )}

          {/* Métadonnées */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 sm:mt-3 text-xs">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium text-xs">
              {doc.level}
            </span>
            <span className="text-gray-500 text-xs">
              par {doc.uploadedByName}
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-500 text-xs">
              {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {/* Nom du fichier */}
          <div className="text-xs text-gray-400 mt-2 truncate" title={doc.filename}>
             {doc.filename}
          </div>
        </div>

         {/* Actions */}
         <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
           {isSignedIn ? (
             <button 
               onClick={handleDownload}
               disabled={downloading}
               className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
             >
               {downloading ? (
                 <span className="flex items-center justify-center gap-2">
                   <span className="animate-spin">⏳</span>
                   <span className="hidden sm:inline">Téléchargement...</span>
                   <span className="sm:hidden">...</span>
                 </span>
               ) : (
                 <span className="flex items-center justify-center gap-2">
                   <span className="hidden sm:inline">Télécharger</span>
                   <span className="sm:hidden">Télécharger</span>
                 </span>
               )}
             </button>
           ) : (
             <Link href="/sign-in">
               <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors">
                  <span className="hidden sm:inline">Se connecter pour télécharger</span>
                  <span className="sm:hidden">Se connecter</span>
               </button>
             </Link>
           )}
         </div>
      </div>
    </div>
  );
}