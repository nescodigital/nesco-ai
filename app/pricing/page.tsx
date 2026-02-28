"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 9,
    credits: 50,
    description: "Perfect pentru început",
    features: [
      "50 generări / lună",
      "Toate tipurile de conținut",
      "Personalizare brand completă",
      "Suport email",
    ],
    accent: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    credits: 300,
    description: "Pentru afaceri active",
    features: [
      "300 generări / lună",
      "Toate tipurile de conținut",
      "Personalizare brand completă",
      "Prioritate la procesare",
      "Suport prioritar",
    ],
    accent: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 79,
    credits: 99999,
    description: "Fără limite",
    features: [
      "Generări nelimitate",
      "Toate tipurile de conținut",
      "Personalizare brand completă",
      "Prioritate maximă",
      "Suport dedicat",
    ],
    accent: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      // silent
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(86,219,132,0.05) 0%, transparent 60%), #0a0a0a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Header */}
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        <Logo />
        <button
          onClick={() => router.push("/dashboard")}
          className="text-[13px] text-white/40 hover:text-white/70 transition-colors"
        >
          ← Înapoi la dashboard
        </button>
      </header>

      <main className="flex-1 px-5 py-12 max-w-4xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#56db84] mb-3">Planuri și prețuri</p>
          <h1 className="text-[28px] font-bold text-white mb-3 leading-tight">
            Alege planul potrivit afacerii tale
          </h1>
          <p className="text-[15px] text-white/40">
            Anulezi oricând. Fără contracte.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="relative rounded-2xl p-6 flex flex-col"
              style={{
                border: plan.accent
                  ? "1.5px solid rgba(86,219,132,0.4)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: plan.accent
                  ? "linear-gradient(135deg,rgba(86,219,132,0.07),rgba(129,140,248,0.05))"
                  : "rgba(255,255,255,0.02)",
                boxShadow: plan.accent ? "0 0 32px rgba(86,219,132,0.08)" : "none",
              }}
            >
              {plan.accent && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-black"
                  style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}
                >
                  Cel mai popular
                </div>
              )}

              <div className="mb-5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">{plan.description}</p>
                <h2 className="text-[20px] font-bold text-white mb-3">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-[36px] font-bold text-white leading-none">{plan.price}€</span>
                  <span className="text-[14px] text-white/40">/lună</span>
                </div>
                <p className="text-[13px] text-white/40 mt-1">
                  {plan.credits >= 99999 ? "Generări nelimitate" : `${plan.credits} generări`}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <div
                      className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}
                    >
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[13px] text-white/65 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading === plan.id}
                className="w-full py-3.5 rounded-xl text-[14px] font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: plan.accent
                    ? "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)"
                    : "rgba(255,255,255,0.07)",
                  color: plan.accent ? "#000" : "rgba(255,255,255,0.8)",
                  border: plan.accent ? "none" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: plan.accent ? "0 4px 20px rgba(86,219,132,0.25)" : "none",
                }}
              >
                {loading === plan.id ? "Se procesează..." : "Alege planul"}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-white/20 mt-8">
          Plăți securizate prin Stripe · Anulezi oricând din cont
        </p>
      </main>
    </div>
  );
}
