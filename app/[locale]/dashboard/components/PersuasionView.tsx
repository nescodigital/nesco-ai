"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Dimension {
  score: number;
  label: string;
  feedback: string;
}

interface ScoreResult {
  overall: number;
  dimensions: {
    loss_aversion: Dimension;
    credibility: Dimension;
    cta_clarity: Dimension;
    attention_retention: Dimension;
  };
  weak_point: string;
  improvements: string[];
}

function scoreColor(score: number) {
  if (score < 40) return "#ef4444";
  if (score < 60) return "#f97316";
  if (score < 70) return "#eab308";
  return "#56db84";
}

function DimensionBar({ dim }: { dim: Dimension }) {
  const color = scoreColor(dim.score);
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "10px", padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{dim.label}</span>
        <span style={{ fontSize: "13px", fontWeight: 800, color }}>{dim.score}</span>
      </div>
      <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.08)", marginBottom: "8px" }}>
        <div style={{ height: "100%", borderRadius: "2px", background: color, width: `${dim.score}%`, transition: "width 0.6s ease" }} />
      </div>
      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, margin: 0 }}>{dim.feedback}</p>
    </div>
  );
}

export default function PersuasionView({ onCreditsChange }: { onCreditsChange: (n: number) => void }) {
  const t = useTranslations("persuasion");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/persuasion-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (res.status === 402) { setError("no_credits"); return; }
      if (!res.ok) throw new Error(data.error || t("analyzing"));
      setResult(data.result);
      if (typeof data.creditsRemaining === "number") onCreditsChange(data.creditsRemaining);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("analyzing"));
    } finally {
      setLoading(false);
    }
  }

  const overallColor = result ? scoreColor(result.overall) : "#56db84";
  const dims = result ? Object.values(result.dimensions) : [];

  return (
    <div style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: 0 }}>{t("title")}</h2>
        <span style={{
          fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "20px",
          background: "rgba(86,219,132,0.1)", color: "#56db84", border: "1px solid rgba(86,219,132,0.2)",
        }}>{t("credits")}</span>
      </div>

      {/* Textarea */}
      <div style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px", padding: "16px", marginBottom: "12px",
      }}>
        <label style={{ display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", marginBottom: "8px" }}>
          {t("label")}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          rows={6}
          style={{
            width: "100%", background: "transparent", border: "none", outline: "none",
            color: "#fff", fontSize: "14px", lineHeight: 1.6, resize: "vertical",
            fontFamily: "var(--font-geist-sans)", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        style={{
          width: "100%", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
          border: "none", cursor: loading || !text.trim() ? "not-allowed" : "pointer",
          background: loading || !text.trim()
            ? "rgba(86,219,132,0.3)"
            : "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)",
          color: "#0a0a0a",
          boxShadow: loading || !text.trim() ? "none" : "0 4px 20px rgba(86,219,132,0.2)",
          transition: "all 0.15s", marginBottom: "20px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
              <path d="M8 2a6 6 0 0 1 6 6" stroke="#000" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {t("analyzing")}
          </>
        ) : t("analyze")}
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

      {/* Results */}
      {result && (
        <div>
          {/* Overall score */}
          <div style={{
            textAlign: "center", padding: "28px 20px", marginBottom: "16px",
            background: "rgba(255,255,255,0.02)", border: `1px solid ${overallColor}30`,
            borderRadius: "16px", boxShadow: `0 0 32px ${overallColor}10`,
          }}>
            <div style={{ fontSize: "72px", fontWeight: 900, color: overallColor, lineHeight: 1, marginBottom: "6px" }}>
              {result.overall}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              {t("score")}
            </div>
          </div>

          {/* Dimensions grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {dims.map((dim, i) => <DimensionBar key={i} dim={dim} />)}
          </div>

          {/* Weak point */}
          <div style={{
            background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.2)",
            borderRadius: "12px", padding: "14px 16px", marginBottom: "12px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(251,146,60,0.7)", margin: "0 0 6px" }}>
              {t("weakPoint")}
            </p>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
              &ldquo;{result.weak_point}&rdquo;
            </p>
          </div>

          {/* Improvements */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px", padding: "14px 16px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", margin: "0 0 10px" }}>
              {t("improvements")}
            </p>
            <ol style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {result.improvements.map((imp, i) => (
                <li key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{imp}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
