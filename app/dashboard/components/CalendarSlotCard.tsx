"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export interface CalendarSlot {
  id: string;
  scheduled_date: string;
  content_type: string;
  objective: string;
  context: string | null;
  status: "suggested" | "approved" | "generated";
  result: string | null;
}

interface Props {
  slot: CalendarSlot;
  onUpdate: (id: string, updates: Partial<CalendarSlot>) => void;
  onDelete: (id: string) => void;
  onCreditsChange: (n: number) => void;
}

const CONTENT_TYPE_ICONS: Record<string, string> = {
  "Post Facebook": "👍",
  "Post Instagram": "📸",
  "Post LinkedIn": "💼",
  "Email newsletter": "📧",
  "Reclamă Meta Ads": "🎯",
};

const OBJECTIVE_COLORS: Record<string, string> = {
  Vânzare: "rgba(251,146,60,0.15)",
  Awareness: "rgba(129,140,248,0.15)",
  Engagement: "rgba(86,219,132,0.12)",
  "Promovare ofertă specială": "rgba(251,113,133,0.12)",
};

const OBJECTIVE_TEXT_COLORS: Record<string, string> = {
  Vânzare: "#fb923c",
  Awareness: "#818cf8",
  Engagement: "#56db84",
  "Promovare ofertă specială": "#fb7185",
};

const IMAGE_FORMATS = [
  { id: "1:1", label: "1:1", w: 18, h: 18 },
  { id: "4:5", label: "4:5", w: 14, h: 18 },
  { id: "16:9", label: "16:9", w: 22, h: 13 },
] as const;

export default function CalendarSlotCard({ slot, onUpdate, onDelete, onCreditsChange }: Props) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingContext, setEditingContext] = useState(false);
  const [contextValue, setContextValue] = useState(slot.context ?? "");
  const [imageFormat, setImageFormat] = useState<"1:1" | "4:5" | "16:9">("1:1");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const icon = CONTENT_TYPE_ICONS[slot.content_type] ?? "📝";
  const objColor = OBJECTIVE_COLORS[slot.objective] ?? "rgba(255,255,255,0.05)";
  const objTextColor = OBJECTIVE_TEXT_COLORS[slot.objective] ?? "rgba(255,255,255,0.5)";

  const borderColor =
    slot.status === "generated"
      ? "rgba(86,219,132,0.4)"
      : slot.status === "approved"
      ? "rgba(86,219,132,0.2)"
      : "rgba(251,146,60,0.2)";

  const bgColor =
    slot.status === "generated"
      ? "rgba(86,219,132,0.04)"
      : slot.status === "approved"
      ? "rgba(86,219,132,0.02)"
      : "rgba(251,146,60,0.02)";

  async function handleApprove() {
    await fetch(`/api/calendar/${slot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    onUpdate(slot.id, { status: "approved" });
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/calendar/${slot.id}/generate`, { method: "POST" });
      const data = await res.json();
      if (res.status === 402) {
        // no credits
        return;
      }
      if (data.result) {
        onUpdate(slot.id, { status: "generated", result: data.result });
        if (typeof data.creditsRemaining === "number") onCreditsChange(data.creditsRemaining);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    await fetch(`/api/calendar/${slot.id}`, { method: "DELETE" });
    onDelete(slot.id);
  }

  async function handleSaveContext() {
    await fetch(`/api/calendar/${slot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: contextValue }),
    });
    onUpdate(slot.id, { context: contextValue });
    setEditingContext(false);
  }

  async function handleCopy() {
    if (slot.result) {
      await navigator.clipboard.writeText(slot.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleGenerateImage() {
    if (!slot.result) return;
    setGeneratingImage(true);
    setImageUrl(null);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: slot.result, contentType: slot.content_type, format: imageFormat }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        if (typeof data.creditsRemaining === "number") onCreditsChange(data.creditsRemaining);
      }
    } finally {
      setGeneratingImage(false);
    }
  }

  return (
    <div
      style={{
        border: `1.5px solid ${borderColor}`,
        background: bgColor,
        borderRadius: "10px",
        padding: "10px",
        fontFamily: "var(--font-geist-sans)",
        fontSize: "12px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "4px", marginBottom: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "14px" }}>{icon}</span>
          <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.85)", fontSize: "11px", lineHeight: 1.3 }}>
            {slot.content_type}
          </span>
        </div>
        <button
          onClick={handleDelete}
          style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.2)",
            cursor: "pointer", fontSize: "15px", lineHeight: 1, padding: "0 2px", flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Objective badge */}
      <div style={{ marginBottom: "8px" }}>
        <span
          style={{
            fontSize: "10px", fontWeight: 700, padding: "2px 7px",
            borderRadius: "20px", background: objColor, color: objTextColor,
          }}
        >
          {slot.objective}
        </span>
      </div>

      {/* Context */}
      {editingContext ? (
        <div style={{ marginBottom: "8px" }}>
          <input
            type="text"
            value={contextValue}
            onChange={(e) => setContextValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSaveContext(); if (e.key === "Escape") setEditingContext(false); }}
            autoFocus
            style={{
              width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(86,219,132,0.3)",
              borderRadius: "6px", padding: "5px 8px", color: "white", fontSize: "11px",
              fontFamily: "var(--font-geist-sans)", outline: "none", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
            <button onClick={handleSaveContext} style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "5px", background: "rgba(86,219,132,0.15)", border: "1px solid rgba(86,219,132,0.3)", color: "#56db84", cursor: "pointer" }}>
              Salvează
            </button>
            <button onClick={() => setEditingContext(false)} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "5px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
              Anulează
            </button>
          </div>
        </div>
      ) : (
        <p
          style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", lineHeight: 1.4, marginBottom: "8px", cursor: "pointer" }}
          onClick={() => setEditingContext(true)}
          title="Click pentru a edita"
        >
          {slot.context || <span style={{ color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>Fără context — click pentru a adăuga</span>}
        </p>
      )}

      {/* Generated content */}
      {slot.status === "generated" && slot.result && (
        <div
          style={{
            background: "rgba(0,0,0,0.2)", borderRadius: "6px", padding: "8px",
            marginBottom: "8px", maxHeight: "120px", overflowY: "auto",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", lineHeight: 1.5 }}>
            <ReactMarkdown>{slot.result.slice(0, 300) + (slot.result.length > 300 ? "…" : "")}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Image generation — visible only after text is generated */}
      {slot.status === "generated" && slot.result && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>
              🎨 Imagine
            </span>
            <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "20px", background: "rgba(99,102,241,0.15)", color: "#818cf8", fontWeight: 700 }}>
              2 credite
            </span>
          </div>

          {/* Format selector */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
            {IMAGE_FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setImageFormat(f.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
                  padding: "4px 6px", borderRadius: "5px", cursor: "pointer",
                  background: imageFormat === f.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${imageFormat === f.id ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div style={{
                  width: `${f.w}px`, height: `${f.h}px`,
                  border: `1.5px solid ${imageFormat === f.id ? "#818cf8" : "rgba(255,255,255,0.25)"}`,
                  borderRadius: "2px",
                }} />
                <span style={{ fontSize: "9px", color: imageFormat === f.id ? "#818cf8" : "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                  {f.label}
                </span>
              </button>
            ))}

            <button
              onClick={handleGenerateImage}
              disabled={generatingImage}
              style={{
                flex: 1, fontSize: "10px", fontWeight: 700, padding: "4px 6px", borderRadius: "5px",
                background: generatingImage ? "rgba(99,102,241,0.1)" : "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(168,85,247,0.2))",
                border: "1px solid rgba(99,102,241,0.35)",
                color: generatingImage ? "rgba(129,140,248,0.4)" : "#818cf8",
                cursor: generatingImage ? "not-allowed" : "pointer",
              }}
            >
              {generatingImage ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                  <svg className="animate-spin" width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="4" stroke="rgba(129,140,248,0.3)" strokeWidth="2"/>
                    <path d="M6 2a4 4 0 0 1 4 4" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Generez...
                </span>
              ) : "⚡ Generează"}
            </button>
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div style={{ position: "relative", borderRadius: "6px", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Generated" style={{ width: "100%", borderRadius: "6px", display: "block" }} />
              <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                <a
                  href={imageUrl}
                  download="imagine-post.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, textAlign: "center", fontSize: "10px", fontWeight: 700,
                    padding: "4px 8px", borderRadius: "5px", textDecoration: "none",
                    background: "rgba(86,219,132,0.12)", border: "1px solid rgba(86,219,132,0.25)", color: "#56db84",
                  }}
                >
                  ↓ Descarcă
                </a>
                <button
                  onClick={handleGenerateImage}
                  disabled={generatingImage}
                  style={{
                    fontSize: "10px", padding: "4px 8px", borderRadius: "5px",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.3)", cursor: "pointer",
                  }}
                >
                  ↺
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {slot.status === "suggested" && (
          <button
            onClick={handleApprove}
            style={{
              fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "5px",
              background: "rgba(86,219,132,0.1)", border: "1px solid rgba(86,219,132,0.25)",
              color: "#56db84", cursor: "pointer",
            }}
          >
            ✓ Aprobă
          </button>
        )}

        {slot.status !== "generated" && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "5px",
              background: generating ? "rgba(86,219,132,0.1)" : "linear-gradient(135deg,rgba(86,219,132,0.2),rgba(129,140,248,0.15))",
              border: "1px solid rgba(86,219,132,0.3)",
              color: generating ? "rgba(86,219,132,0.5)" : "#56db84",
              cursor: generating ? "not-allowed" : "pointer",
            }}
          >
            {generating ? (
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg className="animate-spin" width="9" height="9" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4" stroke="rgba(86,219,132,0.3)" strokeWidth="2"/>
                  <path d="M6 2a4 4 0 0 1 4 4" stroke="#56db84" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Generez...
              </span>
            ) : "⚡ Generează"}
          </button>
        )}

        {slot.status === "generated" && (
          <>
            <button
              onClick={handleCopy}
              style={{
                fontSize: "10px", fontWeight: 700, padding: "4px 8px", borderRadius: "5px",
                background: copied ? "rgba(86,219,132,0.15)" : "rgba(255,255,255,0.06)",
                border: `1px solid ${copied ? "rgba(86,219,132,0.3)" : "rgba(255,255,255,0.1)"}`,
                color: copied ? "#56db84" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              {copied ? "✓ Copiat" : "📋 Copiază"}
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              style={{
                fontSize: "10px", padding: "4px 8px", borderRadius: "5px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.3)", cursor: generating ? "not-allowed" : "pointer",
              }}
            >
              {generating ? "..." : "↺"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
