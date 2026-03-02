"use client";

import { useState, useEffect } from "react";

interface Ad {
  id: string;
  page_name?: string;
  ad_creative_bodies?: string[];
  ad_creative_link_titles?: string[];
  ad_creative_link_descriptions?: string[];
  ad_snapshot_url?: string;
  publisher_platforms?: string[];
  ad_delivery_start_time?: string;
}

interface Analysis {
  strategy: string;
  hooks: string[];
  platforms: string[];
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

const PLATFORM_ICONS: Record<string, string> = {
  facebook: "f",
  instagram: "ig",
  messenger: "m",
  audience_network: "an",
};

export default function VisionView({ brandId = 1 }: Props) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [pageName, setPageName] = useState("");
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
    setAds([]);
    setAnalysis(null);
    setPageName("");
    setError("");

    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageUrl: input.trim(), brandId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Eroare la analiză"); return; }
      setAds(data.ads ?? []);
      setAnalysis(data.analysis ?? null);
      setPageName(data.pageName ?? input.trim());
      // Refresh competitors list
      if (data.ads?.length > 0) {
        setCompetitors((prev) => {
          const id = input.trim().split("/").filter(Boolean).pop() ?? input.trim();
          const existing = prev.find((c) => c.page_identifier === id);
          if (existing) return prev.map((c) => c.page_identifier === id ? { ...c, page_name: data.pageName, last_checked: new Date().toISOString() } : c);
          return [{ page_identifier: id, page_name: data.pageName, last_checked: new Date().toISOString() }, ...prev];
        });
      }
    } catch {
      setError("Ceva n-a mers. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  function handleCompetitorClick(c: Competitor) {
    setInput(`facebook.com/${c.page_identifier}`);
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
          Analizează reclamele active ale competitorilor și descoperă cum să te diferențiezi.
        </p>
      </div>

      {/* Search bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <input
          style={inputStyle}
          placeholder="facebook.com/competitor sau URL pagină Facebook"
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
      {!loadingCompetitors && competitors.length > 0 && !ads.length && !loading && (
        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            Competitori urmăriți
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {competitors.map((c) => (
              <button
                key={c.page_identifier}
                onClick={() => handleCompetitorClick(c)}
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

      {/* No ads found */}
      {!loading && !error && pageName && ads.length === 0 && (
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "12px", padding: "32px", textAlign: "center",
          color: "rgba(255,255,255,0.4)", fontSize: "14px",
        }}>
          Nicio reclamă activă găsită pentru <strong style={{ color: "rgba(255,255,255,0.7)" }}>{pageName}</strong>.
        </div>
      )}

      {/* Results */}
      {(analysis || ads.length > 0) && (
        <div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "20px" }}>
            {ads.length} reclame active găsite pentru <strong style={{ color: "#fff" }}>{pageName}</strong>
          </p>

          {/* AI Analysis */}
          {analysis && (
            <div style={{
              background: "linear-gradient(135deg,rgba(86,219,132,0.06),rgba(129,140,248,0.04))",
              border: "1px solid rgba(86,219,132,0.18)",
              borderRadius: "14px",
              padding: "20px",
              marginBottom: "24px",
            }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#56db84", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>
                Analiză AI
              </p>

              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                  Strategia lor
                </p>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: 0 }}>
                  {analysis.strategy}
                </p>
              </div>

              {analysis.hooks?.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                    Hook-uri recurente
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {analysis.hooks.map((hook, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: "8px",
                        fontSize: "13px", color: "rgba(255,255,255,0.7)",
                      }}>
                        <span style={{ color: "#818cf8", flexShrink: 0, marginTop: "1px" }}>→</span>
                        {hook}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
          )}

          {/* Ads grid */}
          {ads.length > 0 && (
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                Reclame active
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {ads.map((ad) => {
                  const body = ad.ad_creative_bodies?.[0] ?? "";
                  const title = ad.ad_creative_link_titles?.[0] ?? "";
                  const platforms = ad.publisher_platforms ?? [];
                  return (
                    <div
                      key={ad.id}
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "12px",
                        padding: "16px",
                      }}
                    >
                      {title && (
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
                          {title}
                        </p>
                      )}
                      {body && (
                        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, margin: "0 0 12px", whiteSpace: "pre-wrap" }}>
                          {body.length > 400 ? body.slice(0, 400) + "…" : body}
                        </p>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {platforms.map((p) => (
                            <span key={p} style={{
                              background: "rgba(129,140,248,0.12)",
                              border: "1px solid rgba(129,140,248,0.2)",
                              borderRadius: "4px",
                              padding: "2px 8px",
                              fontSize: "11px",
                              color: "#818cf8",
                              textTransform: "capitalize",
                            }}>
                              {PLATFORM_ICONS[p] ? PLATFORM_ICONS[p].toUpperCase() + " · " : ""}{p}
                            </span>
                          ))}
                        </div>
                        {ad.ad_snapshot_url && (
                          <a
                            href={ad.ad_snapshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "12px",
                              color: "rgba(255,255,255,0.3)",
                              textDecoration: "none",
                            }}
                          >
                            Vezi reclamă →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
