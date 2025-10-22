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
  const [levelFilter, setLevelFilter] = useState<string>('');
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

  useEffect(() => {
    fetchDocs();
  }, [levelFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous niveaux</option>
              <option value="L1">1ère année (L1)</option>
              <option value="L2">2ème année (L2)</option>
              <option value="L3">3ème année (L3)</option>
              <option value="M1">Master 1 (M1)</option>
              <option value="M2">Master 2 (M2)</option>
            </select>

            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Se connecter
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Upload Section */}
        {isSignedIn ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <UploadForm onUploaded={() => fetchDocs()} user={user} />
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Note :</strong> Vous devez être connecté pour uploader des fichiers.
            </p>
          </div>
        )}

        {/* Documents List */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Documents disponibles
            {levelFilter && ` - ${levelFilter}`}
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">Aucun document disponible pour ce niveau.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {docs.map((doc) => (
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