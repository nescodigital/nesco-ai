"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Suggestion {
  message: string;
  contentType: string;
  objective: string;
  context: string;
}

interface Props {
  onApply: (s: { contentType: string; objective: string; context: string }) => void;
  brandId?: number;
}

const CACHE_TTL = 24 * 60 * 60 * 1000;

export default function StrategistCard({ onApply, brandId = 1 }: Props) {
  const t = useTranslations("strategist");
  const cacheKey = `strategist_suggestion_${brandId}`;
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setSuggestion(null);
    setLoading(true);
    setDismissed(false);
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          setSuggestion(data);
          setLoading(false);
          return;
        }
      }
    } catch {}

    fetch(`/api/suggest?brandId=${brandId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.message) {
          setSuggestion(data);
          localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [brandId, cacheKey]);

  if (loading || !suggestion || dismissed) return null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(86,219,132,0.06), rgba(129,140,248,0.04))",
        border: "1px solid rgba(86,219,132,0.2)",
        borderRadius: "14px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#56db84",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "6px",
          }}
        >
          {t("title")}
        </p>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5, margin: 0 }}>
          {suggestion.message}
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button
          onClick={() =>
            onApply({
              contentType: suggestion.contentType,
              objective: suggestion.objective,
              context: suggestion.context,
            })
          }
          style={{
            background: "linear-gradient(135deg,#56db84,#818cf8)",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          {t("generateNow")}
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            cursor: "pointer",
            fontSize: "20px",
            padding: "4px 8px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
