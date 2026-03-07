import { MetadataRoute } from "next";

const BASE = "https://ai.nescodigital.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/en`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/en/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/social`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/freelancer`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/email-marketing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/generator-continut-ai`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/spy-ai-competitor`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/copywriting-ai-romania`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/hook-generator`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/calendar-editorial-ai`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
