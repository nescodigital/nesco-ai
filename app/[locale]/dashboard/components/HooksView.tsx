"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Hook {
  text: string;
  type: string;
  explanation: string;
}

const TYPE_COLORS: Record<string, string> = {
  "curiosity": "#818cf8",
  "curiozitate": "#818cf8",
  "shock": "#ef4444",
  "șoc": "#ef4444",
  "controversy": "#f97316",
  "controversă": "#f97316",
  "statistic": "#38bdf8",
  "statistică": "#38bdf8",
  "personal story": "#56db84",
  "poveste personală": "#56db84",
  "direct question": "#eab308",
  "întrebare directă": "#eab308",
};

const CONTENT_TYPES = [
  "Post Facebook",
  "Post Instagram",
  "Post LinkedIn",
  "Email newsletter",
  "Reclamă Meta Ads",
];

export default function HooksView({
  onCreditsChange,
  onUseHook,
}: {
  onCreditsChange: (n: number) => void;
  brandId: number;
  onUseHook: (text: string) => void;
}) {
  const t = useTranslations("hooks");
  const tCommon = useTranslations("common");
  const tDashboard = useTranslations("dashboard");
  const [subject, setSubject] = useState("");
  const [contentType, setContentType] = useState("");
  const [loading, setLoading] = useState(false);
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  async function handleGenerate() {
    if (!subject.trim()) return;
    setLoading(true);
    setHooks([]);
    setError("");
    try {
      const res = await fetch("/api/hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, contentType: contentType || undefined }),
      });
      const data = await res.json();
      if (res.status === 402) { setError("no_credits"); return; }
      if (!res.ok) throw new Error(data.error || tCommon("error"));
      setHooks(data.hooks || []);
      if (typeof data.creditsRemaining === "number") onCreditsChange(data.creditsRemaining);
    } catch (e) {
      setError(e instanceof Error ? e.message : tCommon("error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  const selectStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    color: "white",
    fontFamily: "var(--font-geist-sans)",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='rgba(255,255,255,0.3)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' fill='none'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 14px center",
    paddingRight: "36px",
  };

  return (
    <div style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: 0 }}>{t("title")}</h2>
        <span style={{
          fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px",
          background: "rgba(129,140,248,0.12)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)",
        }}>{t("credits")}</span>
      </div>

      {/* Form */}
      <div style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px", padding: "16px", marginBottom: "12px",
        display: "flex", flexDirection: "column", gap: "12px",
      }}>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>
            {t("subject")}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder={t("subjectPlaceholder")}
            style={{
              width: "100%", background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)",
              borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#fff",
              fontFamily: "var(--font-geist-sans)", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>
            {t("contentType")}
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
            style={selectStyle}
          >
            <option value="" style={{ background: "#1a1a1a" }}>{t("anyType")}</option>
            {CONTENT_TYPES.map((ct) => (
              <option key={ct} value={ct} style={{ background: "#1a1a1a" }}>{tDashboard(`contentTypes.${ct === "Post Facebook" ? "facebookPost" : ct === "Post Instagram" ? "instagramPost" : ct === "Post LinkedIn" ? "linkedinPost" : ct === "Email newsletter" ? "emailNewsletter" : "metaAd"}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !subject.trim()}
        style={{
          width: "100%", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
          cursor: loading || !subject.trim() ? "not-allowed" : "pointer",
          background: loading || !subject.trim()
            ? "rgba(129,140,248,0.2)"
            : "linear-gradient(135deg,rgba(129,140,248,0.3),rgba(86,219,132,0.2))",
          color: loading || !subject.trim() ? "rgba(129,140,248,0.5)" : "#c4b5fd",
          border: "1px solid rgba(129,140,248,0.3)",
          transition: "all 0.15s", marginBottom: "20px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="rgba(129,140,248,0.3)" strokeWidth="2" />
              <path d="M8 2a6 6 0 0 1 6 6" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t("generating")}
          </>
        ) : t("generate")}
      </button>

      {/* Error */}
      {error === "no_credits" && (
        <div style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
          <p style={{ color: "#fdba74", fontSize: "13px", fontWeight: 600, margin: "0 0 4px" }}>{t("noCredits.title")}</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: 0 }}>{t("noCredits.body")}</p>
        </div>
      )}
      {error && error !== "no_credits" && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "rgba(252,165,165,0.9)", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Hooks grid */}
      {hooks.length > 0 && (
        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>
            {t("hooksGenerated", { count: hooks.length })}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {hooks.map((hook, i) => {
              const color = TYPE_COLORS[hook.type] || "#818cf8";
              const isCopied = copiedIndex === i;
              return (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "12px", padding: "14px",
                  display: "flex", flexDirection: "column", gap: "8px",
                }}>
                  {/* Type badge */}
                  <span style={{
                    alignSelf: "flex-start", fontSize: "10px", fontWeight: 700, padding: "2px 7px",
                    borderRadius: "20px", background: `${color}15`, color,
                    border: `1px solid ${color}30`, textTransform: "capitalize",
                  }}>
                    {hook.type}
                  </span>
                  {/* Hook text */}
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.4 }}>
                    {hook.text}
                  </p>
                  {/* Explanation */}
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.4 }}>
                    {hook.explanation}
                  </p>
                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                    <button
                      onClick={() => handleCopy(hook.text, i)}
                      style={{
                        flex: 1, padding: "5px 8px", borderRadius: "7px", fontSize: "11px", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                        background: isCopied ? "rgba(86,219,132,0.1)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isCopied ? "rgba(86,219,132,0.3)" : "rgba(255,255,255,0.1)"}`,
                        color: isCopied ? "#56db84" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {isCopied ? tCommon("copied") : tCommon("copy")}
                    </button>
                    <button
                      onClick={() => onUseHook(hook.text)}
                      style={{
                        flex: 1, padding: "5px 8px", borderRadius: "7px", fontSize: "11px", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                        background: `${color}10`, border: `1px solid ${color}25`, color,
                      }}
                    >
                      {t("use")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
