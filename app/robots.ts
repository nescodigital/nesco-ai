import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing"],
        disallow: ["/dashboard", "/onboarding", "/login", "/auth", "/api"],
      },
    ],
    sitemap: "https://ai.nescodigital.com/sitemap.xml",
    host: "https://ai.nescodigital.com",
  };
}
