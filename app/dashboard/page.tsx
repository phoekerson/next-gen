// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import UploadForm from '../../components/UploadForm';
import DocumentCard from '../../components/DocumentCard';
import axios from 'axios';

type Doc = {
  id: number;
  title: string;
  description?: string;
  level: string;
  fileUrl: string;
  filename: string;
  uploadedByName: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { isSignedIn, user } = useUser ? useUser() : { isSignedIn: false, user: null };
  const [docs, setDocs] = useState<Doc[]>([]);
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);

  async function fetchDocs() {
    const q = levelFilter ? `?level=${levelFilter}` : '';
    const res = await fetch(`/api/docs${q}`);
    const data = await res.json();
    setDocs(data.docs);
  }

  useEffect(() => {
    fetchDocs();
  }, [levelFilter]);

  // si connecté, sync user to DB (appel à /api/sync-user)
  useEffect(() => {
    async function sync() {
      if (isSignedIn && user) {
        await fetch('/api/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress ?? user.emailAddresses?.[0]?.emailAddress ?? null,
            name: user.firstName ?? user.fullName ?? null,
            avatarUrl: user.imageUrl ?? null,
          }),
        });
      }
    }
    sync();
  }, [isSignedIn, user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="flex gap-3">
          <select
            value={levelFilter ?? ''}
            onChange={(e) => setLevelFilter(e.target.value || undefined)}
            className="border rounded px-3 py-2"
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
              <button className="px-3 py-2 bg-blue-600 text-white rounded">Se connecter pour uploader</button>
            </SignInButton>
          )}
        </div>
      </div>

      {isSignedIn ? (
        <UploadForm onUploaded={() => fetchDocs()} user={user} />
      ) : (
        <div className="p-4 bg-yellow-50 border rounded">
          <strong>Note :</strong> Vous devez être connecté pour uploader des fichiers.
        </div>
      )}

      <section className="grid md:grid-cols-2 gap-4">
        {docs.map((d) => (
          <DocumentCard key={d.id} doc={d} isSignedIn={Boolean(isSignedIn)} />
        ))}
      </section>
    </div>
  );
}
