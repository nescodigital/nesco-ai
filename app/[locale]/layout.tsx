import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  return {
    metadataBase: new URL("https://ai.nescodigital.com"),
    title: {
      default: isEn
        ? "Nesco Digital AI — AI Marketing Workspace"
        : "Nesco Digital AI — Workspace AI pentru Marketing",
      template: "%s | Nesco Digital AI",
    },
    description: isEn
      ? "An AI that knows your brand, audience, and offers. Generate personalized content for every channel in seconds."
      : "Un AI care îți cunoaște brandul, audiența și ofertele. Generează conținut personalizat pentru fiecare canal în câteva secunde.",
    keywords: isEn
      ? ["AI marketing", "AI content generation", "copywriting AI", "brand voice AI", "marketing automation"]
      : ["AI marketing", "generare continut AI", "copywriting AI", "marketing Romania", "AI pentru business", "automatizare marketing"],
    authors: [{ name: "Nesco Digital" }],
    creator: "Nesco Digital",
    openGraph: {
      type: "website",
      locale: isEn ? "en_US" : "ro_RO",
      url: isEn ? "https://ai.nescodigital.com/en" : "https://ai.nescodigital.com",
      siteName: "Nesco Digital AI",
      title: isEn
        ? "Nesco Digital AI — AI Marketing Workspace"
        : "Nesco Digital AI — Workspace AI pentru Marketing",
      description: isEn
        ? "An AI that knows your brand, audience, and offers. Generate personalized content in seconds."
        : "Un AI care îți cunoaște brandul, audiența și ofertele. Generează conținut personalizat în câteva secunde.",
      images: [
        {
          url: "https://zeiysldulaawgqdhhfpx.supabase.co/storage/v1/object/public/assets/ai_nescodigital_logo.png",
          width: 1200,
          height: 630,
          alt: "Nesco Digital AI",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: isEn
        ? "Nesco Digital AI — AI Marketing Workspace"
        : "Nesco Digital AI — Workspace AI pentru Marketing",
      description: isEn
        ? "Generate personalized content for your brand in seconds."
        : "Generează conținut personalizat pentru brandul tău în câteva secunde.",
      images: ["https://zeiysldulaawgqdhhfpx.supabase.co/storage/v1/object/public/assets/ai_nescodigital_logo.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
    },
    alternates: {
      canonical: isEn ? "https://ai.nescodigital.com/en" : "https://ai.nescodigital.com",
      languages: {
        ro: "https://ai.nescodigital.com",
        en: "https://ai.nescodigital.com/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-Q2M76FM8YP" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q2M76FM8YP');
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1163980934680660');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <noscript>
          <img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=1163980934680660&ev=PageView&noscript=1" />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
