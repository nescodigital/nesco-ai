import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ai.nescodigital.com"),
  title: {
    default: "Nesco Digital AI — Workspace AI pentru Marketing",
    template: "%s | Nesco Digital AI",
  },
  description: "Un AI care îți cunoaște brandul, audiența și ofertele. Generează conținut personalizat pentru Facebook, Instagram, LinkedIn, email și reclame în câteva secunde.",
  keywords: ["AI marketing", "generare continut AI", "copywriting AI", "marketing Romania", "AI pentru business", "automatizare marketing"],
  authors: [{ name: "Nesco Digital" }],
  creator: "Nesco Digital",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://ai.nescodigital.com",
    siteName: "Nesco Digital AI",
    title: "Nesco Digital AI — Workspace AI pentru Marketing",
    description: "Un AI care îți cunoaște brandul, audiența și ofertele. Generează conținut personalizat în câteva secunde.",
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
    title: "Nesco Digital AI — Workspace AI pentru Marketing",
    description: "Generează conținut personalizat pentru brandul tău în câteva secunde.",
    images: ["https://zeiysldulaawgqdhhfpx.supabase.co/storage/v1/object/public/assets/ai_nescodigital_logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://ai.nescodigital.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <noscript>
          <img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=1163980934680660&ev=PageView&noscript=1" />
        </noscript>
        {children}
      </body>
    </html>
  );
}
