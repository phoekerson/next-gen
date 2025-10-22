import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LBS Docs - Partage de supports',
    short_name: 'LBS Docs',
    description: 'Plateforme de partage de supports de cours pour les étudiants de Lomé Business School',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0b2468',
    orientation: 'portrait-primary',
    categories: ['education', 'productivity'],
    lang: 'fr',
    scope: '/',
    icons: [
      {
        src: '/logo.webp',
        sizes: '192x192',
        type: 'image/webp',
        purpose: 'maskable'
      },
      {
        src: '/logo.webp',
        sizes: '512x512',
        type: 'image/webp',
        purpose: 'maskable'
      },
    ],
    screenshots: [
      {
        src: '/logo.webp',
        sizes: '1280x720',
        type: 'image/webp',
        form_factor: 'wide',
        label: 'LBS Docs Dashboard'
      }
    ]
  }
}
