// components/UploadForm.tsx
'use client';
import { useState } from 'react';

export default function UploadForm({ onUploaded, user }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('L1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation des types de fichiers autorisés
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validation de la taille (max 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Taille maximale: 100MB');
      setFile(null);
      return;
    }

    // Validation du type
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Type de fichier non autorisé. Formats acceptés: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX');
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez choisir un fichier');
      return;
    }

    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Conversion du fichier en base64
      const b64 = await readFileAsDataURL(file);

      const payload = {
        fileBase64: b64,
        title: title.trim(),
        description: description.trim(),
        level,
        filename: file.name,
        fileType: file.type,
        clerkId: user.id,
        uploadedByName: user.firstName ?? user.fullName ?? user.username ?? 'Etudiant',
      };

      console.log('🔄 Envoi de l\'upload...');
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      // Reset du formulaire
      setTitle('');
      setDescription('');
      setFile(null);
      setError(null);
      
      // Reset du champ file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      console.log('✅ Upload réussi:', data.doc.id);
      
      // Callback pour rafraîchir la liste
      onUploaded?.();
      
    } catch (err: any) {
      console.error('❌ Erreur upload:', err);
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setLoading(false);
    }
  }

  function readFileAsDataURL(f: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(f);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 border rounded-lg shadow-sm bg-white space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">📤 Uploader un nouveau document</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          ❌ {error}
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
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx" 
            onChange={handleFileChange}
            className="flex-1 p-2 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button 
            type="submit" 
            disabled={loading || !file} 
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? '⏳ Upload en cours...' : '📤 Uploader'}
          </button>
        </div>
        {file && (
          <div className="mt-2 text-sm text-gray-600">
            ✅ Fichier sélectionné: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
        <div className="mt-1 text-xs text-gray-500">
          Formats acceptés: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX (max 100MB)
        </div>
      </div>
    </form>
  );
}
