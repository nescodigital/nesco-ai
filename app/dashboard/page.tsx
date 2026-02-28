"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

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

export default function DashboardPage() {
  const [contentType, setContentType] = useState(CONTENT_TYPES[0].v);
  const [objective, setObjective] = useState(OBJECTIVES[0].v);
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

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
      if (!res.ok) throw new Error(data.error || "Eroare la generare");
      setOutput(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ceva n-a mers. Încearcă din nou.");
    } finally {
      setLoading(false);
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
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-[22px] font-bold text-white mb-1">Generează conținut</h1>
        <p className="text-[14px] text-white/40">
          AI-ul scrie în stilul brandului tău, gata de publicat.
        </p>
      </div>

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
      {error && (
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
          className="rounded-2xl p-5"
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
        </div>
      )}
    </div>
  );
}
