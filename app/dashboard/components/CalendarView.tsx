"use client";

import { useState, useEffect, useCallback } from "react";
import CalendarSlotCard, { CalendarSlot } from "./CalendarSlotCard";

const DAYS_RO = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
const MONTHS_RO = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
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
  credits: number | null;
  onCreditsChange: (n: number) => void;
}

export default function CalendarView({ credits, onCreditsChange }: Props) {
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [hasPlan, setHasPlan] = useState<boolean | null>(null); // null = not checked yet

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
      // Fetch 2 weeks when on week 0 (for auto-plan covering today + 13 days)
      const fetchStart = weekOffset === 0 ? dateToISO(today) : dateToISO(weekStart);
      const fetchEnd = dateToISO(weekEnd);

      const res = await fetch(`/api/calendar?startDate=${dateToISO(weekStart)}&endDate=${fetchEnd}`);
      const data = await res.json();
      const fetched: CalendarSlot[] = data.slots ?? [];
      setSlots(fetched);

      // Check if ANY plan exists (for auto-generate logic)
      if (hasPlan === null) {
        const checkRes = await fetch(`/api/calendar?startDate=${fetchStart}&endDate=${dateToISO(addDays(today, 13))}`);
        const checkData = await checkRes.json();
        const anySlots = (checkData.slots ?? []).length > 0;
        setHasPlan(anySlots);
        if (!anySlots) {
          // Auto-generate plan on first load
          await generatePlan(false);
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  useEffect(() => {
    fetchSlots();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset]);

  async function generatePlan(regenerate: boolean) {
    setGeneratingPlan(true);
    try {
      const res = await fetch("/api/calendar/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate }),
      });
      const data = await res.json();
      if (data.slots) {
        setHasPlan(true);
        // Re-fetch current week view
        const res2 = await fetch(`/api/calendar?startDate=${dateToISO(weekStart)}&endDate=${dateToISO(weekEnd)}`);
        const data2 = await res2.json();
        setSlots(data2.slots ?? []);
      }
    } finally {
      setGeneratingPlan(false);
      setLoading(false);
    }
  }

  function handleUpdate(id: string, updates: Partial<CalendarSlot>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }

  function handleDelete(id: string) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  // Build 7-day grid for current week
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    const iso = dateToISO(d);
    const daySlots = slots.filter((s) => s.scheduled_date === iso);
    const isToday = iso === dateToISO(today);
    const isPast = d < today;
    return { date: d, iso, daySlots, isToday, isPast };
  });

  return (
    <div style={{ fontFamily: "var(--font-geist-sans)" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-white mb-1">Calendar editorial</h1>
          <p className="text-[14px] text-white/40">Plan săptămânal generat de AI, personalizat pentru brandul tău.</p>
        </div>
        {credits !== null && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            background: "#111113", border: "1px solid rgba(86,219,132,0.25)",
            borderRadius: "10px", padding: "8px 14px", flexShrink: 0,
          }}>
            <span style={{ color: "#56db84", fontSize: "18px", fontWeight: 800 }}>{credits}</span>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>credite</span>
          </div>
        )}
      </div>

      {/* Week navigation + regenerate */}
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
          onClick={() => generatePlan(true)}
          disabled={generatingPlan}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
            color: generatingPlan ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.45)",
            cursor: generatingPlan ? "not-allowed" : "pointer",
          }}
        >
          {generatingPlan ? (
            <>
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="4" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                <path d="M6 2a4 4 0 0 1 4 4" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Se generează...
            </>
          ) : (
            <>↺ Regenerează planul</>
          )}
        </button>
      </div>

      {/* Calendar grid */}
      {loading || generatingPlan ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.1)" strokeWidth="2"/>
              <path d="M12 3a9 9 0 0 1 9 9" stroke="#56db84" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
              {generatingPlan ? "AI-ul construiește planul tău editorial…" : "Se încarcă…"}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "6px" }}>
            {days.map(({ date, isToday, isPast }) => (
              <div
                key={dateToISO(date)}
                style={{ textAlign: "center", padding: "6px 4px" }}
              >
                <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                  {DAYS_RO[(date.getDay() + 6) % 7]}
                </div>
                <div
                  style={{
                    width: "28px", height: "28px", borderRadius: "50%", margin: "0 auto",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: isToday ? 800 : 500,
                    background: isToday ? "linear-gradient(135deg,#56db84,#818cf8)" : "transparent",
                    color: isToday ? "#000" : isPast ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
                  }}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Slot cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
            {days.map(({ iso, daySlots, isPast }) => (
              <div key={iso} style={{ minHeight: "80px" }}>
                {daySlots.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {daySlots.map((slot) => (
                      <CalendarSlotCard
                        key={slot.id}
                        slot={slot}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onCreditsChange={onCreditsChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      height: "100%", minHeight: "60px", borderRadius: "8px",
                      border: "1px dashed rgba(255,255,255,0.05)",
                      background: isPast ? "transparent" : "rgba(255,255,255,0.01)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
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
    </div>
  );
}
