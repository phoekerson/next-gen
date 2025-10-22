'use client';
import Image from 'next/image';
import logo from '@/public/logo.webp';
import Link from 'next/link';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
        <div className="order-2 lg:order-1">
          <Image src={logo} alt="LBS" width={180} height={65} className="sm:w-[220px] sm:h-[80px]" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-4 sm:mt-6 text-[#0b2468]">
            LBS Docs — Partage de supports
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700 leading-relaxed">
            Une plateforme simple pour que les étudiants de Lomé Business School partagent les supports de cours,
            épreuves d'examen et fichiers utiles. Filtre par niveau (B1, B2, B3, M1, M2) et télécharge en toute
            simplicité.
          </p>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className='px-4 py-2 sm:px-5 sm:py-2 rounded bg-white border text-center sm:text-left text-sm sm:text-base hover:bg-gray-50 transition-colors'>
              Voir les documents 
            </Link>
          </div>
        </div>

        <div className="order-1 lg:order-2 bg-gradient-to-br from-white to-gray-50 p-4 sm:p-6 rounded-lg shadow">
          <h3 className="font-semibold text-sm sm:text-base">Fonctionnalités</h3>
          <ul className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
            <li>• Upload de PDF, Word, Excel, PowerPoint</li>
            <li>• Filtrage par niveau (B1, B2, B3, M1, M2)</li>
          </ul>
        </div>
      </section>

      <section className="mt-8 sm:mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Comment ça marche ?</h2>
        <ol className="list-decimal pl-4 sm:pl-5 space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
          <li>S'inscrire / Se connecter via votre compte Google ou Apple.</li>
          <li>Depuis le dashboard, uploader ou télécharger le fichier et préciser le niveau + description.</li>
          <li>Profiter de l'accès rapide depuis votre écran d'accueil mobile !</li>
        </ol>
      </section>
    </div>
  );
}
