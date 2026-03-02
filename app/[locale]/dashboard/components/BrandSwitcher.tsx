"use client";

import { useState } from "react";

interface Brand {
  brand_id: number;
  label: string;
}

interface Props {
  brands: Brand[];
  activeBrandId: number;
  onSwitch: (brandId: number) => void;
  onAddBrand: () => void;
  maxBrands?: number;
}

export default function BrandSwitcher({ brands, activeBrandId, onSwitch, onAddBrand, maxBrands = 5 }: Props) {
  const [open, setOpen] = useState(false);
  const activeBrand = brands.find((b) => b.brand_id === activeBrandId);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
          fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.8)",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <span style={{ fontSize: "10px", color: "#a78bfa", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>Brand</span>
        <span>{activeBrand?.label || `Brand ${activeBrandId}`}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 3.5l3 3 3-3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
            background: "#18181b", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px", minWidth: "160px", overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}>
            {brands.map((b) => (
              <button
                key={b.brand_id}
                onClick={() => { onSwitch(b.brand_id); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  width: "100%", padding: "10px 14px", fontSize: "13px",
                  fontWeight: b.brand_id === activeBrandId ? 700 : 500,
                  color: b.brand_id === activeBrandId ? "#a78bfa" : "rgba(255,255,255,0.7)",
                  background: b.brand_id === activeBrandId ? "rgba(167,139,250,0.08)" : "transparent",
                  border: "none", cursor: "pointer", textAlign: "left",
                  fontFamily: "var(--font-geist-sans)",
                }}
              >
                {b.brand_id === activeBrandId && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <circle cx="4" cy="4" r="4" fill="#a78bfa" />
                  </svg>
                )}
                {b.label || `Brand ${b.brand_id}`}
              </button>
            ))}

            {brands.length < maxBrands && (
              <>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "4px 0" }} />
                <button
                  onClick={() => { onAddBrand(); setOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    width: "100%", padding: "10px 14px", fontSize: "13px", fontWeight: 600,
                    color: "#a78bfa", background: "transparent", border: "none",
                    cursor: "pointer", fontFamily: "var(--font-geist-sans)",
                  }}
                >
                  + Brand nou
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
