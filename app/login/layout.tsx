import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Intră în cont",
  description: "Autentifică-te în Nesco Digital AI. Primești un link magic pe email — fără parolă, fără complicații.",
  alternates: {
    canonical: "https://ai.nescodigital.com/login",
  },
  openGraph: {
    title: "Intră în cont | Nesco Digital AI",
    description: "Autentifică-te în Nesco Digital AI cu un link magic trimis pe email.",
    url: "https://ai.nescodigital.com/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
