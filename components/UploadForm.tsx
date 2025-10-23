'use client';
import { useState, useRef } from 'react';

export default function UploadForm({ onUploaded, user }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('L1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('level', level);
      formData.append('uploadedByName', user.firstName ?? user.fullName ?? user.username ?? 'Etudiant');

      console.log(' Upload vers Supabase Storage...');
      
      const res = await fetch('/api/upload-supabase', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      // Reset du formulaire
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setError(null);
      
      console.log('Document uploadé avec succès:', data.doc.id);
      
      // Callback pour rafraîchir la liste
      onUploaded?.();
      
    } catch (err: any) {
      console.error('Erreur upload:', err);
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 border rounded-lg shadow-sm bg-white space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Uploader un nouveau document</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center hover:border-blue-400 transition-colors">
          <div className="space-y-2">
            <div className="text-3xl sm:text-4xl">📁</div>
            <p className="text-sm sm:text-base text-gray-600">
              Cliquez pour sélectionner un fichier ou glissez-déposez ici
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              PDF, DOC, DOCX, XLS, PPTX (max 20MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.apk,.xlsx,.xlsm,.xls,.xlsb,.csv,.pptx,.pptm,.potx,.xml,.py,.dart.,.java,.potm,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
            className="mt-4 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm sm:text-base"
            required
          />
        </div>

        {selectedFile && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-600"></span>
              <span className="text-sm text-green-800">
                Fichier sélectionné: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre du document *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Ex: Cours de Mathématiques"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Niveau d'étude *
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="L1">B1</option>
              <option value="L2">B2</option>
              <option value="L3">B3</option>
              <option value="M1">M1</option>
              <option value="M2">M2</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optionnel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            rows={3}
            placeholder="Décrivez brièvement le contenu du document..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-600"></span>
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <span className="animate-spin">⏳</span>
              <span>Upload en cours...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>Uploader le document</span>
            </span>
          )}
        </button>
      </form>
    </div>
  );
}