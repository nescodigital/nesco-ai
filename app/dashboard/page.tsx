"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const CONTENT_TYPES = [
  { v: "Post Facebook", l: "👍 Post Facebook" },
  { v: "Post Instagram", l: "📸 Post Instagram" },
  { v: "Post LinkedIn", l: "💼 Post LinkedIn" },
  { v: "Email newsletter", l: "📧 Email newsletter" },
  { v: "Reclamă Meta Ads", l: "🎯 Reclamă Meta Ads" },
];

const OBJECTIVES = [
  { v: "Vânzare", l: "💰 Vânzare" },
  { v: "Awareness", l: "📣 Awareness" },
  { v: "Engagement", l: "💬 Engagement" },
  { v: "Promovare ofertă specială", l: "🎁 Promovare ofertă specială" },
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
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("ro");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => { if (data) setCredits(data.credits); });
      supabase
        .from("generation_history")
        .select("id, content_type, objective, context, result, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)
        .then(({ data }) => { if (data) setHistory(data); });
    });
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setOutput("");
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, objective, context }),
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
      {/* Page title + credits card */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-white mb-1">Generează conținut</h1>
          <p className="text-[14px] text-white/40">
            AI-ul scrie în stilul brandului tău, gata de publicat.
          </p>
        </div>
        {credits !== null && (
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            background: "#111113", border: "1px solid rgba(86,219,132,0.3)",
            borderRadius: "10px", padding: "10px 16px", flexShrink: 0,
          }}>
            <span style={{ color: "#56db84", fontSize: "20px", fontWeight: 800 }}>{credits}</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>credite rămase</span>
            <a href="/pricing" style={{
              marginLeft: "8px", background: "#56db84", color: "#0a0a0a",
              padding: "6px 12px", borderRadius: "6px", fontSize: "12px",
              fontWeight: 700, textDecoration: "none",
            }}>+ Cumpără</a>
          </div>
        )}
      </div>

      {/* No credits error */}
      {error === "no_credits" && (
        <div
          className="rounded-2xl px-5 py-4 mb-5 flex items-start gap-3"
          style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)" }}
        >
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="text-[14px] font-semibold text-orange-300 mb-1">Ai terminat creditele gratuite</p>
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

      {/* Form card */}
      <div
        className="rounded-2xl p-5 mb-4"
        style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Content type */}
          <div>
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
        <div className="mt-4">
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
            <>
              <span>⚡</span>
              <span>Generează</span>
            </>
          )}
        </button>
      </div>

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
          </div>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{output}</ReactMarkdown>
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
              {isTranslating ? "Se traduce..." : "🌍 Traduce — 1 credit"}
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
}
