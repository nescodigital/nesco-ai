"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProductTour from "@/app/dashboard/components/ProductTour";
import BusinessMemory from "@/app/dashboard/components/BusinessMemory";
import CalendarView from "@/app/dashboard/components/CalendarView";
import StrategistCard from "@/app/dashboard/components/StrategistCard";
import BrandSwitcher from "@/app/dashboard/components/BrandSwitcher";
import VisionView from "@/app/dashboard/components/VisionView";

const CONTENT_TYPES = [
  { v: "Post Facebook", l: "Post Facebook" },
  { v: "Post Instagram", l: "Post Instagram" },
  { v: "Post LinkedIn", l: "Post LinkedIn" },
  { v: "Email newsletter", l: "Email newsletter" },
  { v: "Reclamă Meta Ads", l: "Reclamă Meta Ads" },
];

const OBJECTIVES = [
  { v: "Vânzare", l: "Vânzare" },
  { v: "Awareness", l: "Awareness" },
  { v: "Engagement", l: "Engagement" },
  { v: "Promovare ofertă specială", l: "Promovare ofertă specială" },
];

interface HistoryItem {
  id: string;
  content_type: string;
  objective: string;
  context: string;
  result: string;
  created_at: string;
}

export default function DashboardPage() {
  const [contentType, setContentType] = useState(CONTENT_TYPES[0].v);
  const [objective, setObjective] = useState(OBJECTIVES[0].v);
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("ro");
  const [isTranslating, setIsTranslating] = useState(false);
  const [, setActiveUpdates] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"generator" | "calendar" | "vision">("generator");
  const [brands, setBrands] = useState<{ brand_id: number; label: string }[]>([]);
  const [activeBrandId, setActiveBrandId] = useState(1);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [imageFormat, setImageFormat] = useState<"1:1" | "4:5" | "16:9">("1:1");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function handleAddBrand() {
    const nextId = brands.length > 0 ? Math.max(...brands.map((b) => b.brand_id)) + 1 : 2;
    if (nextId > 5) return;
    window.location.href = `/onboarding?brandId=${nextId}`;
  }

  function handleStrategistApply({ contentType: ct, objective: obj, context: ctx }: { contentType: string; objective: string; context: string }) {
    setContentType(ct);
    setObjective(obj);
    setContext(ctx);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("user_credits")
        .select("credits, plan")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => { setCredits(data?.credits ?? 0); setPlan(data?.plan ?? null); });
      supabase
        .from("generation_history")
        .select("id, content_type, objective, context, result, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
        .then(({ data }) => { if (data) setHistory(data); });
      supabase
        .from("brand_profiles")
        .select("brand_id, data")
        .eq("user_id", user.id)
        .order("brand_id", { ascending: true })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setBrands(data.map((b) => ({
              brand_id: b.brand_id ?? 1,
              label: (b.data as Record<string, unknown>)?.brand_name as string || `Brand ${b.brand_id ?? 1}`,
            })));
          } else {
            setBrands([{ brand_id: 1, label: "Brand 1" }]);
          }
        });
    });
  }, []);

  async function handleSendEmail() {
    setSendingEmail(true);
    try {
      await fetch("/api/send-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: output, contentType, objective }),
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } finally {
      setSendingEmail(false);
    }
  }

  async function handleGenerateImage() {
    setGeneratingImage(true);
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: output, contentType, format: imageFormat }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        if (typeof data.creditsRemaining === "number") setCredits(data.creditsRemaining);
      }
    } finally {
      setGeneratingImage(false);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setOutput("");
    setError("");
    setEmailSent(false);
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, objective, context, brandId: activeBrandId }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setError("no_credits");
        return;
      }
      if (!res.ok) throw new Error(data.error || "Eroare la generare");
      setOutput(data.content);
      if (typeof data.creditsRemaining === "number") setCredits(data.creditsRemaining);
      // Refresh history
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: hist } = await supabase
          .from("generation_history")
          .select("id, content_type, objective, context, result, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        if (hist) setHistory(hist);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ceva n-a mers. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTranslate() {
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: output, targetLanguage }),
      });
      const data = await res.json();
      if (res.status === 402) { setError("no_credits"); return; }
      if (data.content) {
        setOutput(data.content);
        if (typeof data.creditsRemaining === "number") setCredits(data.creditsRemaining);
      }
    } catch {
      // silent
    } finally {
      setIsTranslating(false);
    }
  }

  function handleSuggestionClick(type: string, ctx: string) {
    setContentType(type);
    setContext(ctx);
    document.querySelector('[data-tour="generate-btn"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selectStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    color: "white",
    fontFamily: "var(--font-geist-sans)",
    appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='rgba(255,255,255,0.3)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: "36px",
  };

  return (
    <div
      className="max-w-2xl mx-auto"
      style={{ fontFamily: "var(--font-geist-sans)" }}
    >
      {/* Sticky top bar — full viewport width via negative margin */}
      {credits !== null && (
        <div style={{
          position: "sticky", top: 0, zIndex: 50,
          marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          marginBottom: "20px",
        }}>
          <div style={{
            maxWidth: "672px", margin: "0 auto",
            padding: "10px 24px",
            display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px",
          }}>
            {plan && (
              <span style={{
                fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "20px",
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
            {plan === "multi-brand" && brands.length > 0 && (
              <BrandSwitcher
                brands={brands}
                activeBrandId={activeBrandId}
                onSwitch={(id) => setActiveBrandId(id)}
                onAddBrand={handleAddBrand}
                maxBrands={5}
              />
            )}
            <span style={{ color: "#56db84", fontSize: "16px", fontWeight: 800 }}>{credits}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>credite</span>
            <a href="/pricing" style={{
              background: "#56db84", color: "#0a0a0a",
              padding: "5px 10px", borderRadius: "6px", fontSize: "12px",
              fontWeight: 700, textDecoration: "none",
            }}>+ Cumpără</a>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: "4px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "4px",
          }}
        >
          {(["generator", "calendar", "vision"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                border: "none", cursor: "pointer", transition: "all 0.15s",
                fontFamily: "var(--font-geist-sans)",
                background: activeTab === tab
                  ? "linear-gradient(135deg,rgba(86,219,132,0.15),rgba(129,140,248,0.12))"
                  : "transparent",
                color: activeTab === tab ? "#ffffff" : "rgba(255,255,255,0.35)",
                boxShadow: activeTab === tab ? "0 0 0 1px rgba(86,219,132,0.2) inset" : "none",
                whiteSpace: "nowrap",
              }}
            >
              {tab === "generator" ? "Generator" : tab === "calendar" ? "Calendar" : "Spy AI"}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar tab */}
      {activeTab === "calendar" && (
        <CalendarView onCreditsChange={(n) => setCredits(n)} />
      )}

      {/* Spy AI tab */}
      {activeTab === "vision" && (
        <VisionView brandId={activeBrandId} onCreditsChange={(n) => setCredits(n)} />
      )}

      {/* Generator tab wrapper */}
      {activeTab === "generator" && (<>

      {/* No credits error */}
      {error === "no_credits" && (
        <div
          className="rounded-2xl px-5 py-4 mb-5 flex items-start gap-3"
          style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)" }}
        >
          <div>
            <p className="text-[14px] font-semibold text-orange-300 mb-1">Credite insuficiente</p>
            <p className="text-[13px] text-white/50 mb-3">Ia un plan pentru a continua să generezi conținut personalizat cu AI.</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-black"
              style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}
            >
              Vezi planurile →
            </Link>
          </div>
        </div>
      )}

      {/* Business Memory */}
      <BusinessMemory
        onSuggestionClick={handleSuggestionClick}
        onUpdatesChange={setActiveUpdates}
      />

      {/* Form card */}
      <StrategistCard onApply={handleStrategistApply} brandId={activeBrandId} />

      <div ref={formRef}>
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Content type */}
          <div data-tour="content-type">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-2">
              Tip conținut
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-150"
              style={selectStyle}
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t.v} value={t.v} style={{ background: "#1a1a1a" }}>
                  {t.l}
                </option>
              ))}
            </select>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-2">
              Obiectiv
            </label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-[14px] outline-none transition-all duration-150"
              style={selectStyle}
            >
              {OBJECTIVES.map((o) => (
                <option key={o.v} value={o.v} style={{ background: "#1a1a1a" }}>
                  {o.l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Context */}
        <div className="mt-4" data-tour="context-field">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-2">
            Context <span className="normal-case font-normal text-white/20">(opțional)</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Despre ce vrei să scriem? Ex: lansăm un produs nou, avem o promoție..."
            rows={3}
            className="w-full rounded-xl px-4 py-3 text-[14px] text-white placeholder-white/20 resize-none outline-none transition-all duration-150 leading-relaxed"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(255,255,255,0.08)",
              fontFamily: "var(--font-geist-sans)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "rgba(86,219,132,0.4)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(86,219,132,0.06)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Generate button */}
        <button
          data-tour="generate-btn"
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 w-full py-3.5 rounded-xl text-[15px] font-bold text-black transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: loading
              ? "rgba(86,219,132,0.5)"
              : "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)",
            boxShadow: loading ? "none" : "0 4px 20px rgba(86,219,132,0.25)",
            letterSpacing: "-0.01em",
          }}
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
                <path d="M8 2a6 6 0 0 1 6 6" stroke="#000" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Se generează...
            </>
          ) : (
            "Generează"
          )}
        </button>
      </div>
      </div>{/* end formRef */}

      {/* Error */}
      {error && error !== "no_credits" && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-[13px]"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(252,165,165,0.9)" }}
        >
          {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{
            border: "1.5px solid rgba(86,219,132,0.2)",
            background: "linear-gradient(135deg,rgba(86,219,132,0.04),rgba(129,140,248,0.03))",
            boxShadow: "0 0 24px rgba(86,219,132,0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Conținut generat
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 active:scale-95"
                style={{
                  background: copied ? "rgba(86,219,132,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${copied ? "rgba(86,219,132,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: copied ? "#56db84" : "rgba(255,255,255,0.6)",
                }}
              >
                {copied ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1.5 6l3 3 6-6" stroke="#56db84" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Copiat!
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M8 4V2.5A1.5 1.5 0 0 0 6.5 1H2.5A1.5 1.5 0 0 0 1 2.5v4A1.5 1.5 0 0 0 2.5 8H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    Copiază
                  </>
                )}
              </button>
              <button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 active:scale-95"
                style={{
                  background: emailSent ? "rgba(86,219,132,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${emailSent ? "rgba(86,219,132,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: emailSent ? "#56db84" : "rgba(255,255,255,0.6)",
                  cursor: sendingEmail ? "not-allowed" : "pointer",
                  opacity: sendingEmail ? 0.6 : 1,
                }}
              >
                {emailSent ? "Trimis" : sendingEmail ? "Se trimite..." : "Trimite pe email"}
              </button>
            </div>
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>

          {/* Image generation section */}
          <div style={{
            marginTop: "20px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                Generează imagine pentru post
              </span>
              <span style={{
                fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px",
                background: "rgba(129,140,248,0.12)", color: "#818cf8",
              }}>
                2 credite
              </span>
            </div>

            {/* Format selector */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
              {([
                { id: "1:1", label: "Pătrat", sub: "1:1", hint: "Feed" },
                { id: "4:5", label: "Portrait", sub: "4:5", hint: "Story" },
                { id: "16:9", label: "Landscape", sub: "16:9", hint: "Cover" },
              ] as { id: "1:1" | "4:5" | "16:9"; label: string; sub: string; hint: string }[]).map((f) => {
                const active = imageFormat === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setImageFormat(f.id)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      padding: "8px 14px", borderRadius: "10px", cursor: "pointer",
                      background: active ? "rgba(129,140,248,0.12)" : "rgba(255,255,255,0.03)",
                      border: active ? "1px solid rgba(129,140,248,0.4)" : "1px solid rgba(255,255,255,0.07)",
                      transition: "all 0.15s",
                    }}
                  >
                    {/* Aspect ratio visual */}
                    <div style={{
                      background: active ? "rgba(129,140,248,0.3)" : "rgba(255,255,255,0.1)",
                      borderRadius: "3px",
                      marginBottom: "5px",
                      width: f.id === "1:1" ? 22 : f.id === "4:5" ? 18 : 28,
                      height: f.id === "1:1" ? 22 : f.id === "4:5" ? 22 : 16,
                      transition: "all 0.15s",
                    }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: active ? "#818cf8" : "rgba(255,255,255,0.5)" }}>
                      {f.sub}
                    </span>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>
                      {f.hint}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Generate image button */}
            <button
              onClick={handleGenerateImage}
              disabled={generatingImage}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
                background: generatingImage
                  ? "rgba(129,140,248,0.06)"
                  : "linear-gradient(135deg,rgba(129,140,248,0.2),rgba(86,219,132,0.12))",
                border: "1px solid rgba(129,140,248,0.35)",
                color: generatingImage ? "rgba(129,140,248,0.4)" : "#818cf8",
                cursor: generatingImage ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {generatingImage ? (
                <>
                  <svg className="animate-spin" width="13" height="13" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4" stroke="rgba(129,140,248,0.2)" strokeWidth="2"/>
                    <path d="M6 2a4 4 0 0 1 4 4" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Se generează imaginea...
                </>
              ) : (
                <>Generează imagine — 2 credite</>

              )}
            </button>

            {/* Image preview */}
            {imageUrl && (
              <div style={{
                marginTop: "14px",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(129,140,248,0.2)",
                background: "rgba(0,0,0,0.3)",
                maxWidth: imageFormat === "16:9" ? "100%" : imageFormat === "4:5" ? "240px" : "280px",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Imagine generată"
                  style={{ width: "100%", display: "block" }}
                />
                <div style={{
                  padding: "10px 12px",
                  display: "flex", gap: "8px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <a
                    href={imageUrl}
                    download="imagine-post.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "6px 12px", borderRadius: "7px", fontSize: "12px", fontWeight: 700,
                      background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.25)",
                      color: "#818cf8", textDecoration: "none",
                    }}
                  >
                    ↓ Descarcă
                  </a>
                  <button
                    onClick={handleGenerateImage}
                    disabled={generatingImage}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "6px 12px", borderRadius: "7px", fontSize: "12px",
                      background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.35)", cursor: "pointer",
                    }}
                  >
                    ↺ Regenerează
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Translate row */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "16px" }}>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              style={{
                background: "#111113", border: "1px solid rgba(255,255,255,0.1)",
                color: "#ffffff", padding: "10px 14px", borderRadius: "8px",
                fontSize: "14px", flex: 1, fontFamily: "var(--font-geist-sans)",
              }}
            >
              <option value="ro">🇷🇴 Română</option>
              <option value="en">🇬🇧 Engleză</option>
              <option value="de">🇩🇪 Germană</option>
              <option value="fr">🇫🇷 Franceză</option>
              <option value="es">🇪🇸 Spaniolă</option>
              <option value="it">🇮🇹 Italiană</option>
              <option value="hu">🇭🇺 Maghiară</option>
              <option value="pl">🇵🇱 Poloneză</option>
              <option value="nl">🇳🇱 Olandeză</option>
              <option value="pt">🇵🇹 Portugheză</option>
            </select>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || targetLanguage === "ro"}
              style={{
                background: "transparent", border: "1px solid #56db84",
                color: "#56db84", padding: "10px 20px", borderRadius: "8px",
                fontSize: "14px", fontWeight: 700, cursor: isTranslating || targetLanguage === "ro" ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", opacity: targetLanguage === "ro" ? 0.4 : 1,
                fontFamily: "var(--font-geist-sans)",
              }}
            >
              {isTranslating ? "Se traduce..." : "Traducere - 1 credit"}
            </button>
          </div>
        </div>
      )}

      <ProductTour />

      {/* History */}
      {history.length > 0 && (
        <div className="mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">
            Ultimele generări
          </p>
          <div className="flex flex-col gap-3">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl p-4"
                  style={{
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(86,219,132,0.1)", color: "#56db84" }}
                      >
                        {item.content_type}
                      </span>
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)" }}
                      >
                        {item.objective}
                      </span>
                    </div>
                    <span className="text-[11px] text-white/20 flex-shrink-0">
                      {new Date(item.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-[13px] text-white/55 leading-relaxed">
                    {isExpanded ? item.result : item.result.slice(0, 100) + (item.result.length > 100 ? "…" : "")}
                  </p>
                  {item.result.length > 100 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="mt-2 text-[12px] font-semibold transition-colors"
                      style={{ color: "rgba(86,219,132,0.7)" }}
                    >
                      {isExpanded ? "Restrânge ↑" : "Vezi tot ↓"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
