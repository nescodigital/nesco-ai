import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/social", "/freelancer", "/email-marketing", "/signup", "/login", "/generator-continut-ai", "/spy-ai-competitor", "/copywriting-ai-romania", "/hook-generator", "/calendar-editorial-ai", "/privacy", "/terms"],
        disallow: ["/dashboard", "/onboarding", "/auth", "/api", "/en/dashboard", "/en/onboarding"],
      },
    ],
    sitemap: "https://ai.nescodigital.com/sitemap.xml",
    host: "https://ai.nescodigital.com",
  };
}
