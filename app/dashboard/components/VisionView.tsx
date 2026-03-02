"use client";

import { useState, useEffect } from "react";

interface Analysis {
  competitorName: string;
  strategy: string;
  hooks: string[];
  tone: string;
  offers: string[];
  differentiation: string;
}

interface Competitor {
  page_identifier: string;
  page_name: string;
  last_checked: string;
}

interface Props {
  brandId?: number;
}

export default function VisionView({ brandId = 1 }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(true);

  useEffect(() => {
    setLoadingCompetitors(true);
    fetch(`/api/vision?brandId=${brandId}`)
      .then((r) => r.json())
      .then((d) => setCompetitors(d.competitors ?? []))
      .catch(() => {})
      .finally(() => setLoadingCompetitors(false));
  }, [brandId]);

  async function handleSearch() {
    if (!input.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setDomain("");
    setError("");

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
      setError("Ceva n-a mers. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

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

          <div style={{
            background: "linear-gradient(135deg,rgba(86,219,132,0.06),rgba(129,140,248,0.04))",
            border: "1px solid rgba(86,219,132,0.18)",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "16px",
          }}>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#56db84", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>
              Analiză AI
            </p>

            {/* Strategy */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                Strategia lor
              </p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: 0 }}>
                {analysis.strategy}
              </p>
            </div>

            {/* Tone */}
            {analysis.tone && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Ton comunicare
                </p>
                <span style={{
                  display: "inline-block",
                  background: "rgba(129,140,248,0.12)",
                  border: "1px solid rgba(129,140,248,0.2)",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: "13px",
                  color: "#818cf8",
                }}>
                  {analysis.tone}
                </span>
              </div>
            )}

            {/* Hooks */}
            {analysis.hooks?.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                  Mesaje cheie
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {analysis.hooks.map((hook, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                      <span style={{ color: "#818cf8", flexShrink: 0, marginTop: "1px" }}>→</span>
                      {hook}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offers */}
            {analysis.offers?.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                  Produse / Servicii principale
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {analysis.offers.map((offer, i) => (
                    <span key={i} style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "6px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      color: "rgba(255,255,255,0.6)",
                    }}>
                      {offer}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Differentiation */}
            <div style={{
              background: "rgba(86,219,132,0.06)",
              border: "1px solid rgba(86,219,132,0.15)",
              borderRadius: "10px",
              padding: "14px 16px",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#56db84", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                Cum te diferențiezi
              </p>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: 0 }}>
                {analysis.differentiation}
              </p>
            </div>
          </div>

          <button
            onClick={() => { setAnalysis(null); setDomain(""); setInput(""); }}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "8px 16px",
              color: "rgba(255,255,255,0.4)",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "var(--font-geist-sans)",
            }}
          >
            ← Analizează alt competitor
          </button>
        </div>
      )}
    </div>
  );
}
