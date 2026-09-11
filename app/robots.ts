import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://cutting-mat-studio.abhiram355203.chatgpt.site/sitemap.xml',
  };
}
