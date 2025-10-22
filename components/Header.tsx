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
          <div className="flex items-center gap-2 sm:gap-3">
            <Image src={logo} alt="LBS" width={80} height={32} className="sm:w-[120px] sm:h-[48px]" />
            <div className="text-xs sm:text-sm">
              <div className="font-bold hidden sm:block">Lomé Business School</div>
              <div className="font-bold sm:hidden">LBS</div>
              <div className="text-xs opacity-90 hidden sm:block">Partage de supports de cours</div>
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3">
          <Link href="/dashboard" className="px-2 py-1 sm:px-3 sm:py-2 rounded hover:bg-white/10 text-xs sm:text-sm">
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden"></span>
          </Link>
          
          {!isSignedIn && (
            <>
              <SignInButton mode="modal">
                <button className="btn text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                  <span className="hidden sm:inline">Se connecter</span>
                  <span className="sm:hidden">Connexion</span>
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-primary text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                  <span className="hidden sm:inline">S'inscrire</span>
                  <span className="sm:hidden">Inscription</span>
                </button>
              </SignUpButton>
            </>
          )}
          {isSignedIn && (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="text-xs sm:text-sm hidden sm:block">{user?.firstName ?? user?.fullName ?? 'Etudiant'}</div>
              <div className="text-xs sm:hidden">{user?.firstName?.[0] ?? 'E'}</div>
              <SignOutButton>
                <button className="btn text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2">
                  <span className="hidden sm:inline">Se déconnecter</span>
                  <span className="sm:hidden">Déco</span>
                </button>
              </SignOutButton>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
