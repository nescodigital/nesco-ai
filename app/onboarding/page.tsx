"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";

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

// ── Steps data ─────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    id: "business",
    label: "Afacerea ta",
    title: "Despre afacerea ta",
    subtitle: "Câteva detalii de bază — durează 30 de secunde.",
    questions: [
      {
        id: "industry",
        label: "În ce industrie activezi?",
        type: "chips",
        required: true,
        multi: false,
        options: [
          { v: "ecom", l: "🛒 E-commerce" },
          { v: "services", l: "👨‍💼 Servicii" },
          { v: "coaching", l: "🎓 Coaching / Cursuri" },
          { v: "saas", l: "💻 SaaS / Tech" },
          { v: "horeca", l: "🍽️ HoReCa" },
          { v: "realestate", l: "🏠 Imobiliare" },
          { v: "health", l: "🩺 Sănătate / Wellness" },
          { v: "finance", l: "💰 Finanțe / Contabilitate" },
          { v: "other", l: "… Altceva" },
        ],
      },
      {
        id: "business_size",
        label: "Câți angajați are compania?",
        type: "chips",
        required: true,
        multi: false,
        options: [
          { v: "solo", l: "Solo / Freelancer" },
          { v: "2-5", l: "2–5 persoane" },
          { v: "6-20", l: "6–20 persoane" },
          { v: "20+", l: "20+ persoane" },
        ],
      },
      {
        id: "brand_name",
        label: "Numele brandului tău",
        type: "text",
        required: true,
        placeholder: "ex. Nesco Digital, FreshBurger Cluj...",
      },
    ],
  },
  {
    id: "audience",
    label: "Audiența",
    title: "Cine sunt clienții tăi?",
    subtitle: "Cu cât știm mai bine cui vorbim, cu atât conținutul e mai relevant.",
    questions: [
      {
        id: "audience_type",
        label: "Vinzi către...",
        type: "cards",
        required: true,
        multi: false,
        cardOptions: [
          { v: "b2c", icon: "🤝", title: "Consumatori (B2C)", sub: "Persoane fizice care cumpără pentru ei" },
          { v: "b2b", icon: "🏢", title: "Companii (B2B)", sub: "Decizii de business, facturi, contracte" },
          { v: "both", icon: "⚡", title: "Ambele", sub: "Atât persoane fizice cât și companii" },
        ],
      },
      {
        id: "audience_age",
        label: "Vârsta principală a clienților tăi",
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
        label: "Cum iau decizia de cumpărare clienții tăi?",
        type: "chips",
        required: true,
        multi: false,
        options: [
          { v: "impulsive", l: "⚡ Impulsiv / rapid" },
          { v: "compare", l: "🔍 Compară mai multe opțiuni" },
          { v: "research", l: "🕐 Au nevoie de timp și informații" },
          { v: "social", l: "💬 Recomandări de la alții" },
        ],
      },
    ],
  },
  {
    id: "tone",
    label: "Ton & voce",
    title: "Cum vorbește brandul tău?",
    subtitle: "Ajustează cursoarele — AI-ul va scrie exact în stilul tău.",
    questions: [
      {
        id: "tone_sliders",
        label: "Tonul de comunicare",
        type: "sliders",
        required: true,
        sliders: [
          { id: "formal", left: "Formal", right: "Relaxat", value: 50 },
          { id: "serious", left: "Serios", right: "Jucăuș", value: 30 },
          { id: "simple", left: "Tehnic", right: "Simplu", value: 65 },
          { id: "bold", left: "Discret", right: "Îndrăzneț", value: 60 },
        ],
      },
      {
        id: "tone_words",
        label: "Alege 3 cuvinte care descriu cel mai bine brandul tău",
        type: "chips",
        required: false,
        multi: true,
        maxSelect: 3,
        options: [
          { v: "professional", l: "Profesionist" },
          { v: "trustworthy", l: "De încredere" },
          { v: "innovative", l: "Inovator" },
          { v: "friendly", l: "Prietenos" },
          { v: "bold", l: "Îndrăzneț" },
          { v: "premium", l: "Premium" },
          { v: "accessible", l: "Accesibil" },
          { v: "expert", l: "Expert" },
          { v: "authentic", l: "Autentic" },
          { v: "dynamic", l: "Dinamic" },
          { v: "calm", l: "Calm" },
          { v: "passionate", l: "Pasionat" },
        ],
      },
      {
        id: "avoid",
        label: "Cuvinte sau fraze pe care NU vrei să le folosim",
        type: "textarea",
        required: false,
        placeholder: 'ex. "revoluționar", "de vis", clișee motivaționale... Lasă gol dacă nu ai restricții.',
      },
    ],
  },
  {
    id: "content",
    label: "Conținut",
    title: "Ce conținut creezi?",
    subtitle: "Selectează canalele și tipurile de conținut pe care le vei genera cu AI-ul.",
    questions: [
      {
        id: "channels",
        label: "Pe ce canale ești activ?",
        type: "chips",
        required: true,
        multi: true,
        options: [
          { v: "facebook", l: "👍 Facebook" },
          { v: "instagram", l: "📸 Instagram" },
          { v: "linkedin", l: "💼 LinkedIn" },
          { v: "tiktok", l: "🎵 TikTok" },
          { v: "email", l: "📧 Email marketing" },
          { v: "blog", l: "✍️ Blog / SEO" },
          { v: "whatsapp", l: "💬 WhatsApp / SMS" },
          { v: "google", l: "🔍 Google Ads" },
          { v: "meta", l: "🎯 Meta Ads" },
        ],
      },
      {
        id: "content_types",
        label: "Ce tipuri de conținut creezi cel mai des?",
        type: "chips",
        required: true,
        multi: true,
        options: [
          { v: "posts", l: "📱 Postări sociale" },
          { v: "ads", l: "🎯 Reclame" },
          { v: "emails", l: "📧 Email-uri" },
          { v: "captions", l: "🖼️ Capturi / Descrieri" },
          { v: "stories", l: "⚡ Stories / Reels script" },
          { v: "offers", l: "💰 Pagini de ofertă" },
          { v: "blogs", l: "📝 Articole blog" },
          { v: "scripts", l: "🎙️ Scripturi video" },
        ],
      },
      {
        id: "frequency",
        label: "Cât de des publici?",
        type: "chips",
        required: false,
        multi: false,
        options: [
          { v: "daily", l: "Zilnic" },
          { v: "2-3week", l: "De 2–3 ori/săpt" },
          { v: "weekly", l: "Săptămânal" },
          { v: "monthly", l: "Lunar sau mai rar" },
        ],
      },
    ],
  },
  {
    id: "offers",
    label: "Ofertele tale",
    title: "Ce vinzi?",
    subtitle: "AI-ul va putea crea conținut centrat pe produsele și prețurile tale.",
    questions: [
      {
        id: "offer_type",
        label: "Ce tipuri de produse / servicii oferi?",
        type: "chips",
        required: true,
        multi: true,
        options: [
          { v: "physical", l: "📦 Produse fizice" },
          { v: "digital", l: "💾 Produse digitale" },
          { v: "service", l: "👨‍💼 Servicii / Consultanță" },
          { v: "subscription", l: "🔄 Abonament lunar" },
          { v: "course", l: "📚 Cursuri / Programe" },
          { v: "event", l: "🎤 Evenimente" },
          { v: "software", l: "💻 Software / SaaS" },
        ],
      },
      {
        id: "price_range",
        label: "Care e prețul mediu al ofertei principale?",
        type: "chips",
        required: false,
        multi: false,
        options: [
          { v: "<50", l: "Sub 50€" },
          { v: "50-200", l: "50–200€" },
          { v: "200-500", l: "200–500€" },
          { v: "500-2000", l: "500–2.000€" },
          { v: "2000+", l: "Peste 2.000€" },
        ],
      },
      {
        id: "usp",
        label: "De ce te aleg clienții pe tine și nu concurența?",
        type: "textarea",
        required: false,
        placeholder: "ex. Livrăm în 24h, cel mai bun raport calitate-preț, singurii care...",
      },
    ],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function sliderLabel(s: SliderDef, val: number): string {
  if (val < 30) return s.left;
  if (val > 70) return s.right;
  return "Echilibrat";
}

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

  const label = sliderLabel(slider, value);
  const labelColor = label === slider.right ? "#56db84" : label === slider.left ? "#818cf8" : "rgba(255,255,255,0.55)";

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-bold text-white">{slider.left}</span>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: labelColor }}>{label}</span>
        <span className="text-[14px] font-bold text-white">{slider.right}</span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative h-10 flex items-center cursor-pointer touch-none select-none"
      >
        {/* Track bg */}
        <div className="absolute inset-x-0 h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
        {/* Fill */}
        <div
          className="absolute left-0 h-[3px] rounded-full transition-[width] duration-75"
          style={{ width: `${value}%`, background: "linear-gradient(90deg,#818cf8,#56db84)" }}
        />
        {/* Thumb */}
        <div
          className="absolute w-6 h-6 rounded-full -translate-x-1/2 transition-[left] duration-75 flex items-center justify-center"
          style={{
            left: `${value}%`,
            background: "linear-gradient(135deg,#818cf8,#56db84)",
            boxShadow: "0 0 0 3px rgba(86,219,132,0.2), 0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}

// ── Step Icon ─────────────────────────────────────────────────────────────────
const STEP_ICONS = ["🏢", "👥", "🎙️", "📱", "💎"];

// ── Main ────────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
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
        await supabase.from("brand_profiles").insert({ user_id: user.id, data: answers });
      }
    } finally {
      setSaving(false);
      router.push("/dashboard");
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
        {/* Question label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white/40" style={{ background: "rgba(255,255,255,0.06)" }}>
            {qi + 1}
          </div>
          <span className="text-[15px] font-semibold text-white/90 leading-snug">{q.label}</span>
          {q.required && <span className="text-[#56db84] text-xs ml-auto">*</span>}
        </div>
        {q.multi && (
          <p className="text-[12px] text-white/30 mb-3 -mt-2">
            {q.maxSelect ? `Alege până la ${q.maxSelect}` : "Poți alege mai multe"}
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
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(255,255,255,0.08)",
              fontFamily: "var(--font-geist-sans)",
            }}
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
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1.5px solid rgba(255,255,255,0.08)",
              fontFamily: "var(--font-geist-sans)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(86,219,132,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(86,219,132,0.06)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        )}
      </div>
    );
  }

  // ── Summary data ──────────────────────────────────────────────────────────
  const industryMap: Record<string, string> = { ecom: "E-commerce", services: "Servicii", coaching: "Coaching / Cursuri", saas: "SaaS / Tech", horeca: "HoReCa", realestate: "Imobiliare", health: "Sănătate", finance: "Finanțe", other: "Altceva" };
  const audMap: Record<string, string> = { b2c: "B2C", b2b: "B2B", both: "B2C + B2B" };

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(86,219,132,0.04) 0%, transparent 60%), #0a0a0a",
        fontFamily: "var(--font-geist-sans)",
      }}
    >

      {/* ── Header ── */}
      <div className="fixed top-0 inset-x-0 z-20" style={{ background: "rgba(10,10,10,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-2xl mx-auto px-5 lg:px-0">
          {/* Top bar: logo + step count */}
          <div className="flex items-center justify-between py-3.5">
            <Logo />
            {!isSummary ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-white/30">Pasul</span>
                <span className="text-[13px] font-bold text-white">{currentStep + 1}</span>
                <span className="text-white/20 text-[11px]">/</span>
                <span className="text-[12px] text-white/30">{STEPS.length}</span>
              </div>
            ) : (
              <span className="text-[12px] font-semibold text-[#56db84]">✓ Complet</span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-[2px] rounded-full mb-0" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg,#818cf8,#56db84)",
                boxShadow: "0 0 8px rgba(86,219,132,0.4)",
              }}
            />
          </div>

          {/* Step dots */}
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
                    <div
                      className="flex items-center gap-1.5 transition-all duration-300"
                    >
                      <div
                        className="rounded-full transition-all duration-300 flex items-center justify-center"
                        style={{
                          width: active ? 22 : done ? 8 : 6,
                          height: active ? 22 : done ? 8 : 6,
                          background: done
                            ? "linear-gradient(135deg,#818cf8,#56db84)"
                            : active
                            ? "linear-gradient(135deg,#818cf8,#56db84)"
                            : "rgba(255,255,255,0.1)",
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

          {/* Step header */}
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#56db84] mb-0.5">
                    {step.label}
                  </p>
                  <h1 className="text-[22px] font-bold text-white leading-tight">{step.title}</h1>
                </div>
              </div>
              <p className="text-[14px] text-white/40 leading-relaxed">{step.subtitle}</p>
            </div>
          )}

          {/* Questions */}
          {!isSummary && step && step.questions.map((q, qi) => renderQuestion(q, qi))}

          {/* Summary */}
          {isSummary && (
            <div>
              {/* Header */}
              <div className="mb-8">
                <div
                  className="w-14 h-14 rounded-3xl flex items-center justify-center text-2xl mb-5"
                  style={{ background: "linear-gradient(135deg,rgba(86,219,132,0.2),rgba(129,140,248,0.15))", border: "1px solid rgba(86,219,132,0.2)", boxShadow: "0 0 24px rgba(86,219,132,0.08)" }}
                >
                  ✨
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#56db84] mb-2">Configurare completă</p>
                <h1 className="text-[26px] font-bold text-white mb-2 leading-tight">
                  {typeof answers["brand_name"] === "string" ? answers["brand_name"] : "Brandul tău"} e gata.
                </h1>
                <p className="text-[14px] text-white/40">
                  {industryMap[answers["industry"] as string] || ""}
                  {answers["business_size"] ? ` · ${answers["business_size"]}` : ""}
                </p>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  {
                    label: "Audiență",
                    icon: "👥",
                    value: `${audMap[answers["audience_type"] as string] || "—"} · ${(answers["audience_age"] as string[] || []).join(", ") || "—"}`
                  },
                  {
                    label: "Ton de voce",
                    icon: "🎙️",
                    value: (answers["tone_words"] as string[] || []).join(", ") || "—"
                  },
                  {
                    label: "Canale active",
                    icon: "📱",
                    value: (answers["channels"] as string[] || []).join(", ") || "—"
                  },
                  {
                    label: "Ofertă",
                    icon: "💎",
                    value: (answers["offer_type"] as string[] || []).join(", ") || "—"
                  },
                ].map(({ label, icon, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl p-4"
                    style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">{icon}</span>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">{label}</div>
                    </div>
                    <div className="text-[12px] text-white/70 leading-relaxed line-clamp-2">{value}</div>
                  </div>
                ))}

                {answers["usp"] && (
                  <div
                    className="col-span-2 rounded-2xl p-4"
                    style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm">🏆</span>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-white/30">De ce te aleg clienții</div>
                    </div>
                    <div className="text-[12px] text-white/70 leading-relaxed">{answers["usp"] as string}</div>
                  </div>
                )}
              </div>

              {/* CTA */}
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
                {saving ? "Se salvează..." : "⚡ Lansează workspace-ul meu"}
              </button>

              <p className="text-center text-[11px] text-white/20 mt-3">Poți modifica oricând din setări</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer nav (fixed) ── */}
      {!isSummary && (
        <div
          className="fixed bottom-0 inset-x-0 z-20 px-5 py-4"
          style={{
            background: "linear-gradient(to top, rgba(10,10,10,1) 60%, rgba(10,10,10,0))",
            paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          }}
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
                background: canContinue
                  ? "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)"
                  : "rgba(255,255,255,0.05)",
                color: canContinue ? "#000" : "rgba(255,255,255,0.2)",
                cursor: canContinue ? "pointer" : "not-allowed",
                boxShadow: canContinue ? "0 4px 20px rgba(86,219,132,0.25)" : "none",
                fontFamily: "var(--font-geist-sans)",
                letterSpacing: "-0.01em",
              }}
            >
              <span>{currentStep === STEPS.length - 1 ? "Finalizează" : "Continuă"}</span>
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
