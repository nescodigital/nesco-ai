"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

interface TourStep {
  target: string; // data-tour attribute value
  title: string;
  description: string;
  position: "bottom" | "top" | "left" | "right";
}

export default function ProductTour() {
  const t = useTranslations("productTour");
  const TOUR_STEPS: TourStep[] = [
    { target: "content-type", title: t("step1.title"), description: t("step1.desc"), position: "bottom" },
    { target: "context-field", title: t("step2.title"), description: t("step2.desc"), position: "top" },
    { target: "generate-btn", title: t("step3.title"), description: t("step3.desc"), position: "top" },
  ];
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("brand_profiles")
        .select("data")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          const profile = data?.data as Record<string, unknown> | null;
          if (profile?.tour_done) return; // already seen
          const t = setTimeout(() => setVisible(true), 800);
          return () => clearTimeout(t);
        });
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, step]);

  function updatePosition() {
    const current = TOUR_STEPS[step];
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect(r);

    const TOOLTIP_W = 280;
    const TOOLTIP_H = 140;
    const PADDING = 16;

    let top = 0;
    let left = 0;

    if (current.position === "bottom") {
      top = r.bottom + PADDING;
      left = r.left + r.width / 2 - TOOLTIP_W / 2;
    } else if (current.position === "top") {
      top = r.top - TOOLTIP_H - PADDING;
      left = r.left + r.width / 2 - TOOLTIP_W / 2;
    }

    // clamp to viewport
    left = Math.max(PADDING, Math.min(left, window.innerWidth - TOOLTIP_W - PADDING));
    top = Math.max(PADDING, top);

    setTooltipPos({ top, left });
  }

  function handleNext() {
    if (step < TOUR_STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  async function dismiss() {
    setVisible(false);
    // Save tour_done in brand_profiles.data so it persists across devices
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profileRow } = await supabase
      .from("brand_profiles")
      .select("data")
      .eq("user_id", user.id)
      .single();
    const existing = (profileRow?.data as Record<string, unknown>) ?? {};
    await supabase
      .from("brand_profiles")
      .update({ data: { ...existing, tour_done: true } })
      .eq("user_id", user.id);
  }

  if (!visible || !rect) return null;

  const current = TOUR_STEPS[step];
  const PADDING = 8;

  return (
    <>
      {/* Dark overlay with cutout */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "all",
        }}
        onClick={dismiss}
      >
        {/* SVG mask cutout around target element */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              <rect
                x={rect.left - PADDING}
                y={rect.top - PADDING}
                width={rect.width + PADDING * 2}
                height={rect.height + PADDING * 2}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.72)"
            mask="url(#tour-mask)"
          />
        </svg>

        {/* Pulsing ring around target */}
        <div
          style={{
            position: "absolute",
            left: rect.left - PADDING,
            top: rect.top - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
            borderRadius: "12px",
            border: "2px solid rgba(86,219,132,0.7)",
            boxShadow: "0 0 0 0 rgba(86,219,132,0.4)",
            animation: "tourPulse 1.5s ease-out infinite",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 280,
          zIndex: 9999,
          background: "#111113",
          border: "1px solid rgba(86,219,132,0.3)",
          borderRadius: "14px",
          padding: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(86,219,132,0.08)",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        {/* Arrow indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "linear-gradient(135deg,#56db84,#818cf8)", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#56db84", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Ghid rapid — {step + 1}/{TOUR_STEPS.length}
          </span>
          <button
            onClick={dismiss}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "0 2px" }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "6px", lineHeight: 1.3 }}>
          {current.title}
        </p>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: "14px" }}>
          {current.description}
        </p>

        {/* Progress dots */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "14px" }}>
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: "4px",
                borderRadius: "2px",
                transition: "all 0.25s",
                background: i === step ? "#56db84" : "rgba(255,255,255,0.1)",
                width: i === step ? "20px" : "8px",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={dismiss}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(255,255,255,0.35)",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "var(--font-geist-sans)",
            }}
          >
            Sari peste
          </button>
          <button
            onClick={handleNext}
            style={{
              flex: 2,
              padding: "9px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg,#56db84,#818cf8)",
              color: "#000",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-geist-sans)",
            }}
          >
            {step < TOUR_STEPS.length - 1 ? t("next") : t("done")}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tourPulse {
          0% { box-shadow: 0 0 0 0 rgba(86,219,132,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(86,219,132,0); }
          100% { box-shadow: 0 0 0 0 rgba(86,219,132,0); }
        }
      `}</style>
    </>
  );
}
