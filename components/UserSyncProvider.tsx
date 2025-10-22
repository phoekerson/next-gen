'use client';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function UserSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // Synchronisation automatique lors de la connexion
      syncUser(user).catch(console.error);
    }
  }, [isSignedIn, user]);

  return <>{children}</>;
}

async function syncUser(user: any) {
  try {
    console.log('🔄 Synchronisation utilisateur:', user.id);
    
    const response = await fetch('/api/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || null,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.lastName || user.fullName || 'Étudiant',
        avatarUrl: user.imageUrl || null,
      }),
    });

    if (response.ok) {
      console.log(' Utilisateur synchronisé avec succès');
    } else {
      const error = await response.json();
      console.error(' Erreur synchronisation:', error);
    }
  } catch (error) {
    console.error(' Erreur synchronisation utilisateur:', error);
  }
}