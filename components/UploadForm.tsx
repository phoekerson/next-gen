'use client';
import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';

export default function UploadForm({ onUploaded, user }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('L1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  async function handleCloudinaryUpload(result: any) {
    if (!result?.info?.secure_url) {
      setError('Erreur lors de l\'upload vers Cloudinary');
      return;
    }

    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        level,
        fileUrl: result.info.secure_url,
        filename: result.info.original_filename || result.info.public_id,
        fileType: result.info.format || 'application/octet-stream',
        clerkId: user.id,
        uploadedByName: user.firstName ?? user.fullName ?? user.username ?? 'Etudiant',
      };

      console.log('🔄 Enregistrement du document en base de données...');
      
      const res = await fetch('/api/upload-cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      }

      // Reset du formulaire
      setTitle('');
      setDescription('');
      setUploadedFile(null);
      setError(null);
      
      console.log('Document enregistré avec succès:', data.doc.id);
      
      // Callback pour rafraîchir la liste
      onUploaded?.();
      
    } catch (err: any) {
      console.error('Erreur enregistrement:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Uploader un nouveau document</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre du document *
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Cours de mathématiques L1"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Niveau *
          </label>
          <select 
            value={level} 
            onChange={(e) => setLevel(e.target.value)} 
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="L1">1ère année (L1)</option>
            <option value="L2">2ème année (L2)</option>
            <option value="L3">3ème année (L3)</option>
            <option value="M1">Master 1 (M1)</option>
            <option value="M2">Master 2 (M2)</option>
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
          placeholder="Brève description du contenu du document..."
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fichier *
        </label>
        
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          onSuccess={(result) => {
            console.log('Upload réussi:', result);
            setUploadedFile(result);
            handleCloudinaryUpload(result);
          }}
          onError={(error) => {
            console.error('Erreur upload:', error);
            setError('Erreur lors de l\'upload du fichier');
          }}
          options={{
            folder: `lbs_documents/${level}`,
            resourceType: 'auto',
            maxFileSize: 100000000, // 100MB
            clientAllowedFormats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
            tags: [`level_${level}`, 'lbs_document'],
          }}
        >
          {({ open }) => {
            return (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => open()}
                  disabled={loading}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Cliquez pour sélectionner un fichier
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX (max 100MB)
                    </p>
                  </div>
                </button>
                
                {uploadedFile && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                    ✅ Fichier uploadé avec succès: {uploadedFile.info?.original_filename}
                  </div>
                )}
                
                {loading && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                    🔄 Enregistrement en cours...
                  </div>
                )}
              </div>
            );
          }}
        </CldUploadWidget>
      </div>
    </div>
  );
}
