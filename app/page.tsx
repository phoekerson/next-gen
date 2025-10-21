'use client';
import Image from 'next/image';
import logo from '@/public/logo.webp';
import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <Image src={logo} alt="LBS" width={220} height={80} />
          <h1 className="text-4xl font-extrabold mt-6 text-[#0b2468]">LBS Docs — Partage de supports</h1>
          <p className="mt-4 text-gray-700">
            Une plateforme simple pour que les étudiants de Lomé Business School partagent les supports de cours,
            épreuves d'examen et fichiers utiles. Filtre par niveau (B1, B2, B3, M1, M2) et télécharge en toute
            simplicité.
          </p>

          <div className="mt-6 flex gap-3">
            <Link href="/dashboard" className='px-5 py-2 rounded bg-white border'>
              Voir les documents 
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-lg shadow">
          <h3 className="font-semibold">Fonctionnalités</h3>
          <ul className="mt-4 space-y-3 text-sm text-gray-700">
            <li>• Upload de PDF, Word, Excel, PowerPoint</li>
            <li>• Filtrage par niveau (B1, B2, B3, M1, M2)</li>
            <li>• Description et attribution « uploadé par »</li>
            <li>• Téléchargement réservé aux comptes inscrits</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Comment ça marche ?</h2>
        <ol className="mt-3 list-decimal pl-5 space-y-2 text-gray-700">
          <li>S'inscrire / Se connecter via votre compte Google ou Apple.</li>
          <li>Depuis le dashboard, uploader ou télecharger le fichier et préciser le niveau + description.</li>
          
        </ol>
      </section>
    </div>
  );
}
