'use client';

import { useEffect, useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import UploadForm from '@/components/UploadForm';
import DocumentCard from '@/components/DocumentCard';

type Doc = {
  id: number;
  title: string;
  description?: string;
  level: string;
  fileUrl: string;
  filename: string;
  fileType?: string;
  uploadedByName: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { isSignedIn, user } = useUser();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Doc[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  async function fetchDocs() {
    try {
      setLoading(true);
      const query = levelFilter ? `?level=${levelFilter}` : '';
      const res = await fetch(`/api/docs${query}`);
      
      if (!res.ok) {
        throw new Error('Erreur lors de la récupération des documents');
      }
      
      const data = await res.json();
      setDocs(data.docs || []);
    } catch (error) {
      console.error('Erreur:', error);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }

  // Fonction pour filtrer les documents
  const filterDocs = () => {
    let filtered = docs;

    // Filtrage par niveau
    if (levelFilter) {
      filtered = filtered.filter(doc => doc.level === levelFilter);
    }

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.uploadedByName.toLowerCase().includes(query) ||
        doc.filename.toLowerCase().includes(query)
      );
    }

    setFilteredDocs(filtered);
  };

  useEffect(() => {
    fetchDocs();
  }, [levelFilter]);

  useEffect(() => {
    filterDocs();
  }, [docs, levelFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Indicateur de filtres actifs pour mobile */}
        {(searchQuery || levelFilter) && (
          <div className="lg:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    🔍 {searchQuery}
                  </span>
                )}
                {levelFilter && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    📚 {levelFilter}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLevelFilter('');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Effacer
              </button>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>

            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Se connecter
                </button>
              </SignInButton>
            )}
          </div>

          {/* Barre de recherche et filtres */}
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
            {/* Barre de recherche */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par titre, description, auteur..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtre par niveau */}
            <div className="lg:w-64">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous niveaux</option>
                <option value="L1">1ère année (B1)</option>
                <option value="L2">2ème année (B2)</option>
                <option value="L3">3ème année (B3)</option>
                <option value="M1">Master 1 (M1)</option>
                <option value="M2">Master 2 (M2)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {isSignedIn ? (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <UploadForm onUploaded={() => fetchDocs()} user={user} />
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm sm:text-base">
              <strong>Note :</strong> Vous devez être connecté pour uploader des fichiers.
            </p>
          </div>
        )}

        {/* Documents List */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Documents disponibles
              {(levelFilter || searchQuery) && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  {levelFilter && `- ${levelFilter}`}
                  {searchQuery && ` - "${searchQuery}"`}
                </span>
              )}
            </h2>
            {filteredDocs.length > 0 && (
              <p className="text-sm text-gray-500">
                {filteredDocs.length} document{filteredDocs.length > 1 ? 's' : ''} trouvé{filteredDocs.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="text-gray-400 text-4xl mb-4">📄</div>
              <p className="text-gray-500">
                {searchQuery || levelFilter 
                  ? "Aucun document trouvé avec ces critères." 
                  : "Aucun document disponible."
                }
              </p>
              {(searchQuery || levelFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setLevelFilter('');
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={{
                    ...doc,
                    description: doc.description || "Pas de description",
                  }}
                  isSignedIn={Boolean(isSignedIn)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}