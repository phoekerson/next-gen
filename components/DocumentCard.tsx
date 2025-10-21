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
      
      // Utiliser l'API de redirection qui est plus simple et fiable
      const downloadUrl = `/api/download-redirect?id=${doc.id}`;
      
      // Ouvrir le téléchargement dans un nouvel onglet
      window.open(downloadUrl, '_blank');
      
      console.log('✅ Redirection vers téléchargement lancée');
      
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement: ' + (error as Error).message);
    } finally {
      setDownloading(false);
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
             {doc.filename}
          </div>
        </div>

         {/* Actions */}
         <div className="flex flex-col gap-2 flex-shrink-0">
           {isSignedIn ? (
             <button 
               onClick={handleDownload}
               disabled={downloading}
               className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
             >
               {downloading ? (
                 <span className="flex items-center gap-2">
                   <span className="animate-spin">⏳</span>
                   <span>Téléchargement...</span>
                 </span>
               ) : (
                 <span className="flex items-center gap-2">
                   <span>📥</span>
                   <span>Télécharger</span>
                 </span>
               )}
             </button>
           ) : (
             <Link href="/sign-in">
               <button className="px-6 py-3 bg-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors whitespace-nowrap">
                  Se connecter pour télécharger
               </button>
             </Link>
           )}
         </div>
      </div>
    </div>
  );
}