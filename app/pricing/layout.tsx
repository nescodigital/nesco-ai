import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prețuri și planuri",
  description: "Alege planul potrivit afacerii tale. Starter de la 9€/lună, Pro 29€/lună, Unlimited 79€/lună. Anulezi oricând, fără contracte.",
  alternates: {
    canonical: "https://ai.nescodigital.com/pricing",
  },
  openGraph: {
    title: "Prețuri și planuri | Nesco Digital AI",
    description: "Planuri flexibile pentru orice afacere. Starter, Pro sau Unlimited. Anulezi oricând.",
    url: "https://ai.nescodigital.com/pricing",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
