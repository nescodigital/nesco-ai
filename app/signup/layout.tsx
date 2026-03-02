import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creează cont gratuit | Nesco Digital AI",
  description: "Înregistrează-te gratuit și primești 10 credite să testezi AI-ul care scrie conținut în vocea brandului tău.",
  alternates: {
    canonical: "https://ai.nescodigital.com/signup",
  },
  openGraph: {
    title: "Creează cont gratuit | Nesco Digital AI",
    description: "10 credite gratuite. Conținut în stilul brandului tău, generat în secunde.",
    url: "https://ai.nescodigital.com/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
