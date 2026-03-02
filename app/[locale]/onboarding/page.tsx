"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";
import { useTranslations, useLocale } from "next-intl";

// ── Types ──────────────────────────────────────────────────────────────────
type Answers = Record<string, string | string[] | Record<string, number>>;

interface SliderDef { id: string; left: string; right: string; value: number }
interface Option { v: string; l: string }
interface CardOption { v: string; icon: string; title: string; sub: string }
interface Question {
  id: string;
  label: string;
  type: "chips" | "cards" | "sliders" | "textarea" | "text";
  required?: boolean;
  multi?: boolean;
  maxSelect?: number;
  options?: Option[];
  cardOptions?: CardOption[];
  sliders?: SliderDef[];
  placeholder?: string;
}
interface Step {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  questions: Question[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function isStepValid(step: Step, answers: Answers): boolean {
  return step.questions.filter((q) => q.required).every((q) => {
    const a = answers[q.id];
    if (q.type === "chips" || q.type === "cards")
      return q.multi ? Array.isArray(a) && (a as string[]).length > 0 : !!a;
    if (q.type === "text" || q.type === "textarea")
      return typeof a === "string" && a.trim().length > 0;
    return true;
  });
}

// ── Slider ──────────────────────────────────────────────────────────────────
function ToneSlider({ slider, value, onChange }: { slider: SliderDef; value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const computePct = useCallback((clientX: number) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, [value]);

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onChange(computePct(e.clientX));
  }
  function onPointerMove(e: React.PointerEvent) {
    if (e.buttons === 0 && e.pressure === 0) return;
    onChange(computePct(e.clientX));
  }

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-bold text-white">{slider.left}</span>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}>
          {value < 30 ? slider.left : value > 70 ? slider.right : "—"}
        </span>
        <span className="text-[14px] font-bold text-white">{slider.right}</span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative h-10 flex items-center cursor-pointer touch-none select-none"
      >
        <div className="absolute inset-x-0 h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="absolute left-0 h-[3px] rounded-full transition-[width] duration-75" style={{ width: `${value}%`, background: "linear-gradient(90deg,#818cf8,#56db84)" }} />
        <div
          className="absolute w-6 h-6 rounded-full -translate-x-1/2 transition-[left] duration-75 flex items-center justify-center"
          style={{ left: `${value}%`, background: "linear-gradient(135deg,#818cf8,#56db84)", boxShadow: "0 0 0 3px rgba(86,219,132,0.2), 0 2px 8px rgba(0,0,0,0.4)" }}
        >
          <div className="w-2 h-2 rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}

const STEP_ICONS = ["🏢", "👥", "🎙️", "📱", "💎"];

// ── Main ────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("onboarding");
  const tq = useTranslations("onboarding.questions");

  // Build STEPS inside component using translations
  const STEPS: Step[] = [
    {
      id: "business",
      label: t("steps.business.label"),
      title: t("steps.business.title"),
      subtitle: t("steps.business.subtitle"),
      questions: [
        {
          id: "industry",
          label: tq("industry.label"),
          type: "chips",
          required: true,
          multi: false,
          options: [
            { v: "ecom", l: tq("industry.options.ecom") },
            { v: "services", l: tq("industry.options.services") },
            { v: "coaching", l: tq("industry.options.coaching") },
            { v: "saas", l: tq("industry.options.saas") },
            { v: "horeca", l: tq("industry.options.horeca") },
            { v: "realestate", l: tq("industry.options.realestate") },
            { v: "health", l: tq("industry.options.health") },
            { v: "finance", l: tq("industry.options.finance") },
            { v: "other", l: tq("industry.options.other") },
          ],
        },
        {
          id: "business_size",
          label: tq("business_size.label"),
          type: "chips",
          required: true,
          multi: false,
          options: [
            { v: "solo", l: tq("business_size.options.solo") },
            { v: "2-5", l: tq("business_size.options.2-5") },
            { v: "6-20", l: tq("business_size.options.6-20") },
            { v: "20+", l: tq("business_size.options.20plus") },
          ],
        },
        {
          id: "brand_name",
          label: tq("brand_name.label"),
          type: "text",
          required: true,
          placeholder: tq("brand_name.placeholder"),
        },
      ],
    },
    {
      id: "audience",
      label: t("steps.audience.label"),
      title: t("steps.audience.title"),
      subtitle: t("steps.audience.subtitle"),
      questions: [
        {
          id: "audience_type",
          label: tq("audience_type.label"),
          type: "cards",
          required: true,
          multi: false,
          cardOptions: [
            { v: "b2c", icon: "🤝", title: tq("audience_type.options.b2c.title"), sub: tq("audience_type.options.b2c.sub") },
            { v: "b2b", icon: "🏢", title: tq("audience_type.options.b2b.title"), sub: tq("audience_type.options.b2b.sub") },
            { v: "both", icon: "⚡", title: tq("audience_type.options.both.title"), sub: tq("audience_type.options.both.sub") },
          ],
        },
        {
          id: "audience_age",
          label: tq("audience_age.label"),
          type: "chips",
          required: false,
          multi: true,
          options: [
            { v: "18-24", l: "18–24" },
            { v: "25-34", l: "25–34" },
            { v: "35-44", l: "35–44" },
            { v: "45-54", l: "45–54" },
            { v: "55+", l: "55+" },
          ],
        },
        {
          id: "buying_decision",
          label: tq("buying_decision.label"),
          type: "chips",
          required: true,
          multi: false,
          options: [
            { v: "impulsive", l: tq("buying_decision.options.impulsive") },
            { v: "compare", l: tq("buying_decision.options.compare") },
            { v: "research", l: tq("buying_decision.options.research") },
            { v: "social", l: tq("buying_decision.options.social") },
          ],
        },
      ],
    },
    {
      id: "tone",
      label: t("steps.tone.label"),
      title: t("steps.tone.title"),
      subtitle: t("steps.tone.subtitle"),
      questions: [
        {
          id: "tone_sliders",
          label: tq("tone_sliders.label"),
          type: "sliders",
          required: true,
          sliders: [
            { id: "formal", left: tq("tone_sliders.formal.left"), right: tq("tone_sliders.formal.right"), value: 50 },
            { id: "serious", left: tq("tone_sliders.serious.left"), right: tq("tone_sliders.serious.right"), value: 30 },
            { id: "simple", left: tq("tone_sliders.simple.left"), right: tq("tone_sliders.simple.right"), value: 65 },
            { id: "bold", left: tq("tone_sliders.bold.left"), right: tq("tone_sliders.bold.right"), value: 60 },
          ],
        },
        {
          id: "tone_words",
          label: tq("tone_words.label"),
          type: "chips",
          required: false,
          multi: true,
          maxSelect: 3,
          options: [
            { v: "professional", l: tq("tone_words.options.professional") },
            { v: "trustworthy", l: tq("tone_words.options.trustworthy") },
            { v: "innovative", l: tq("tone_words.options.innovative") },
            { v: "friendly", l: tq("tone_words.options.friendly") },
            { v: "bold", l: tq("tone_words.options.bold") },
            { v: "premium", l: tq("tone_words.options.premium") },
            { v: "accessible", l: tq("tone_words.options.accessible") },
            { v: "expert", l: tq("tone_words.options.expert") },
            { v: "authentic", l: tq("tone_words.options.authentic") },
            { v: "dynamic", l: tq("tone_words.options.dynamic") },
            { v: "calm", l: tq("tone_words.options.calm") },
            { v: "passionate", l: tq("tone_words.options.passionate") },
          ],
        },
        {
          id: "avoid",
          label: tq("avoid.label"),
          type: "textarea",
          required: false,
          placeholder: tq("avoid.placeholder"),
        },
      ],
    },
    {
      id: "content",
      label: t("steps.content.label"),
      title: t("steps.content.title"),
      subtitle: t("steps.content.subtitle"),
      questions: [
        {
          id: "channels",
          label: tq("channels.label"),
          type: "chips",
          required: true,
          multi: true,
          options: [
            { v: "facebook", l: tq("channels.options.facebook") },
            { v: "instagram", l: tq("channels.options.instagram") },
            { v: "linkedin", l: tq("channels.options.linkedin") },
            { v: "tiktok", l: tq("channels.options.tiktok") },
            { v: "email", l: tq("channels.options.email") },
            { v: "blog", l: tq("channels.options.blog") },
            { v: "whatsapp", l: tq("channels.options.whatsapp") },
            { v: "google", l: tq("channels.options.google") },
            { v: "meta", l: tq("channels.options.meta") },
          ],
        },
        {
          id: "content_types",
          label: tq("content_types.label"),
          type: "chips",
          required: true,
          multi: true,
          options: [
            { v: "posts", l: tq("content_types.options.posts") },
            { v: "ads", l: tq("content_types.options.ads") },
            { v: "emails", l: tq("content_types.options.emails") },
            { v: "captions", l: tq("content_types.options.captions") },
            { v: "stories", l: tq("content_types.options.stories") },
            { v: "offers", l: tq("content_types.options.offers") },
            { v: "blogs", l: tq("content_types.options.blogs") },
            { v: "scripts", l: tq("content_types.options.scripts") },
          ],
        },
        {
          id: "frequency",
          label: tq("frequency.label"),
          type: "chips",
          required: false,
          multi: false,
          options: [
            { v: "daily", l: tq("frequency.options.daily") },
            { v: "2-3week", l: tq("frequency.options.2-3week") },
            { v: "weekly", l: tq("frequency.options.weekly") },
            { v: "monthly", l: tq("frequency.options.monthly") },
          ],
        },
      ],
    },
    {
      id: "offers",
      label: t("steps.offers.label"),
      title: t("steps.offers.title"),
      subtitle: t("steps.offers.subtitle"),
      questions: [
        {
          id: "offer_type",
          label: tq("offer_type.label"),
          type: "chips",
          required: true,
          multi: true,
          options: [
            { v: "physical", l: tq("offer_type.options.physical") },
            { v: "digital", l: tq("offer_type.options.digital") },
            { v: "service", l: tq("offer_type.options.service") },
            { v: "subscription", l: tq("offer_type.options.subscription") },
            { v: "course", l: tq("offer_type.options.course") },
            { v: "event", l: tq("offer_type.options.event") },
            { v: "software", l: tq("offer_type.options.software") },
          ],
        },
        {
          id: "price_range",
          label: tq("price_range.label"),
          type: "chips",
          required: false,
          multi: false,
          options: [
            { v: "<50", l: tq("price_range.options.lt50") },
            { v: "50-200", l: tq("price_range.options.50-200") },
            { v: "200-500", l: tq("price_range.options.200-500") },
            { v: "500-2000", l: tq("price_range.options.500-2000") },
            { v: "2000+", l: tq("price_range.options.2000plus") },
          ],
        },
        {
          id: "usp",
          label: tq("usp.label"),
          type: "textarea",
          required: false,
          placeholder: tq("usp.placeholder"),
        },
      ],
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");
  const [visible, setVisible] = useState(true);
  const isSummary = currentStep >= STEPS.length;
  const step = isSummary ? null : STEPS[currentStep];
  const totalSteps = STEPS.length;
  const progressPct = isSummary ? 100 : Math.round((currentStep / totalSteps) * 100);
  const canContinue = step ? isStepValid(step, answers) : true;

  // Initialize slider defaults
  useEffect(() => {
    setAnswers((prev) => {
      const defaults: Answers = {};
      STEPS.forEach((s) => {
        s.questions.forEach((q) => {
          if (q.type === "sliders" && q.sliders && !prev[q.id]) {
            const init: Record<string, number> = {};
            q.sliders.forEach((sl) => { init[sl.id] = sl.value; });
            defaults[q.id] = init;
          }
        });
      });
      return { ...defaults, ...prev };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleChip(qid: string, v: string, multi: boolean, maxSelect?: number) {
    setAnswers((prev) => {
      if (!multi) return { ...prev, [qid]: v };
      const arr = Array.isArray(prev[qid]) ? [...(prev[qid] as string[])] : [];
      const idx = arr.indexOf(v);
      if (idx >= 0) { arr.splice(idx, 1); return { ...prev, [qid]: arr }; }
      if (maxSelect && arr.length >= maxSelect) return prev;
      return { ...prev, [qid]: [...arr, v] };
    });
  }

  function setSlider(qid: string, sid: string, val: number) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: { ...((prev[qid] as Record<string, number>) || {}), [sid]: val },
    }));
  }

  function isSelected(qid: string, v: string): boolean {
    const a = answers[qid];
    return Array.isArray(a) ? (a as string[]).includes(v) : a === v;
  }

  function navigate(dir: "forward" | "back") {
    setAnimDir(dir);
    setVisible(false);
    setTimeout(() => {
      setCurrentStep((s) => dir === "forward" ? s + 1 : s - 1);
      setVisible(true);
    }, 200);
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const params = new URLSearchParams(window.location.search);
        const brandId = parseInt(params.get("brandId") || "1", 10);
        await supabase.from("brand_profiles")
          .upsert({ user_id: user.id, brand_id: brandId, data: answers }, { onConflict: "user_id,brand_id" });
      }
    } finally {
      setSaving(false);
      const prefix = locale === "en" ? "/en" : "";
      router.push(`${prefix}/dashboard`);
    }
  }

  // ── Chips ─────────────────────────────────────────────────────────────────
  function ChipBtn({ q, opt }: { q: Question; opt: Option }) {
    const sel = isSelected(q.id, opt.v);
    return (
      <button
        type="button"
        onClick={() => toggleChip(q.id, opt.v, !!q.multi, q.maxSelect)}
        className="px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 active:scale-95 text-left leading-snug"
        style={{
          border: `1.5px solid ${sel ? "rgba(86,219,132,0.5)" : "rgba(255,255,255,0.08)"}`,
          background: sel
            ? "linear-gradient(135deg,rgba(86,219,132,0.12),rgba(129,140,248,0.08))"
            : "rgba(255,255,255,0.03)",
          color: sel ? "#fff" : "rgba(255,255,255,0.5)",
          boxShadow: sel ? "0 0 0 1px rgba(86,219,132,0.2) inset, 0 1px 8px rgba(86,219,132,0.07)" : "none",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        {opt.l}
      </button>
    );
  }

  // ── Cards ─────────────────────────────────────────────────────────────────
  function CardBtn({ q, opt }: { q: Question; opt: CardOption }) {
    const sel = isSelected(q.id, opt.v);
    return (
      <button
        type="button"
        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.v }))}
        className="w-full p-5 rounded-2xl text-left transition-all duration-150 active:scale-[0.97]"
        style={{
          border: `1.5px solid ${sel ? "rgba(86,219,132,0.5)" : "rgba(255,255,255,0.08)"}`,
          background: sel
            ? "linear-gradient(135deg,rgba(86,219,132,0.1),rgba(129,140,248,0.06))"
            : "rgba(255,255,255,0.02)",
          boxShadow: sel ? "0 0 0 1px rgba(86,219,132,0.15) inset, 0 4px 20px rgba(86,219,132,0.05)" : "none",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none mt-0.5">{opt.icon}</span>
          <div>
            <div className="text-sm font-semibold text-white mb-1">{opt.title}</div>
            <div className="text-xs text-white/40 leading-relaxed">{opt.sub}</div>
          </div>
          {sel && (
            <div className="ml-auto flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
        </div>
      </button>
    );
  }

  // ── Render question ────────────────────────────────────────────────────────
  function renderQuestion(q: Question, qi: number) {
    return (
      <div key={q.id} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white/40" style={{ background: "rgba(255,255,255,0.06)" }}>
            {qi + 1}
          </div>
          <span className="text-[15px] font-semibold text-white/90 leading-snug">{q.label}</span>
          {q.required && <span className="text-[#56db84] text-xs ml-auto">*</span>}
        </div>
        {q.multi && (
          <p className="text-[12px] text-white/30 mb-3 -mt-2">
            {q.maxSelect ? t("chooseUpTo", { max: q.maxSelect }) : t("chooseMultiple")}
          </p>
        )}

        {q.type === "chips" && q.options && (
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => <ChipBtn key={opt.v} q={q} opt={opt} />)}
          </div>
        )}

        {q.type === "cards" && q.cardOptions && (
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3">
            {q.cardOptions.map((opt) => <CardBtn key={opt.v} q={q} opt={opt} />)}
          </div>
        )}

        {q.type === "sliders" && q.sliders && (
          <div className="rounded-2xl border border-white/6 overflow-hidden" style={{ background: "rgba(255,255,255,0.02)" }}>
            {q.sliders.map((sl, idx) => {
              const vals = (answers[q.id] as Record<string, number>) || {};
              return (
                <div
                  key={sl.id}
                  className="px-5 py-2"
                  style={{ borderBottom: idx < (q.sliders?.length ?? 0) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
                >
                  <ToneSlider
                    slider={sl}
                    value={vals[sl.id] !== undefined ? vals[sl.id] : sl.value}
                    onChange={(v) => setSlider(q.id, sl.id, v)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {q.type === "textarea" && (
          <textarea
            value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder={q.placeholder}
            rows={3}
            className="w-full rounded-2xl px-4 py-3.5 text-[14px] text-white placeholder-white/20 resize-none outline-none transition-all duration-150 leading-relaxed"
            style={{ background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-geist-sans)" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(86,219,132,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(86,219,132,0.06)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        )}

        {q.type === "text" && (
          <input
            type="text"
            value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder={q.placeholder}
            className="w-full rounded-2xl px-4 py-3.5 text-[14px] text-white placeholder-white/20 outline-none transition-all duration-150"
            style={{ background: "rgba(255,255,255,0.03)", border: "1.5px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-geist-sans)" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(86,219,132,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(86,219,132,0.06)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        )}
      </div>
    );
  }

  const industryMap = t.raw("industryMap") as Record<string, string>;
  const audMap = t.raw("audMap") as Record<string, string>;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(86,219,132,0.04) 0%, transparent 60%), #0a0a0a", fontFamily: "var(--font-geist-sans)" }}
    >
      {/* ── Header ── */}
      <div className="fixed top-0 inset-x-0 z-20" style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-2xl mx-auto px-5 lg:px-0">
          <div className="flex items-center justify-between py-3.5">
            <Logo />
            {!isSummary ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-white/30">{t("step")}</span>
                <span className="text-[13px] font-bold text-white">{currentStep + 1}</span>
                <span className="text-white/20 text-[11px]">/</span>
                <span className="text-[12px] text-white/30">{STEPS.length}</span>
              </div>
            ) : (
              <span className="text-[12px] font-semibold text-[#56db84]">{t("complete")}</span>
            )}
          </div>

          <div className="h-[2px] rounded-full mb-0" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#818cf8,#56db84)", boxShadow: "0 0 8px rgba(86,219,132,0.4)" }}
            />
          </div>

          {!isSummary && (
            <div className="flex items-center gap-3 py-3">
              {STEPS.map((s, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <div key={s.id} className="flex items-center gap-1 flex-shrink-0">
                    {i > 0 && (
                      <div className="w-4 h-px" style={{ background: done ? "rgba(86,219,132,0.4)" : "rgba(255,255,255,0.08)" }} />
                    )}
                    <div className="flex items-center gap-1.5 transition-all duration-300">
                      <div
                        className="rounded-full transition-all duration-300 flex items-center justify-center"
                        style={{
                          width: active ? 22 : done ? 8 : 6,
                          height: active ? 22 : done ? 8 : 6,
                          background: done || active ? "linear-gradient(135deg,#818cf8,#56db84)" : "rgba(255,255,255,0.1)",
                          boxShadow: active ? "0 0 8px rgba(86,219,132,0.35)" : "none",
                        }}
                      >
                        {done && (
                          <svg width="5" height="4" viewBox="0 0 5 4" fill="none"><path d="M0.5 2L2 3.5L4.5 0.5" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        )}
                      </div>
                      {active && (
                        <span className="text-[11px] font-semibold text-white/70">{s.label}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div
        className="flex-1 px-5 pb-36 lg:flex lg:items-start lg:justify-center lg:px-0"
        style={{
          paddingTop: isSummary ? 80 : 128,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : animDir === "forward" ? "translateY(20px)" : "translateY(-20px)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}
      >
        <div className="w-full max-w-2xl lg:px-8">

          {!isSummary && step && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,rgba(129,140,248,0.15),rgba(86,219,132,0.1))", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {STEP_ICONS[currentStep]}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#56db84] mb-0.5">{step.label}</p>
                  <h1 className="text-[22px] font-bold text-white leading-tight">{step.title}</h1>
                </div>
              </div>
              <p className="text-[14px] text-white/40 leading-relaxed">{step.subtitle}</p>
            </div>
          )}

          {!isSummary && step && step.questions.map((q, qi) => renderQuestion(q, qi))}

          {isSummary && (
            <div>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-3xl flex items-center justify-center text-2xl mb-5" style={{ background: "linear-gradient(135deg,rgba(86,219,132,0.2),rgba(129,140,248,0.15))", border: "1px solid rgba(86,219,132,0.2)", boxShadow: "0 0 24px rgba(86,219,132,0.08)" }}>
                  ✨
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#56db84] mb-2">{t("setupComplete")}</p>
                <h1 className="text-[26px] font-bold text-white mb-2 leading-tight">
                  {t("brandReady", { name: typeof answers["brand_name"] === "string" ? answers["brand_name"] : t("defaultBrandName") })}
                </h1>
                <p className="text-[14px] text-white/40">
                  {industryMap[answers["industry"] as string] || ""}
                  {answers["business_size"] ? ` · ${answers["business_size"]}` : ""}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  {
                    label: t("summaryAudience"),
                    icon: "👥",
                    value: `${audMap[answers["audience_type"] as string] || "—"} · ${(answers["audience_age"] as string[] || []).join(", ") || "—"}`
                  },
                  {
                    label: t("summaryTone"),
                    icon: "🎙️",
                    value: (answers["tone_words"] as string[] || []).join(", ") || "—"
                  },
                  {
                    label: t("summaryChannels"),
                    icon: "📱",
                    value: (answers["channels"] as string[] || []).join(", ") || "—"
                  },
                  {
                    label: t("summaryOffer"),
                    icon: "💎",
                    value: (answers["offer_type"] as string[] || []).join(", ") || "—"
                  },
                ].map(({ label, icon, value }) => (
                  <div key={label} className="rounded-2xl p-4" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">{icon}</span>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{label}</div>
                    </div>
                    <div className="text-[12px] text-white/70 leading-relaxed line-clamp-2">{value}</div>
                  </div>
                ))}

                {answers["usp"] && (
                  <div className="col-span-2 rounded-2xl p-4" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">🏆</span>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{t("summaryWhyMe")}</div>
                    </div>
                    <div className="text-[12px] text-white/70 leading-relaxed">{answers["usp"] as string}</div>
                  </div>
                )}
              </div>

              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full py-4 rounded-2xl text-[15px] font-bold text-black transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: saving ? "rgba(86,219,132,0.5)" : "linear-gradient(135deg,#56db84 0%,#3ecf8e 50%,#818cf8 100%)",
                  boxShadow: saving ? "none" : "0 4px 24px rgba(86,219,132,0.3), 0 1px 0 rgba(255,255,255,0.15) inset",
                  letterSpacing: "-0.01em",
                }}
              >
                {saving ? t("saving") : t("launch")}
              </button>

              <p className="text-center text-[11px] text-white/20 mt-3">{t("editAnytime")}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer nav (fixed) ── */}
      {!isSummary && (
        <div
          className="fixed bottom-0 inset-x-0 z-20 px-5 py-4"
          style={{ background: "linear-gradient(to top, rgba(10,10,10,1) 60%, rgba(10,10,10,0))", paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
        >
          <div className="max-w-2xl mx-auto flex items-center gap-3 lg:px-8">
            {currentStep > 0 ? (
              <button
                onClick={() => navigate("back")}
                className="flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center text-white/40 transition-all duration-150 active:scale-95"
                style={{ border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ) : (
              <div className="flex-shrink-0 w-12" />
            )}
            <button
              onClick={() => navigate("forward")}
              disabled={!canContinue}
              className="flex-1 h-12 rounded-2xl text-[15px] font-bold transition-all duration-150 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: canContinue ? "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)" : "rgba(255,255,255,0.05)",
                color: canContinue ? "#000" : "rgba(255,255,255,0.2)",
                cursor: canContinue ? "pointer" : "not-allowed",
                boxShadow: canContinue ? "0 4px 20px rgba(86,219,132,0.25)" : "none",
                fontFamily: "var(--font-geist-sans)",
                letterSpacing: "-0.01em",
              }}
            >
              <span>{currentStep === STEPS.length - 1 ? t("finish") : t("continue")}</span>
              {canContinue && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
