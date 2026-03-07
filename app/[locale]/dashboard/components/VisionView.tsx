"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface BrandInsights {
  usp: string;
  tone_words: string[];
  buying_decision: string;
}

interface Analysis {
  competitorName: string;
  strategy: string;
  painPoints: string[];
  hooks: string[];
  tone: string;
  offers: string[];
  weaknesses: string[];
  differentiation: string;
  actionableMove: string;
  brandInsights?: BrandInsights;
}

interface Competitor {
  page_identifier: string;
  page_name: string;
  last_checked: string;
}

interface Props {
  brandId?: number;
  onCreditsChange?: (n: number) => void;
}

type SourceType = "website" | "text";

export default function VisionView({ brandId = 1, onCreditsChange }: Props) {
  const t = useTranslations("vision");
  const LOADING_STEPS = [
    t("loadingSteps.step1"),
    t("loadingSteps.step2"),
    t("loadingSteps.step3"),
    t("loadingSteps.step4"),
  ];
  const [sourceType, setSourceType] = useState<SourceType>("website");
  const [input, setInput] = useState("");
  const [manualText, setManualText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);
  const [applyingInsights, setApplyingInsights] = useState(false);
  const [insightsApplied, setInsightsApplied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLoadingCompetitors(true);
    fetch(`/api/vision?brandId=${brandId}`)
      .then((r) => r.json())
      .then((d) => setCompetitors(d.competitors ?? []))
      .catch(() => {})
      .finally(() => setLoadingCompetitors(false));
  }, [brandId]);

  function startLoadingAnimation() {
    setLoadingStep(0);
    setLoadingProgress(0);

    let step = 0;
    let progress = 0;
    // Total ~12s animation: each step ~3s, progress fills to 92% then waits
    progressIntervalRef.current = setInterval(() => {
      progress += 1;
      if (progress <= 92) setLoadingProgress(progress);
      // Advance step every ~25 ticks (~2.5s)
      const newStep = Math.min(Math.floor(progress / 25), LOADING_STEPS.length - 1);
      if (newStep !== step) { step = newStep; setLoadingStep(newStep); }
    }, 100);
  }

  function stopLoadingAnimation() {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setLoadingProgress(100);
  }

  async function handleSearch() {
    const hasInput = sourceType === "website" ? !!input.trim() : !!manualText.trim();
    if (!hasInput) return;
    setLoading(true);
    setAnalysis(null);
    setDomain("");
    setError("");
    startLoadingAnimation();

    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageUrl: input.trim() || undefined,
          manualText: manualText.trim() || undefined,
          sourceType,
          brandId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "no_credits") { setError("no_credits"); }
        else { setError(data.error || t("error")); }
        return;
      }
      setAnalysis(data.analysis);
      setInsightsApplied(false);
      setDomain(data.domain ?? input.trim());
      if (typeof data.creditsRemaining === "number") onCreditsChange?.(data.creditsRemaining);
      if (data.analysis) {
        const name = data.competitorName || data.domain || input.trim();
        setCompetitors((prev) => {
          const id = data.domain ?? input.trim();
          const existing = prev.find((c) => c.page_identifier === id);
          if (existing) return prev.map((c) => c.page_identifier === id ? { ...c, page_name: name, last_checked: new Date().toISOString() } : c);
          return [{ page_identifier: id, page_name: name, last_checked: new Date().toISOString() }, ...prev];
        });
      }
    } catch {
      stopLoadingAnimation();
      setError(t("error"));
    } finally {
      stopLoadingAnimation();
      setLoading(false);
    }
  }

  async function handleSendEmail() {
    if (!analysis) return;
    setSendingEmail(true);
    try {
      await fetch("/api/send-spy-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, competitorName: domain }),
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch {
      // silent
    } finally {
      setSendingEmail(false);
    }
  }

  async function handleLoadSaved(identifier: string) {
    const res = await fetch(`/api/vision?brandId=${brandId}&identifier=${encodeURIComponent(identifier)}`);
    const data = await res.json();
    if (data.analysis) {
      setAnalysis(data.analysis);
      setDomain(identifier);
      setInput(identifier);
      setInsightsApplied(false);
      setEmailSent(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleApplyInsights() {
    if (!analysis?.brandInsights) return;
    setApplyingInsights(true);
    try {
      const res = await fetch("/api/brand-insights-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, insights: analysis.brandInsights }),
      });
      if (res.ok) setInsightsApplied(true);
    } catch {
      // silent
    } finally {
      setApplyingInsights(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "white",
    fontSize: "14px",
    fontFamily: "var(--font-geist-sans)",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0 }}>
            {t("title")}
          </h2>
          <span style={{
            fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "20px",
            background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)",
            color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.08em",
          }}>{t("credits")}</span>
        </div>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          {t("subtitle")}
        </p>
      </div>

      {/* Source type selector */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
        {(["website", "text"] as SourceType[]).map((type) => (
          <button
            key={type}
            onClick={() => setSourceType(type)}
            style={{
              padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
              border: "none", cursor: "pointer", fontFamily: "var(--font-geist-sans)",
              background: sourceType === type
                ? "rgba(255,255,255,0.08)" : "transparent",
              color: sourceType === type ? "#fff" : "rgba(255,255,255,0.3)",
              boxShadow: sourceType === type ? "0 0 0 1px rgba(255,255,255,0.1) inset" : "none",
            }}
          >
            {type === "website" ? t("tabUrl") : t("tabText")}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
        {sourceType === "website" ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              style={inputStyle}
              placeholder={t("urlPlaceholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !input.trim()}
              style={{
                background: loading ? "rgba(86,219,132,0.3)" : "linear-gradient(135deg,#56db84,#818cf8)",
                color: "#000", border: "none", borderRadius: "10px",
                padding: "12px 20px", fontSize: "13px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", fontFamily: "var(--font-geist-sans)", flexShrink: 0,
              }}
            >
              {loading ? t("analyzing") : t("analyze")}
            </button>
          </div>
        ) : (
          <>
            <input
              style={{ ...inputStyle, marginBottom: "0" }}
              placeholder={t("competitorName")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <textarea
                style={{
                  ...inputStyle,
                  minHeight: "120px",
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
                placeholder={t("textPlaceholder")}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !manualText.trim()}
                style={{
                  background: loading ? "rgba(86,219,132,0.3)" : "linear-gradient(135deg,#56db84,#818cf8)",
                  color: "#000", border: "none", borderRadius: "10px",
                  padding: "12px 20px", fontSize: "13px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap", fontFamily: "var(--font-geist-sans)", flexShrink: 0,
                  marginTop: "0",
                }}
              >
                {loading ? t("analyzing") : t("analyze")}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#56db84",
              animation: "pulse 1.2s ease-in-out infinite",
            }} />
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", margin: 0, fontWeight: 500 }}>
              {LOADING_STEPS[loadingStep]}
            </p>
          </div>
          {/* Progress bar */}
          <div style={{
            width: "100%", height: "4px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${loadingProgress}%`,
              background: "linear-gradient(90deg,#56db84,#818cf8)",
              borderRadius: "2px",
              transition: "width 0.1s linear",
            }} />
          </div>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: "10px 0 0", textAlign: "right" }}>
            {loadingProgress < 100 ? `${loadingProgress}%` : t("analyzing")}
          </p>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        </div>
      )}

      {/* Tracked competitors */}
      {!loadingCompetitors && competitors.length > 0 && !analysis && !loading && (
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            {t("history")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {competitors.map((c) => (
              <div
                key={c.page_identifier}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "8px", padding: "8px 12px", gap: "10px",
                }}
              >
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-geist-sans)" }}>
                  {c.page_name || c.page_identifier}
                </span>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={() => handleLoadSaved(c.page_identifier)}
                    style={{
                      background: "rgba(86,219,132,0.08)", border: "1px solid rgba(86,219,132,0.2)",
                      borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 600,
                      color: "#56db84", cursor: "pointer", fontFamily: "var(--font-geist-sans)",
                    }}
                  >
                    {t("reload")}
                  </button>
                  <button
                    onClick={() => setInput(`https://${c.page_identifier}`)}
                    style={{
                      background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px", padding: "4px 10px", fontSize: "12px",
                      color: "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "var(--font-geist-sans)",
                    }}
                  >
                    {t("reanalyze")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error === "no_credits" && (
        <div style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
          <p style={{ color: "#fdba74", fontSize: "14px", fontWeight: 600, margin: "0 0 4px" }}>{t("noCredits.title")}</p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 10px" }}>{t("noCredits.body")}</p>
          <a href="/pricing" style={{ background: "#56db84", color: "#000", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>{t("noCredits.cta")}</a>
        </div>
      )}
      {error && error !== "no_credits" && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", color: "#fca5a5", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Analysis results */}
      {analysis && (
        <div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
            {t("analysisFor")} <strong style={{ color: "#fff" }}>{analysis.competitorName || domain}</strong>
          </p>

          {/* Strategy + Tone row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
              <p style={labelStyle}>{t("sections.strategy")}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>{analysis.strategy}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
              <p style={labelStyle}>{t("sections.tone")}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "0 0 12px" }}>{analysis.tone}</p>
              {analysis.offers?.length > 0 && (
                <>
                  <p style={{ ...labelStyle, marginTop: "12px" }}>{t("sections.services")}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                    {analysis.offers.map((o, i) => (
                      <span key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", padding: "3px 8px", fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>{o}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pain points + Hooks row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            {analysis.painPoints?.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
                <p style={labelStyle}>{t("sections.pains")}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {analysis.painPoints.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                      <span style={{ color: "#f87171", flexShrink: 0 }}>!</span>{p}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {analysis.hooks?.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
                <p style={labelStyle}>{t("sections.hooks")}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {analysis.hooks.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                      <span style={{ color: "#818cf8", flexShrink: 0 }}>→</span>{h}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Weaknesses */}
          {analysis.weaknesses?.length > 0 && (
            <div style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
              <p style={{ ...labelStyle, color: "#fbbf24" }}>{t("sections.weaknesses")}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {analysis.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                    <span style={{ color: "#fbbf24", flexShrink: 0 }}>↓</span>{w}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Differentiation + Actionable move */}
          <div style={{ background: "linear-gradient(135deg,rgba(86,219,132,0.07),rgba(129,140,248,0.05))", border: "1px solid rgba(86,219,132,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#56db84", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
              {t("sections.advantage")}
            </p>
            <div style={{ marginBottom: "16px" }}>
              <p style={labelStyle}>{t("sections.differentiation")}</p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>{analysis.differentiation}</p>
            </div>
            {analysis.actionableMove && (
              <div style={{ background: "rgba(86,219,132,0.08)", border: "1px solid rgba(86,219,132,0.2)", borderRadius: "8px", padding: "12px 14px" }}>
                <p style={{ ...labelStyle, color: "#56db84" }}>{t("sections.action")}</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>{analysis.actionableMove}</p>
              </div>
            )}
          </div>

          {/* Apply to brand */}
          {analysis.brandInsights && (
            <div style={{ background: "rgba(129,140,248,0.05)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#818cf8", margin: "0 0 4px" }}>
                    {t("apply.title")}
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                    {insightsApplied ? t("apply.success") : t("apply.subtitle")}
                  </p>
                </div>
                <button
                  onClick={handleApplyInsights}
                  disabled={applyingInsights || insightsApplied}
                  style={{
                    background: insightsApplied ? "rgba(86,219,132,0.15)" : "linear-gradient(135deg,#818cf8,#a78bfa)",
                    color: insightsApplied ? "#56db84" : "#fff",
                    border: insightsApplied ? "1px solid rgba(86,219,132,0.3)" : "none",
                    borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 700,
                    cursor: applyingInsights || insightsApplied ? "default" : "pointer",
                    whiteSpace: "nowrap", fontFamily: "var(--font-geist-sans)", flexShrink: 0,
                  }}
                >
                  {insightsApplied ? t("apply.applied") : applyingInsights ? t("apply.applying") : t("apply.cta")}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              style={{
                background: emailSent ? "rgba(86,219,132,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${emailSent ? "rgba(86,219,132,0.3)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: 600,
                color: emailSent ? "#56db84" : "rgba(255,255,255,0.5)",
                cursor: sendingEmail ? "not-allowed" : "pointer",
                fontFamily: "var(--font-geist-sans)", transition: "all 0.15s",
              }}
            >
              {emailSent ? t("email.sent") : sendingEmail ? t("email.sending") : t("email.cta")}
            </button>
            <button
              onClick={() => { setAnalysis(null); setDomain(""); setInput(""); setInsightsApplied(false); setEmailSent(false); }}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 16px", color: "rgba(255,255,255,0.4)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-geist-sans)" }}
            >
              {t("backBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
