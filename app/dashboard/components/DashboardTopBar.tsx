"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardTopBar() {
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

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

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      fontFamily: "var(--font-geist-sans)",
    }}>
      {/* Plan badge */}
      {plan && (
        <span style={{
          fontSize: "10px", fontWeight: 800, padding: "2px 7px", borderRadius: "20px",
          textTransform: "uppercase", letterSpacing: "0.06em",
          background: plan === "multi-brand"
            ? "linear-gradient(135deg,rgba(129,140,248,0.2),rgba(168,85,247,0.15))"
            : plan === "pro"
            ? "linear-gradient(135deg,rgba(86,219,132,0.15),rgba(129,140,248,0.12))"
            : "rgba(255,255,255,0.06)",
          color: plan === "multi-brand" ? "#a78bfa" : plan === "pro" ? "#56db84" : "rgba(255,255,255,0.5)",
          border: plan === "multi-brand"
            ? "1px solid rgba(167,139,250,0.3)"
            : plan === "pro"
            ? "1px solid rgba(86,219,132,0.25)"
            : "1px solid rgba(255,255,255,0.1)",
        }}>
          {plan === "multi-brand" ? "Multi-Brand" : plan === "pro" ? "Pro" : "Starter"}
        </span>
      )}

      {/* Credits */}
      <div style={{
        display: "flex", alignItems: "center", gap: "5px",
        background: "rgba(86,219,132,0.06)", border: "1px solid rgba(86,219,132,0.15)",
        borderRadius: "8px", padding: "4px 10px",
      }}>
        <span style={{ color: "#56db84", fontSize: "14px", fontWeight: 800 }}>{credits}</span>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "12px" }}>credite</span>
      </div>

      {/* Buy */}
      <a href="/pricing" style={{
        background: "#56db84", color: "#0a0a0a",
        padding: "5px 10px", borderRadius: "6px", fontSize: "12px",
        fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
      }}>+ Cumpără</a>

      {/* User icon */}
      <div title={email} style={{
        width: "30px", height: "30px", borderRadius: "50%",
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "default", flexShrink: 0,
      }}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5.5" r="2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4"/>
          <path d="M2.5 13.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}
