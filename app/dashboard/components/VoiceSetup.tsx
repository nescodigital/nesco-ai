"use client";

import { useEffect, useState } from "react";

interface StyleProfile {
  sentence_length: string;
  tone: string;
  signature_phrases: string[];
  punctuation_style: string;
  emoji_usage: string;
  opener_pattern: string;
  paragraph_style: string;
  vocabulary_level: string;
  writing_rules: string[];
}

const EMPTY_SAMPLE = "";
const MIN_SAMPLES = 3;
const MAX_SAMPLES = 10;
const DEFAULT_COUNT = 5;

export default function VoiceSetup({
  brandId,
  plan,
  onProfileReady,
}: {
  brandId: number;
  plan: string | null;
  onProfileReady: (has: boolean) => void;
}) {
  const isPro = plan === "pro" || plan === "multi-brand";
  const [samples, setSamples] = useState<string[]>(Array(DEFAULT_COUNT).fill(EMPTY_SAMPLE));
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/personal-voice?brandId=${brandId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.hasProfile) {
          setStyleProfile(data.style_profile);
          if (data.samples?.length) setSamples(data.samples);
          onProfileReady(true);
        } else {
          onProfileReady(false);
        }
        setLoadingInit(false);
      });
  }, [brandId, onProfileReady]);

  async function handleAnalyze() {
    const validSamples = samples.filter((s) => s.trim().length > 20);
    if (validSamples.length < MIN_SAMPLES) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/personal-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples, brandId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare la analiză");
      setStyleProfile(data.style_profile);
      setEditing(false);
      onProfileReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ceva n-a mers");
    } finally {
      setLoading(false);
    }
  }

  const filledCount = samples.filter((s) => s.trim().length > 20).length;

  if (loadingInit) return null;

  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px",
      marginBottom: "16px", overflow: "hidden",
      background: open ? "rgba(255,255,255,0.02)" : "transparent",
      transition: "background 0.15s",
    }}>
      {/* Header — always visible, clickable */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.8 2 4 3.8 4 6c0 1.5.8 2.8 2 3.5V11h4V9.5C11.2 8.8 12 7.5 12 6c0-2.2-1.8-4-4-4z" stroke={styleProfile ? "#56db84" : "rgba(255,255,255,0.4)"} strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M6 11v1a2 2 0 0 0 4 0v-1" stroke={styleProfile ? "#56db84" : "rgba(255,255,255,0.4)"} strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 700, color: styleProfile ? "#56db84" : "rgba(255,255,255,0.7)" }}>
            Scrie ca mine
          </span>
          {styleProfile && !editing && (
            <span style={{
              fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "20px",
              background: "rgba(86,219,132,0.1)", color: "#56db84", border: "1px solid rgba(86,219,132,0.2)",
            }}>activ</span>
          )}
          {!isPro && (
            <span style={{
              fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "20px",
              background: "rgba(129,140,248,0.1)", color: "#818cf8", border: "1px solid rgba(129,140,248,0.2)",
            }}>Pro</span>
          )}
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <path d="M2 4l4 4 4-4" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Collapsed content */}
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {!isPro ? (
            /* Locked — not Pro */
            <div style={{
              background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)",
              borderRadius: "10px", padding: "14px 16px", textAlign: "center",
            }}>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: "0 0 10px" }}>
                Clonarea vocii tale e disponibilă din planul Pro.
              </p>
              <a href="/pricing" style={{
                display: "inline-block", padding: "7px 16px", borderRadius: "8px", fontSize: "13px",
                fontWeight: 700, background: "linear-gradient(135deg,#818cf8,#a78bfa)",
                color: "#fff", textDecoration: "none",
              }}>
                Upgrade la Pro →
              </a>
            </div>
          ) : styleProfile && !editing ? (
            /* Profile exists — show preview */
            <div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: "0 0 10px" }}>
                AI-ul a învățat stilul tău. Activează toggle-ul de mai jos pentru a genera în vocea ta.
              </p>
              <div style={{
                background: "rgba(86,219,132,0.04)", border: "1px solid rgba(86,219,132,0.12)",
                borderRadius: "10px", padding: "12px 14px", marginBottom: "10px",
              }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(86,219,132,0.7)", margin: "0 0 8px" }}>
                  Regulile tale de scriere
                </p>
                <ol style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {styleProfile.writing_rules.map((rule, i) => (
                    <li key={i} style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>{rule}</li>
                  ))}
                </ol>
              </div>
              <button
                onClick={() => setEditing(true)}
                style={{
                  fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.4)",
                  background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "7px", padding: "5px 12px", cursor: "pointer",
                }}
              >
                Actualizează stilul
              </button>
            </div>
          ) : (
            /* Setup form */
            <div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: "0 0 12px", lineHeight: 1.5 }}>
                Paste-uiește {MIN_SAMPLES}–{MAX_SAMPLES} texte scrise de tine — postări, emailuri, mesaje. AI-ul îți clonează stilul exact.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "10px" }}>
                {samples.map((sample, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <textarea
                      value={sample}
                      onChange={(e) => {
                        const next = [...samples];
                        next[i] = e.target.value;
                        setSamples(next);
                      }}
                      placeholder={`Text ${i + 1} — scris de tine...`}
                      rows={3}
                      style={{
                        width: "100%", background: "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${sample.trim().length > 20 ? "rgba(86,219,132,0.2)" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: "8px", padding: "8px 10px", fontSize: "13px",
                        color: "#fff", resize: "vertical", outline: "none",
                        fontFamily: "var(--font-geist-sans)", lineHeight: 1.5, boxSizing: "border-box",
                        transition: "border-color 0.15s",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {samples.length < MAX_SAMPLES && (
                  <button
                    onClick={() => setSamples([...samples, EMPTY_SAMPLE])}
                    style={{
                      fontSize: "12px", color: "rgba(255,255,255,0.4)", background: "transparent",
                      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "7px",
                      padding: "5px 10px", cursor: "pointer",
                    }}
                  >
                    + Adaugă exemplu
                  </button>
                )}
                <button
                  onClick={handleAnalyze}
                  disabled={loading || filledCount < MIN_SAMPLES}
                  style={{
                    padding: "7px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 700,
                    border: "none", cursor: loading || filledCount < MIN_SAMPLES ? "not-allowed" : "pointer",
                    background: loading || filledCount < MIN_SAMPLES
                      ? "rgba(86,219,132,0.2)"
                      : "linear-gradient(135deg,#56db84,#3ecf8e)",
                    color: loading || filledCount < MIN_SAMPLES ? "rgba(86,219,132,0.5)" : "#0a0a0a",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="4" stroke="rgba(0,0,0,0.2)" strokeWidth="2"/>
                        <path d="M6 2a4 4 0 0 1 4 4" stroke="rgba(0,0,0,0.6)" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Se analizează...
                    </>
                  ) : `Analizează stilul meu${filledCount < MIN_SAMPLES ? ` (${filledCount}/${MIN_SAMPLES})` : ""}`}
                </button>
                {editing && styleProfile && (
                  <button
                    onClick={() => setEditing(false)}
                    style={{
                      fontSize: "12px", color: "rgba(255,255,255,0.35)", background: "transparent",
                      border: "none", cursor: "pointer", padding: "5px",
                    }}
                  >
                    Anulează
                  </button>
                )}
              </div>

              {error && (
                <p style={{ fontSize: "12px", color: "rgba(252,165,165,0.8)", marginTop: "8px" }}>{error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
