"use client";

import { useState, useEffect, useCallback } from "react";
import CalendarSlotCard, { CalendarSlot } from "./CalendarSlotCard";

const DAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const MONTHS_RO = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

const PLATFORMS = [
  { id: "Post Facebook", label: "Facebook", icon: "👍" },
  { id: "Post Instagram", label: "Instagram", icon: "📸" },
  { id: "Post LinkedIn", label: "LinkedIn", icon: "💼" },
  { id: "Email newsletter", label: "Email", icon: "📧" },
  { id: "Reclamă Meta Ads", label: "Meta Ads", icon: "🎯" },
];

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

  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORMS[0].id);
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

        // Slot machine: reveal cards one by one
        const newIds = newSlots.map((s) => s.id);
        for (let i = 0; i < newIds.length; i++) {
          await new Promise((r) => setTimeout(r, 200));
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

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const iso = dateToISO(d);
    const daySlots = slots.filter((s) => s.scheduled_date === iso);
    const isToday = iso === dateToISO(today);
    const isPast = d < today;
    return { date: d, iso, daySlots, isToday, isPast };
  });

  const hasSlots = slots.length > 0;
  const platformInfo = PLATFORMS.find((p) => p.id === selectedPlatform)!;

  return (
    <div style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-white mb-1">Calendar editorial</h1>
        <p className="text-[14px] text-white/40">Alege platforma, numărul de posturi și lasă AI-ul să construiască planul.</p>
      </div>

      {/* Platform selector */}
      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Platformă
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
                <span style={{ fontSize: "15px" }}>{p.icon}</span>
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Post count */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Posturi săptămâna aceasta
        </p>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => {
            const active = postCount === n;
            return (
              <button
                key={n}
                onClick={() => setPostCount(n)}
                style={{
                  width: "36px", height: "36px", borderRadius: "8px", fontSize: "14px", fontWeight: 700,
                  cursor: "pointer", transition: "all 0.15s",
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
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "6px" }}>
          {postCount} {postCount === 1 ? "post" : "posturi"} × 1 credit/generare = până la {postCount} credite consumate
        </p>
      </div>

      {/* Week nav + generate */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "6px 10px" }}>
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "16px", padding: "0 4px", lineHeight: 1 }}
          >
            ←
          </button>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600, minWidth: "200px", textAlign: "center" }}>
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "16px", padding: "0 4px", lineHeight: 1 }}
          >
            →
          </button>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={generatingPlan || revealingSlots}
          style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
            background: generatingPlan || revealingSlots
              ? "rgba(86,219,132,0.06)"
              : "linear-gradient(135deg,rgba(86,219,132,0.22),rgba(129,140,248,0.18))",
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
            <>↺ Regenerează {platformInfo.icon} {platformInfo.label}</>
          ) : (
            <>⚡ Generează {postCount} {postCount === 1 ? "post" : "posturi"} {platformInfo.icon} {platformInfo.label}</>
          )}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
            <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
            <path d="M12 3a9 9 0 0 1 9 9" stroke="#56db84" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      ) : (
        <>
          {!hasSlots && !generatingPlan && (
            <div style={{
              textAlign: "center", padding: "48px 24px",
              border: "1px dashed rgba(255,255,255,0.07)", borderRadius: "16px", marginBottom: "16px",
            }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{platformInfo.icon}</div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>
                Nicio propunere pentru {platformInfo.label} săptămâna asta
              </p>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
                Apasă „Generează" pentru a construi planul editorial.
              </p>
            </div>
          )}

          {hasSlots && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "6px" }}>
                {days.map(({ date, isToday, isPast }) => (
                  <div key={dateToISO(date)} style={{ textAlign: "center", padding: "6px 4px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                      {DAYS_RO[(date.getDay() + 6) % 7]}
                    </div>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%", margin: "0 auto",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: isToday ? 800 : 500,
                      background: isToday ? "linear-gradient(135deg,#56db84,#818cf8)" : "transparent",
                      color: isToday ? "#000" : isPast ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
                    }}>
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
                {days.map(({ iso, daySlots, isPast }) => (
                  <div key={iso} style={{ minHeight: "80px" }}>
                    {daySlots.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {daySlots.map((slot) => {
                          const hiding = revealingSlots && !revealedIds.has(slot.id);
                          return (
                            <div
                              key={slot.id}
                              style={{
                                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
                                transform: hiding ? "rotateY(90deg) scale(0.85)" : "rotateY(0deg) scale(1)",
                                opacity: hiding ? 0 : 1,
                                transformStyle: "preserve-3d",
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
                      </div>
                    ) : (
                      <div style={{
                        height: "100%", minHeight: "60px", borderRadius: "8px",
                        border: "1px dashed rgba(255,255,255,0.05)",
                        background: isPast ? "transparent" : "rgba(255,255,255,0.01)",
                      }} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "20px", flexWrap: "wrap" }}>
                {[
                  { color: "rgba(251,146,60,0.4)", label: "Sugestie" },
                  { color: "rgba(86,219,132,0.3)", label: "Aprobat" },
                  { color: "rgba(86,219,132,0.8)", label: "Generat" },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "3px", border: `1.5px solid ${color}` }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
