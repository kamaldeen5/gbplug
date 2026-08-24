import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GB Plug - Buy Cheap Data Ghana',
    short_name: 'GB Plug',
    description: 'Instant automated data bundles for MTN, Telecel, and AirtelTigo. 100% secure Mobile Money payments with zero delays.',
    start_url: '/',
    display: 'standalone',
    background_color: '#070D18',
    theme_color: '#070D18',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/maskable-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'finance', 'utilities'],
  };
}
