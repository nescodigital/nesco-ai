"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import UserDropdown from "./UserDropdown";

export default function DashboardTopBar() {
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setEmail(user.email ?? "");
      supabase
        .from("user_credits")
        .select("credits, plan")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          setCredits(data?.credits ?? 0);
          setPlan(data?.plan ?? null);
        });
    });
  }, []);

  if (credits === null) return null;

  const planLabel = plan === "multi-brand" ? "Multi-Brand" : plan === "pro" ? "Pro" : plan === "starter" ? "Starter" : null;
  const planColor = plan === "multi-brand" ? "#a78bfa" : plan === "pro" ? "#56db84" : "rgba(255,255,255,0.5)";
  const planBg = plan === "multi-brand"
    ? "linear-gradient(135deg,rgba(129,140,248,0.2),rgba(168,85,247,0.15))"
    : plan === "pro"
    ? "linear-gradient(135deg,rgba(86,219,132,0.15),rgba(129,140,248,0.12))"
    : "rgba(255,255,255,0.06)";
  const planBorder = plan === "multi-brand"
    ? "1px solid rgba(167,139,250,0.3)"
    : plan === "pro"
    ? "1px solid rgba(86,219,132,0.25)"
    : "1px solid rgba(255,255,255,0.1)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "var(--font-geist-sans)" }}>

      {/* Plan badge — hidden on mobile */}
      {planLabel && (
        <span className="hidden sm:inline-block" style={{
          fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "20px",
          textTransform: "uppercase", letterSpacing: "0.06em",
          background: planBg, color: planColor, border: planBorder,
        }}>
          {planLabel}
        </span>
      )}

      {/* Credits number — always visible */}
      {/* Label "credite" — hidden on mobile */}
      <div style={{
        display: "flex", alignItems: "center", gap: "4px",
        background: "rgba(86,219,132,0.06)", border: "1px solid rgba(86,219,132,0.15)",
        borderRadius: "7px", padding: "4px 8px",
      }}>
        <span style={{ color: "#56db84", fontSize: "13px", fontWeight: 800 }}>{credits}</span>
        <span className="hidden sm:inline" style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px" }}>cr</span>
      </div>

      {/* Buy button — full text on desktop, icon on mobile */}
      <a href="/pricing" className="hidden sm:inline-block" style={{
        background: "#56db84", color: "#0a0a0a",
        padding: "5px 10px", borderRadius: "6px", fontSize: "12px",
        fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
      }}>+ Cumpără</a>
      <a href="/pricing" className="sm:hidden flex items-center justify-center" title="Cumpără credite" style={{
        width: "28px", height: "28px", borderRadius: "6px",
        background: "#56db84", flexShrink: 0, textDecoration: "none",
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </a>

      {/* User icon — opens dropdown */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          title={email}
          style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: dropdownOpen ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${dropdownOpen ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5.5" r="2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4"/>
            <path d="M2.5 13.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        {dropdownOpen && (
          <UserDropdown
            email={email}
            onClose={() => setDropdownOpen(false)}
            onSignOut={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push("/login");
              router.refresh();
            }}
          />
        )}
      </div>
    </div>
  );
}
