import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Header from '../components/Header';
import UserSyncProvider from '../components/UserSyncProvider';
import PWAInstallButton from '../components/PWAInstallButton';
import PWATestButton from '../components/PWATestButton';
import ServiceWorkerRegistration from '../components/ServiceWorkerRegistration';
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
              <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">{children}</main>
              <PWAInstallButton />
              <PWATestButton />
              <ServiceWorkerRegistration />
            </div>
          </UserSyncProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
