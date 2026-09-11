import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cutting Mat Studio',
    short_name: 'Cutting Mat',
    description: 'Create precision cutting-mat wallpapers with procedural grids, guides, and textures.',
    start_url: '/',
    display: 'standalone',
    background_color: '#171b19',
    theme_color: '#174c3c',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
