"use client";

import { useState, useEffect, useRef } from "react";

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
}

interface Competitor {
  page_identifier: string;
  page_name: string;
  last_checked: string;
}

interface Props {
  brandId?: number;
}

const LOADING_STEPS = [
  "Accesez site-ul competitorului…",
  "Extrag conținutul de marketing…",
  "Analizez strategia și mesajele cheie…",
  "Generez recomandări de diferențiere…",
];

export default function VisionView({ brandId = 1 }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);
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
    if (!input.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setDomain("");
    setError("");
    startLoadingAnimation();

    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageUrl: input.trim(), brandId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Eroare la analiză"); return; }
      setAnalysis(data.analysis);
      setDomain(data.domain ?? input.trim());
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
      setError("Ceva n-a mers. Încearcă din nou.");
    } finally {
      stopLoadingAnimation();
      setLoading(false);
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
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
          Vision AI
        </h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Introdu URL-ul site-ului unui competitor — AI analizează strategia lor de marketing și îți spune cum să te diferențiezi.
        </p>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <input
          style={inputStyle}
          placeholder="ex: competitor.ro sau https://competitor.ro"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !input.trim()}
          style={{
            background: loading ? "rgba(86,219,132,0.3)" : "linear-gradient(135deg,#56db84,#818cf8)",
            color: "#000",
            border: "none",
            borderRadius: "10px",
            padding: "12px 20px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-geist-sans)",
            flexShrink: 0,
          }}
        >
          {loading ? "Analizez…" : "Analizează"}
        </button>
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
            {loadingProgress < 100 ? `${loadingProgress}%` : "Finalizez…"}
          </p>
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        </div>
      )}

      {/* Tracked competitors */}
      {!loadingCompetitors && competitors.length > 0 && !analysis && !loading && (
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Competitori analizați
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {competitors.map((c) => (
              <button
                key={c.page_identifier}
                onClick={() => setInput(`https://${c.page_identifier}`)}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "var(--font-geist-sans)",
                }}
              >
                {c.page_name || c.page_identifier}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: "10px", padding: "14px 16px", marginBottom: "20px",
          color: "#fca5a5", fontSize: "13px",
        }}>
          {error}
        </div>
      )}

      {/* Analysis results */}
      {analysis && (
        <div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
            Analiză pentru <strong style={{ color: "#fff" }}>{analysis.competitorName || domain}</strong>
          </p>

          {/* Strategy + Tone row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
              <p style={labelStyle}>Strategia lor</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>{analysis.strategy}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "16px" }}>
              <p style={labelStyle}>Ton comunicare</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "0 0 12px" }}>{analysis.tone}</p>
              {analysis.offers?.length > 0 && (
                <>
                  <p style={{ ...labelStyle, marginTop: "12px" }}>Servicii / Produse</p>
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
                <p style={labelStyle}>Frici / Dureri adresate</p>
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
                <p style={labelStyle}>Mesaje / Hook-uri cheie</p>
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
              <p style={{ ...labelStyle, color: "#fbbf24" }}>Puncte slabe identificate</p>
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
              Avantajul tău competitiv
            </p>
            <div style={{ marginBottom: "16px" }}>
              <p style={labelStyle}>Cum te diferențiezi</p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>{analysis.differentiation}</p>
            </div>
            {analysis.actionableMove && (
              <div style={{ background: "rgba(86,219,132,0.08)", border: "1px solid rgba(86,219,132,0.2)", borderRadius: "8px", padding: "12px 14px" }}>
                <p style={{ ...labelStyle, color: "#56db84" }}>Acțiunea de făcut acum</p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>{analysis.actionableMove}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => { setAnalysis(null); setDomain(""); setInput(""); }}
            style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 16px", color: "rgba(255,255,255,0.4)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-geist-sans)" }}
          >
            ← Analizează alt competitor
          </button>
        </div>
      )}
    </div>
  );
}
