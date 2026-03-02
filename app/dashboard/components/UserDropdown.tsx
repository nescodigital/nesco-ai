"use client";

import { useEffect, useRef, useState } from "react";

interface ReferralData {
  code: string;
  referralLink: string;
  totalReferred: number;
  totalRewarded: number;
}

export default function UserDropdown({
  email,
  onClose,
  onSignOut,
}: {
  email: string;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [referral, setReferral] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((data) => { if (data.code) setReferral(data); });
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  async function handleCopy() {
    if (!referral) return;
    await navigator.clipboard.writeText(referral.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      ref={ref}
      style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0,
        width: "280px", borderRadius: "14px", zIndex: 100,
        background: "#111113", border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
        fontFamily: "var(--font-geist-sans)",
      }}
    >
      {/* Email header */}
      <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {email}
        </p>
      </div>

      {/* Referral section */}
      <div style={{ padding: "14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M8 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM3 14a5 5 0 0 1 10 0" stroke="#56db84" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>Invită prieteni</span>
          <span style={{
            fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "20px",
            background: "rgba(86,219,132,0.1)", color: "#56db84", border: "1px solid rgba(86,219,132,0.2)",
          }}>+30 credite fiecare</span>
        </div>

        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 10px", lineHeight: 1.4 }}>
          Tu și prietenul tău primiți câte 30 credite când face primul purchase.
        </p>

        {referral ? (
          <>
            <div style={{
              display: "flex", gap: "6px", alignItems: "center",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px", padding: "6px 10px", marginBottom: "8px",
            }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {referral.referralLink}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  flexShrink: 0, padding: "3px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s",
                  background: copied ? "rgba(86,219,132,0.15)" : "rgba(255,255,255,0.08)",
                  border: `1px solid ${copied ? "rgba(86,219,132,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: copied ? "#56db84" : "rgba(255,255,255,0.6)",
                }}
              >
                {copied ? "Copiat ✓" : "Copiază"}
              </button>
            </div>

            {referral.totalReferred > 0 && (
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                {referral.totalReferred} {referral.totalReferred === 1 ? "invitat" : "invitați"}
                {referral.totalRewarded > 0 && ` · ${referral.totalRewarded} recompensați`}
              </p>
            )}
          </>
        ) : (
          <div style={{ height: "32px", background: "rgba(255,255,255,0.04)", borderRadius: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
        )}
      </div>

      {/* Sign out */}
      <div style={{ padding: "6px" }}>
        <button
          onClick={onSignOut}
          style={{
            width: "100%", padding: "8px 10px", borderRadius: "8px", fontSize: "13px",
            background: "transparent", border: "none", color: "rgba(255,255,255,0.5)",
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
            fontFamily: "var(--font-geist-sans)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
        >
          Ieși din cont
        </button>
      </div>
    </div>
  );
}
