import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{
    url: 'https://cutting-mat-studio.abhiram355203.chatgpt.site',
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 1,
  }];
}
