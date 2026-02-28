"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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
          { v: "services", l: "👨‍💼 Servicii B2B" },
          { v: "agency", l: "📣 Agenție marketing" },
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
          { v: "2-5", l: "2-5 persoane" },
          { v: "6-20", l: "6-20 persoane" },
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
          { v: "18-24", l: "18-24" },
          { v: "25-34", l: "25-34" },
          { v: "35-44", l: "35-44" },
          { v: "45-54", l: "45-54" },
          { v: "55+", l: "55+" },
        ],
      },
      {
        id: "audience_pain",
        label: "Care e problema principală pe care o rezolvi?",
        type: "chips",
        required: true,
        multi: false,
        options: [
          { v: "time", l: "⏱️ Nu au timp" },
          { v: "money", l: "💸 Costă prea mult" },
          { v: "complexity", l: "🧩 E prea complicat" },
          { v: "results", l: "📈 Nu văd rezultate" },
          { v: "trust", l: "🤝 Nu știu pe cine să aibă încredere" },
          { v: "other", l: "Altceva" },
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
          { v: "2-3week", l: "De 2-3 ori/săpt" },
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
          { v: "50-200", l: "50-200€" },
          { v: "200-500", l: "200-500€" },
          { v: "500-2000", l: "500-2.000€" },
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
  if (val < 25) return s.left;
  if (val > 75) return s.right;
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

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11px] text-white/40 px-1">
        <span>{slider.left}</span>
        <span className="text-[#56db84] font-semibold">{sliderLabel(slider, value)}</span>
        <span>{slider.right}</span>
      </div>
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        className="relative h-8 flex items-center cursor-pointer touch-none"
      >
        {/* Track */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-white/8" />
        {/* Fill */}
        <div className="absolute left-0 h-1 rounded-full" style={{ width: `${value}%`, background: "linear-gradient(90deg,#56db84,#3b82f6)" }} />
        {/* Thumb */}
        <div
          className="absolute w-5 h-5 rounded-full bg-white shadow-lg -translate-x-1/2"
          style={{ left: `${value}%`, boxShadow: "0 0 0 3px rgba(86,219,132,0.35)" }}
        />
      </div>
    </div>
  );
}

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
  const totalSteps = STEPS.length + 1; // +1 for summary
  const pct = Math.round(((isSummary ? STEPS.length : currentStep) / totalSteps) * 100);
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
    }, 180);
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

  // ── Chips ──────────────────────────────────────────────────────────────
  function ChipBtn({ q, opt }: { q: Question; opt: Option }) {
    const sel = isSelected(q.id, opt.v);
    return (
      <button
        type="button"
        onClick={() => toggleChip(q.id, opt.v, !!q.multi, q.maxSelect)}
        className="px-4 py-2.5 rounded-xl text-sm transition-all duration-150 text-left"
        style={{
          border: `1px solid ${sel ? "rgba(86,219,132,0.6)" : "rgba(255,255,255,0.1)"}`,
          background: sel ? "rgba(86,219,132,0.10)" : "rgba(255,255,255,0.03)",
          color: sel ? "#fff" : "rgba(255,255,255,0.6)",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        {opt.l}
      </button>
    );
  }

  // ── Cards ──────────────────────────────────────────────────────────────
  function CardBtn({ q, opt }: { q: Question; opt: CardOption }) {
    const sel = isSelected(q.id, opt.v);
    return (
      <button
        type="button"
        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.v }))}
        className="w-full p-4 rounded-2xl text-left transition-all duration-150"
        style={{
          border: `1px solid ${sel ? "rgba(86,219,132,0.6)" : "rgba(255,255,255,0.1)"}`,
          background: sel ? "rgba(86,219,132,0.10)" : "rgba(255,255,255,0.03)",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <div className="text-2xl mb-2">{opt.icon}</div>
        <div className="text-sm font-semibold text-white mb-1">{opt.title}</div>
        <div className="text-xs text-white/40 leading-relaxed">{opt.sub}</div>
      </button>
    );
  }

  // ── Render question ────────────────────────────────────────────────────
  function renderQuestion(q: Question, qi: number) {
    return (
      <div key={q.id} className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] bg-white/6 border border-white/8 px-2 py-0.5 rounded text-white/40">{qi + 1}</span>
          <span className="text-sm font-medium text-white/70">{q.label}</span>
          {q.required && <span className="text-[#56db84] text-[10px]">*</span>}
          {q.multi && (
            <span className="text-[10px] text-white/30">{q.maxSelect ? `max ${q.maxSelect}` : "mai multe"}</span>
          )}
        </div>

        {q.type === "chips" && q.options && (
          <div className="flex flex-wrap gap-2">
            {q.options.map((opt) => <ChipBtn key={opt.v} q={q} opt={opt} />)}
          </div>
        )}

        {q.type === "cards" && q.cardOptions && (
          <div className="flex flex-col gap-3">
            {q.cardOptions.map((opt) => <CardBtn key={opt.v} q={q} opt={opt} />)}
          </div>
        )}

        {q.type === "sliders" && q.sliders && (
          <div className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/2 p-4">
            {q.sliders.map((sl) => {
              const vals = (answers[q.id] as Record<string, number>) || {};
              return (
                <ToneSlider
                  key={sl.id}
                  slider={sl}
                  value={vals[sl.id] !== undefined ? vals[sl.id] : sl.value}
                  onChange={(v) => setSlider(q.id, sl.id, v)}
                />
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
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none outline-none focus:ring-1 focus:ring-[#56db84]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-geist-sans)" }}
          />
        )}

        {q.type === "text" && (
          <input
            type="text"
            value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            placeholder={q.placeholder}
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-1 focus:ring-[#56db84]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-geist-sans)" }}
          />
        )}
      </div>
    );
  }

  // ── Summary ────────────────────────────────────────────────────────────
  const industryMap: Record<string, string> = { ecom: "E-commerce", services: "Servicii B2B", agency: "Agenție marketing", coaching: "Coaching / Cursuri", saas: "SaaS / Tech", horeca: "HoReCa", realestate: "Imobiliare", health: "Sănătate", finance: "Finanțe", other: "Altceva" };
  const audMap: Record<string, string> = { b2c: "Consumatori (B2C)", b2b: "Companii (B2B)", both: "B2C + B2B" };

  // ── Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col" style={{ fontFamily: "var(--font-geist-sans)" }}>

      {/* ── Header: logo + progress ── */}
      <div className="fixed top-0 inset-x-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-sm border-b border-white/6">
        <div className="flex items-center justify-between px-5 py-3">
          <Image src="/nesco-logo.png" alt="Nesco Digital" height={20} width={151} className="h-5 w-auto" />
          <span className="text-xs text-white/35">
            {isSummary ? "Gata!" : `${currentStep + 1} / ${STEPS.length}`}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-[2px] bg-white/6 mx-0">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%`, background: "linear-gradient(90deg,#56db84,#3b82f6)" }}
          />
        </div>
        {/* Step pills */}
        {!isSummary && (
          <div className="flex items-center gap-1.5 px-5 py-2.5 overflow-x-auto scrollbar-none">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === currentStep ? 24 : 6,
                    background: i < currentStep ? "#56db84" : i === currentStep ? "#56db84" : "rgba(255,255,255,0.15)",
                    opacity: i > currentStep ? 0.4 : 1,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div
        className="flex-1 px-5 pb-32 transition-all duration-180"
        style={{
          paddingTop: isSummary ? 80 : 112,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : animDir === "forward" ? "translateY(16px)" : "translateY(-16px)",
          transition: "opacity 0.18s ease, transform 0.18s ease",
        }}
      >
        <div className="max-w-lg mx-auto w-full">

          {/* Step header */}
          {!isSummary && step && (
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#56db84] mb-2">
                {step.label}
              </p>
              <h1 className="text-2xl font-bold text-white leading-tight mb-1">{step.title}</h1>
              <p className="text-sm text-white/40 leading-relaxed">{step.subtitle}</p>
            </div>
          )}

          {/* Questions */}
          {!isSummary && step && step.questions.map((q, qi) => renderQuestion(q, qi))}

          {/* Summary */}
          {isSummary && (
            <div>
              <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#56db84] mb-2">Configurare completă</p>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {typeof answers["brand_name"] === "string" ? answers["brand_name"] : "Brandul tău"} e gata.
                </h1>
                <p className="text-sm text-white/40">
                  {industryMap[answers["industry"] as string] || ""}
                  {answers["business_size"] ? ` · ${answers["business_size"]}` : ""}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: "Audiență", value: `${audMap[answers["audience_type"] as string] || "—"} · ${(answers["audience_age"] as string[] || []).join(", ") || "—"}` },
                  { label: "Ton de voce", value: (answers["tone_words"] as string[] || []).join(", ") || "—" },
                  { label: "Canale", value: (answers["channels"] as string[] || []).join(", ") || "—" },
                  { label: "Ofertă", value: (answers["offer_type"] as string[] || []).join(", ") || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">{label}</div>
                    <div className="text-xs text-white leading-relaxed">{value}</div>
                  </div>
                ))}
                {answers["usp"] && (
                  <div className="col-span-2 rounded-xl p-4" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">De ce te aleg clienții</div>
                    <div className="text-xs text-white leading-relaxed">{answers["usp"] as string}</div>
                  </div>
                )}
              </div>

              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full py-4 rounded-2xl text-base font-bold text-black transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#56db84,#3b82f6)" }}
              >
                {saving ? "Se salvează..." : "⚡ Lansează workspace-ul meu"}
              </button>

              <p className="text-center text-xs text-white/25 mt-3">Poți modifica oricând din setări</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer nav (fixed) ── */}
      {!isSummary && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-white/6 px-5 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                onClick={() => navigate("back")}
                className="flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center text-white/40 transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
              >
                ←
              </button>
            ) : (
              <div className="flex-shrink-0 w-12" />
            )}
            <button
              onClick={() => navigate("forward")}
              disabled={!canContinue}
              className="flex-1 h-12 rounded-xl text-sm font-bold transition-all duration-150 active:scale-[0.98]"
              style={{
                background: canContinue ? "#56db84" : "rgba(86,219,132,0.15)",
                color: canContinue ? "#000" : "rgba(255,255,255,0.25)",
                cursor: canContinue ? "pointer" : "not-allowed",
                fontFamily: "var(--font-geist-sans)",
              }}
            >
              {currentStep === STEPS.length - 1 ? "Finalizează" : "Continuă"} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
