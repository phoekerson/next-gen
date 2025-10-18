// components/Header.tsx
'use client';
import { SignInButton, SignUpButton, useUser, SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/public/logo.webp';

export default function Header() {
  const { isSignedIn, user } = useUser ? useUser() : { isSignedIn: false, user: null };

  return (
    <header className="bg-gradient-to-r from-[#0b2468] via-[#2a4b9b] to-[#b02b2b] text-white shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link href="/">
          <div className="flex items-center gap-3">
            <Image src={logo} alt="LBS" width={120} height={48} />
            <div className="text-sm">
              <div className="font-bold">Lomé Business School</div>
              <div className="text-xs opacity-90">Partage de supports étudiants</div>
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-white/10">Dashboard</Link>
          {!isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button className="btn">Se connecter</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-primary">S'inscrire</button>
              </SignUpButton>
            </>
          )}
          {isSignedIn && (
            <div className="flex items-center gap-2">
              <div className="text-sm">{user?.firstName ?? user?.fullName ?? 'Etudiant'}</div>
              <SignOutButton>
                <button className="btn">Se déconnecter</button>
              </SignOutButton>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
