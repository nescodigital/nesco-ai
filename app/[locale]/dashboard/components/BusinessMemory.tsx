"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface BusinessUpdate {
  id: string;
  text: string;
  created_at: string;
}

interface Suggestion {
  contentType: string;
  context: string;
}

interface Props {
  onSuggestionClick: (contentType: string, context: string) => void;
  onUpdatesChange: (updates: string[]) => void;
}

const REMINDER_DISMISS_KEY = "nesco_reminder_dismissed";

function getSuggestions(updates: BusinessUpdate[]): Suggestion[] {
  const result: Suggestion[] = [];
  for (const u of updates.slice(0, 3)) {
    const lower = u.text.toLowerCase();
    if (lower.includes("promo") || lower.includes("reduc") || lower.includes("%") || lower.includes("ofert")) {
      result.push({ contentType: "Reclamă Meta Ads", context: u.text });
      result.push({ contentType: "Post Facebook", context: u.text });
    } else if (lower.includes("lans") || lower.includes("nou") || lower.includes("adaug") || lower.includes("introduce")) {
      result.push({ contentType: "Post Facebook", context: u.text });
      result.push({ contentType: "Email newsletter", context: u.text });
    } else {
      result.push({ contentType: "Post Facebook", context: u.text });
      result.push({ contentType: "Post Instagram", context: u.text });
    }
  }
  return result.slice(0, 4);
}

export default function BusinessMemory({ onSuggestionClick, onUpdatesChange }: Props) {
  const t = useTranslations("memory");
  const [updates, setUpdates] = useState<BusinessUpdate[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [adding, setAdding] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/business-updates")
      .then((r) => r.json())
      .then(({ updates: data }) => {
        const list: BusinessUpdate[] = data ?? [];
        setUpdates(list);
        onUpdatesChange(list.map((u) => u.text));
        setLoaded(true);

        // Show weekly reminder: no updates OR oldest update > 7 days
        const dismissed = sessionStorage.getItem(REMINDER_DISMISS_KEY);
        if (!dismissed) {
          if (list.length === 0) {
            setShowReminder(true);
          } else {
            const newest = new Date(list[0].created_at);
            const daysSince = (Date.now() - newest.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince > 7) setShowReminder(true);
          }
        }
      })
      .catch(() => setLoaded(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    if (!newText.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/business-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText.trim() }),
      });
      const { update } = await res.json();
      if (update) {
        const next = [update, ...updates];
        setUpdates(next);
        onUpdatesChange(next.map((u) => u.text));
        setNewText("");
        setShowAdd(false);
        setShowReminder(false);
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleArchive(id: string) {
    await fetch("/api/business-updates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const next = updates.filter((u) => u.id !== id);
    setUpdates(next);
    onUpdatesChange(next.map((u) => u.text));
  }

  function dismissReminder() {
    sessionStorage.setItem(REMINDER_DISMISS_KEY, "1");
    setShowReminder(false);
  }

  const suggestions = getSuggestions(updates);

  if (!loaded) return null;

  return (
    <div className="mb-4">
      {/* Weekly reminder banner */}
      {showReminder && (
        <div
          className="rounded-xl px-4 py-3 mb-3 flex items-center gap-3"
          style={{
            background: "rgba(129,140,248,0.06)",
            border: "1px solid rgba(129,140,248,0.2)",
          }}
        >
          <span style={{ fontSize: "16px" }}>💬</span>
          <p className="text-[13px] text-white/60 flex-1" style={{ fontFamily: "var(--font-geist-sans)" }}>
            {t("reminder")}
          </p>
          <button
            onClick={() => { setShowAdd(true); setShowReminder(false); }}
            className="text-[12px] font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: "rgba(129,140,248,0.15)",
              border: "1px solid rgba(129,140,248,0.3)",
              color: "#818cf8",
              fontFamily: "var(--font-geist-sans)",
              whiteSpace: "nowrap",
            }}
          >
            {t("add")}
          </button>
          <button
            onClick={dismissReminder}
            style={{ color: "rgba(255,255,255,0.2)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "0 2px", flexShrink: 0 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Main card */}
      <div
        className="rounded-2xl p-4"
        style={{
          border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "13px" }}>📌</span>
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {t("title")}
            </span>
            {updates.length > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}
              >
                {updates.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAdd((s) => !s)}
            className="text-[12px] font-semibold transition-all duration-150 px-3 py-1.5 rounded-lg"
            style={{
              background: showAdd ? "rgba(86,219,132,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${showAdd ? "rgba(86,219,132,0.3)" : "rgba(255,255,255,0.08)"}`,
              color: showAdd ? "#56db84" : "rgba(255,255,255,0.4)",
            }}
          >
            {showAdd ? t("cancel") : t("addUpdate")}
          </button>
        </div>

        {/* Updates list */}
        {updates.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {updates.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px]"
                style={{
                  background: "rgba(129,140,248,0.08)",
                  border: "1px solid rgba(129,140,248,0.15)",
                  color: "rgba(255,255,255,0.65)",
                  maxWidth: "100%",
                }}
              >
                <span className="truncate" style={{ maxWidth: "220px" }}>{u.text}</span>
                <button
                  onClick={() => handleArchive(u.id)}
                  style={{
                    color: "rgba(255,255,255,0.2)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    lineHeight: 1,
                    padding: "0 1px",
                    flexShrink: 0,
                  }}
                  title={t("archive")}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {updates.length === 0 && !showAdd && (
          <p className="text-[12px] mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>
            {t("noUpdates")}
          </p>
        )}

        {/* Quick-add input */}
        {showAdd && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={t("placeholder")}
              autoFocus
              className="flex-1 rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 outline-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1.5px solid rgba(86,219,132,0.3)",
                fontFamily: "var(--font-geist-sans)",
                boxShadow: "0 0 0 3px rgba(86,219,132,0.05)",
              }}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newText.trim()}
              className="px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg,#56db84,#818cf8)",
                color: "#000",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-geist-sans)",
              }}
            >
              {adding ? "..." : t("addBtn")}
            </button>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-2"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              {t("ideasLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick(s.contentType, s.context)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-150 active:scale-95 text-left"
                  style={{
                    background: "rgba(86,219,132,0.05)",
                    border: "1px solid rgba(86,219,132,0.15)",
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "var(--font-geist-sans)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(86,219,132,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(86,219,132,0.15)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  <span style={{ color: "#56db84", fontSize: "10px" }}>→</span>
                  <span className="font-semibold" style={{ color: "rgba(86,219,132,0.8)" }}>{s.contentType}</span>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
                  <span className="truncate" style={{ maxWidth: "160px" }}>{s.context}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
