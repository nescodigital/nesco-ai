"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaMeta } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import CalendarSlotCard, { CalendarSlot } from "./CalendarSlotCard";

const DAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const MONTHS_RO = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

const PLATFORMS = [
  { id: "Post Facebook", label: "Facebook", icon: <FaFacebook size={14} />, color: "rgba(255,255,255,0.7)" },
  { id: "Post Instagram", label: "Instagram", icon: <FaInstagram size={14} />, color: "rgba(255,255,255,0.7)" },
  { id: "Post LinkedIn", label: "LinkedIn", icon: <FaLinkedin size={14} />, color: "rgba(255,255,255,0.7)" },
  { id: "Email newsletter", label: "Email", icon: <MdEmail size={14} />, color: "rgba(255,255,255,0.7)" },
  { id: "Reclamă Meta Ads", label: "Meta Ads", icon: <FaMeta size={14} />, color: "rgba(255,255,255,0.7)" },
] as const;

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateToISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

interface Props {
  onCreditsChange: (n: number) => void;
}

export default function CalendarView({ onCreditsChange }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [revealingSlots, setRevealingSlots] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Drag & drop state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const dragSlotRef = useRef<CalendarSlot | null>(null);

  const [selectedPlatform, setSelectedPlatform] = useState<string>(PLATFORMS[0].id);
  const [postCount, setPostCount] = useState(3);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = addDays(getMonday(today), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);

  const weekLabel = (() => {
    const s = weekStart;
    const e = weekEnd;
    if (s.getMonth() === e.getMonth()) {
      return `${s.getDate()}–${e.getDate()} ${MONTHS_RO[s.getMonth()]} ${s.getFullYear()}`;
    }
    return `${s.getDate()} ${MONTHS_RO[s.getMonth()]} – ${e.getDate()} ${MONTHS_RO[e.getMonth()]} ${e.getFullYear()}`;
  })();

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?startDate=${dateToISO(weekStart)}&endDate=${dateToISO(weekEnd)}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  useEffect(() => {
    fetchSlots();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  async function handleGeneratePlan() {
    setGeneratingPlan(true);
    setRevealingSlots(false);
    setRevealedIds(new Set());
    setEmailSent(false);
    try {
      const res = await fetch("/api/calendar/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regenerate: true,
          platform: selectedPlatform,
          count: postCount,
          weekStart: dateToISO(weekStart),
          weekEnd: dateToISO(weekEnd),
        }),
      });
      const data = await res.json();
      if (data.slots) {
        setGeneratingPlan(false);
        setRevealingSlots(true);

        const res2 = await fetch(`/api/calendar?startDate=${dateToISO(weekStart)}&endDate=${dateToISO(weekEnd)}`);
        const data2 = await res2.json();
        const newSlots: CalendarSlot[] = data2.slots ?? [];
        setSlots(newSlots);

        const newIds = newSlots.map((s) => s.id);
        for (let i = 0; i < newIds.length; i++) {
          await new Promise((r) => setTimeout(r, 180));
          setRevealedIds((prev) => new Set([...prev, newIds[i]]));
        }
        setRevealingSlots(false);
      }
    } finally {
      setGeneratingPlan(false);
    }
  }

  function handleUpdate(id: string, updates: Partial<CalendarSlot>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  function handleDelete(id: string) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────
  function handleDragStart(slot: CalendarSlot) {
    setDraggingId(slot.id);
    dragSlotRef.current = slot;
  }

  function handleDragOver(e: React.DragEvent, iso: string) {
    e.preventDefault();
    setDragOverDate(iso);
  }

  async function handleDrop(iso: string) {
    const slot = dragSlotRef.current;
    if (!slot || slot.scheduled_date === iso) {
      setDraggingId(null);
      setDragOverDate(null);
      return;
    }
    setSlots((prev) => prev.map((s) => s.id === slot.id ? { ...s, scheduled_date: iso } : s));
    setDraggingId(null);
    setDragOverDate(null);
    dragSlotRef.current = null;

    await fetch(`/api/calendar/${slot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduled_date: iso }),
    });
  }

  // ── Send full plan via email ───────────────────────────────────────────────
  async function handleSendPlanEmail() {
    const generatedSlots = slots.filter((s) => s.status === "generated" && s.result);
    if (generatedSlots.length === 0) return;
    setSendingEmail(true);
    try {
      await fetch("/api/calendar/send-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slots: generatedSlots.map((s) => ({
            date: s.scheduled_date,
            contentType: s.content_type,
            objective: s.objective,
            result: s.result,
          })),
          weekLabel,
        }),
      });
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } finally {
      setSendingEmail(false);
    }
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const iso = dateToISO(d);
    const daySlots = slots.filter((s) => s.scheduled_date === iso);
    const isToday = iso === dateToISO(today);
    const isPast = d < today;
    return { date: d, iso, daySlots, isToday, isPast };
  });

  const hasSlots = slots.length > 0;
  const generatedSlots = slots.filter((s) => s.status === "generated" && s.result);
  const platformInfo = PLATFORMS.find((p) => p.id === selectedPlatform)!;

  return (
    <div style={{ fontFamily: "var(--font-geist-sans)", width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Calendar editorial</h1>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", margin: 0 }}>Alege platforma, numărul de posturi și lasă AI-ul să construiască planul.</p>
      </div>

      {/* Platform selector */}
      <div style={{ marginBottom: "14px", width: "100%" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
          Platformă
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", width: "100%" }}>
          {PLATFORMS.map((p) => {
            const active = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "7px 13px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                  background: active ? "rgba(86,219,132,0.12)" : "rgba(255,255,255,0.03)",
                  border: active ? "1px solid rgba(86,219,132,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  color: active ? "#56db84" : "rgba(255,255,255,0.5)",
                }}
              >
                <span style={{ color: p.color, display: "flex", alignItems: "center" }}>{p.icon}</span>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Post count */}
      <div style={{ marginBottom: "18px", width: "100%" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
          Posturi săptămâna aceasta
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => {
            const active = postCount === n;
            return (
              <button
                key={n}
                onClick={() => setPostCount(n)}
                style={{
                  width: "36px", height: "36px", borderRadius: "8px", fontSize: "14px", fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                  background: active ? "linear-gradient(135deg,rgba(86,219,132,0.2),rgba(129,140,248,0.15))" : "rgba(255,255,255,0.03)",
                  border: active ? "1px solid rgba(86,219,132,0.5)" : "1px solid rgba(255,255,255,0.07)",
                  color: active ? "#56db84" : "rgba(255,255,255,0.4)",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", margin: "6px 0 0" }}>
          {postCount} {postCount === 1 ? "post" : "posturi"} × 1 credit/generare = până la {postCount} credite consumate
        </p>
      </div>

      {/* Week nav row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "8px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "6px 10px", flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "16px", padding: "0 4px", lineHeight: 1, flexShrink: 0 }}
          >
            ←
          </button>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, textAlign: "center", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "16px", padding: "0 4px", lineHeight: 1, flexShrink: 0 }}
          >
            →
          </button>
        </div>
      </div>

      {/* Actions row */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", width: "100%", flexWrap: "wrap" }}>
        <button
          onClick={handleGeneratePlan}
          disabled={generatingPlan || revealingSlots}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
            flex: 1, minWidth: 0,
            background: generatingPlan || revealingSlots ? "rgba(86,219,132,0.06)" : "linear-gradient(135deg,rgba(86,219,132,0.22),rgba(129,140,248,0.18))",
            border: "1px solid rgba(86,219,132,0.35)",
            color: generatingPlan || revealingSlots ? "rgba(86,219,132,0.4)" : "#56db84",
            cursor: generatingPlan || revealingSlots ? "not-allowed" : "pointer",
          }}
        >
          {generatingPlan ? (
            <>
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" stroke="rgba(86,219,132,0.2)" strokeWidth="2"/>
                <path d="M6 2a4 4 0 0 1 4 4" stroke="#56db84" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              AI construiește planul…
            </>
          ) : hasSlots ? (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              Regenerează
              <span style={{ color: platformInfo.color, display: "flex", alignItems: "center" }}>{platformInfo.icon}</span>
              {platformInfo.label}
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              Generează {postCount} {postCount === 1 ? "post" : "posturi"}
              <span style={{ color: platformInfo.color, display: "flex", alignItems: "center" }}>{platformInfo.icon}</span>
              {platformInfo.label}
            </span>
          )}
        </button>

        {generatedSlots.length > 0 && (
          <button
            onClick={handleSendPlanEmail}
            disabled={sendingEmail}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "9px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
              flex: 1, minWidth: 0,
              background: emailSent ? "rgba(86,219,132,0.1)" : "rgba(255,255,255,0.04)",
              border: emailSent ? "1px solid rgba(86,219,132,0.35)" : "1px solid rgba(255,255,255,0.1)",
              color: emailSent ? "#56db84" : "rgba(255,255,255,0.5)",
              cursor: sendingEmail ? "not-allowed" : "pointer",
            }}
          >
            {sendingEmail ? (
              <>
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                  <path d="M6 2a4 4 0 0 1 4 4" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Se trimite...
              </>
            ) : emailSent ? "Trimis pe email" : `Trimite planul (${generatedSlots.length})`}
          </button>
        )}
      </div>

      {/* Calendar — vertical rows */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
            <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="#56db84" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      ) : !hasSlots && !generatingPlan ? (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "16px",
        }}>
          <div style={{ fontSize: "36px", marginBottom: "12px", color: platformInfo.color, display: "flex", justifyContent: "center" }}>
            <span style={{ display: "flex" }}>{platformInfo.icon}</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
            Nicio propunere pentru {platformInfo.label} săptămâna asta
          </p>
          <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
            Apasă „Generează" pentru a construi planul editorial.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {days.map(({ date, iso, daySlots, isToday, isPast }) => {
            const isDragTarget = dragOverDate === iso;
            return (
              <div
                key={iso}
                onDragOver={(e) => handleDragOver(e, iso)}
                onDragLeave={() => setDragOverDate(null)}
                onDrop={() => handleDrop(iso)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr",
                  gap: "12px",
                  alignItems: "flex-start",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  background: isDragTarget
                    ? "rgba(86,219,132,0.05)"
                    : isToday ? "rgba(255,255,255,0.015)" : "transparent",
                  border: isDragTarget
                    ? "1.5px dashed rgba(86,219,132,0.35)"
                    : isToday ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {/* Day label */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "3px" }}>
                  <div
                    style={{
                      width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: isToday ? 800 : 600,
                      background: isToday ? "linear-gradient(135deg,#56db84,#818cf8)" : "transparent",
                      color: isToday ? "#000" : isPast ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {date.getDate()}
                  </div>
                  <span style={{
                    fontSize: "12px", fontWeight: 700, letterSpacing: "0.04em",
                    color: isToday ? "#56db84" : isPast ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.45)",
                  }}>
                    {DAYS_RO[(date.getDay() + 6) % 7]}
                  </span>
                </div>

                {/* Slots column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", minHeight: "36px" }}>
                  {daySlots.map((slot) => {
                    const hiding = revealingSlots && !revealedIds.has(slot.id);
                    return (
                      <div
                        key={slot.id}
                        draggable
                        onDragStart={() => handleDragStart(slot)}
                        onDragEnd={() => { setDraggingId(null); setDragOverDate(null); }}
                        style={{
                          opacity: draggingId === slot.id ? 0.35 : hiding ? 0 : 1,
                          transform: hiding ? "translateX(-10px)" : "translateX(0)",
                          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
                          cursor: "grab",
                        }}
                      >
                        <CalendarSlotCard
                          slot={slot}
                          onUpdate={handleUpdate}
                          onDelete={handleDelete}
                          onCreditsChange={onCreditsChange}
                        />
                      </div>
                    );
                  })}

                  {daySlots.length === 0 && (
                    <div style={{
                      height: "30px", borderRadius: "6px",
                      border: isDragTarget ? "1.5px dashed rgba(86,219,132,0.3)" : "1px dashed rgba(255,255,255,0.04)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}>
                      {isDragTarget && (
                        <span style={{ fontSize: "11px", color: "rgba(86,219,132,0.5)" }}>Mută aici</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", paddingLeft: "8px", flexWrap: "wrap", alignItems: "center" }}>
            {[
              { color: "rgba(251,146,60,0.5)", label: "Sugestie" },
              { color: "rgba(86,219,132,0.4)", label: "Aprobat" },
              { color: "rgba(86,219,132,0.9)", label: "Generat" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "3px", border: `1.5px solid ${color}` }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
            ))}
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.18)", marginLeft: "auto" }}>
              ↕ Trage cardurile pentru a le muta
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
