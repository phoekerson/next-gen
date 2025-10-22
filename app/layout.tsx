import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Header from '../components/Header';
import UserSyncProvider from '../components/UserSyncProvider';
import Image from 'next/image';
import logo from "@/public/logo.webp";

export const metadata = {
  title: 'LBS SHARE',
  description: 'Plateforme de partage de supports LBS',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ClerkProvider>
          <UserSyncProvider>
            <div className="min-h-screen bg-white">
              <Header />
              <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
            </div>
          </UserSyncProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
