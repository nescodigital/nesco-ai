"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────
type Answers = Record<string, string | string[] | Record<string, number>>;

interface SliderDef {
  id: string;
  left: string;
  right: string;
  value: number;
}
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
  desc: string;
  title: string;
  subtitle: string;
  questions: Question[];
}

// ── Steps data ─────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    id: "business",
    label: "Afacerea ta",
    desc: "Industrie & tip",
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
    desc: "Cine cumpără de la tine",
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
    desc: "Cum comunici",
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
    desc: "Ce și unde publici",
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
    desc: "Ce vinzi",
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
        label: "Care e motivul principal pentru care clienții te aleg pe tine și nu pe concurență?",
        type: "textarea",
        required: false,
        placeholder: "ex. Livrăm în 24h, avem cel mai bun raport calitate-preț, suntem singurii care...",
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
    if (q.type === "chips" || q.type === "cards") {
      return q.multi ? Array.isArray(a) && (a as string[]).length > 0 : !!a;
    }
    if (q.type === "text" || q.type === "textarea") {
      return typeof a === "string" && a.trim().length > 0;
    }
    return true;
  });
}

// ── Slider component ────────────────────────────────────────────────────────
function ToneSlider({
  slider,
  value,
  onChange,
}: {
  slider: SliderDef;
  value: number;
  onChange: (val: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  function computePct(clientX: number): number {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    return Math.round(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }

  function onMouseDown(e: React.MouseEvent) {
    onChange(computePct(e.clientX));
    const onMove = (ev: MouseEvent) => onChange(computePct(ev.clientX));
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function onTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    onChange(computePct(touch.clientX));
    const onMove = (ev: TouchEvent) => onChange(computePct(ev.touches[0].clientX));
    const onEnd = () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <span style={{ width: 90, fontSize: 11, color: "rgba(255,255,255,0.38)", textAlign: "right", flexShrink: 0 }}>
        {slider.left}
      </span>
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          flex: 1,
          height: 4,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 99,
          position: "relative",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: "linear-gradient(90deg,#56db84,#3b82f6)",
            borderRadius: 99,
          }}
        />
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: "50%",
            left: `${value}%`,
            transform: "translate(-50%,-50%)",
            boxShadow: "0 0 0 3px rgba(86,219,132,0.3)",
            cursor: "grab",
          }}
        />
      </div>
      <span style={{ width: 90, fontSize: 11, color: "rgba(255,255,255,0.38)", flexShrink: 0 }}>
        {slider.right}
      </span>
      <span
        style={{
          width: 70,
          fontSize: 11,
          fontWeight: 600,
          color: "#56db84",
          textAlign: "center",
          flexShrink: 0,
        }}
      >
        {sliderLabel(slider, value)}
      </span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isSummary = currentStep >= STEPS.length;
  const step = isSummary ? null : STEPS[currentStep];
  const pct = Math.round((currentStep / STEPS.length) * 100);

  function setAnswer(qid: string, val: string | string[] | Record<string, number>) {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
  }

  function toggleChip(qid: string, v: string, multi: boolean, maxSelect?: number) {
    setAnswers((prev) => {
      const cur = prev[qid];
      if (!multi) return { ...prev, [qid]: v };
      const arr: string[] = Array.isArray(cur) ? [...(cur as string[])] : [];
      const idx = arr.indexOf(v);
      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        if (maxSelect && arr.length >= maxSelect) return prev;
        arr.push(v);
      }
      return { ...prev, [qid]: arr };
    });
  }

  function setSlider(qid: string, sid: string, val: number) {
    setAnswers((prev) => {
      const cur = (prev[qid] as Record<string, number>) || {};
      return { ...prev, [qid]: { ...cur, [sid]: val } };
    });
  }

  function isSelected(qid: string, v: string): boolean {
    const a = answers[qid];
    return Array.isArray(a) ? (a as string[]).includes(v) : a === v;
  }

  function goNext() {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setCurrentStep((s) => s + 1);
  }

  function goBack() {
    if (currentStep > 0) {
      if (contentRef.current) contentRef.current.scrollTop = 0;
      setCurrentStep((s) => s - 1);
    }
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("brand_profiles").insert({
          user_id: user.id,
          data: answers,
        });
      }
    } finally {
      setSaving(false);
      router.push("/dashboard");
    }
  }

  // Initialize sliders defaults
  useEffect(() => {
    const defaults: Answers = {};
    STEPS.forEach((s) => {
      s.questions.forEach((q) => {
        if (q.type === "sliders" && q.sliders) {
          const init: Record<string, number> = {};
          q.sliders.forEach((sl) => { init[sl.id] = sl.value; });
          defaults[q.id] = init;
        }
      });
    });
    setAnswers((prev) => ({ ...defaults, ...prev }));
  }, []);

  const canContinue = step ? isStepValid(step, answers) : true;

  // ── Chip component ─────────────────────────────────────────────────────
  function Chip({ q, opt }: { q: Question; opt: Option }) {
    const sel = isSelected(q.id, opt.v);
    return (
      <button
        type="button"
        onClick={() => toggleChip(q.id, opt.v, !!q.multi, q.maxSelect)}
        style={{
          padding: "9px 16px",
          borderRadius: 8,
          border: `1px solid ${sel ? "rgba(86,219,132,0.6)" : "rgba(255,255,255,0.07)"}`,
          background: sel ? "rgba(86,219,132,0.08)" : "rgba(255,255,255,0.02)",
          color: sel ? "#fff" : "rgba(255,255,255,0.65)",
          fontSize: 13,
          cursor: "pointer",
          transition: "all 0.15s",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        {opt.l}
      </button>
    );
  }

  // ── Card option component ──────────────────────────────────────────────
  function CardOpt({ q, opt }: { q: Question; opt: CardOption }) {
    const sel = isSelected(q.id, opt.v);
    return (
      <button
        type="button"
        onClick={() => setAnswer(q.id, opt.v)}
        style={{
          padding: "16px 18px",
          borderRadius: 10,
          border: `1px solid ${sel ? "rgba(86,219,132,0.6)" : "rgba(255,255,255,0.07)"}`,
          background: sel ? "rgba(86,219,132,0.08)" : "rgba(255,255,255,0.02)",
          cursor: "pointer",
          transition: "all 0.15s",
          textAlign: "left",
          fontFamily: "var(--font-geist-sans)",
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 8 }}>{opt.icon}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 3 }}>{opt.title}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>{opt.sub}</div>
      </button>
    );
  }

  // ── Render question ────────────────────────────────────────────────────
  function renderQuestion(q: Question, qi: number) {
    return (
      <div key={q.id} style={{ marginBottom: 36 }}>
        {/* Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.38)" }}>
          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.07)", padding: "2px 7px", borderRadius: 4 }}>
            {qi + 1}
          </span>
          {q.label}
          {q.required && <span style={{ color: "#56db84", fontSize: 10 }}>*</span>}
          {q.multi && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 400 }}>
              {q.maxSelect ? `max ${q.maxSelect}` : "mai multe"}
            </span>
          )}
        </div>

        {/* Chips */}
        {q.type === "chips" && q.options && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {q.options.map((opt) => <Chip key={opt.v} q={q} opt={opt} />)}
          </div>
        )}

        {/* Cards */}
        {q.type === "cards" && q.cardOptions && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
            {q.cardOptions.map((opt) => <CardOpt key={opt.v} q={q} opt={opt} />)}
          </div>
        )}

        {/* Sliders */}
        {q.type === "sliders" && q.sliders && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {q.sliders.map((sl) => {
              const sliderVals = (answers[q.id] as Record<string, number>) || {};
              const val = sliderVals[sl.id] !== undefined ? sliderVals[sl.id] : sl.value;
              return (
                <ToneSlider
                  key={sl.id}
                  slider={sl}
                  value={val}
                  onChange={(v) => setSlider(q.id, sl.id, v)}
                />
              );
            })}
          </div>
        )}

        {/* Textarea */}
        {q.type === "textarea" && (
          <textarea
            value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            placeholder={q.placeholder}
            rows={3}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: "13px 16px",
              color: "#fff",
              fontSize: 14,
              fontFamily: "var(--font-geist-sans)",
              outline: "none",
              resize: "vertical",
              minHeight: 80,
            }}
          />
        )}

        {/* Text input */}
        {q.type === "text" && (
          <input
            type="text"
            value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
            onChange={(e) => setAnswer(q.id, e.target.value)}
            placeholder={q.placeholder}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              padding: "11px 14px",
              color: "#fff",
              fontSize: 13,
              fontFamily: "var(--font-geist-sans)",
              outline: "none",
            }}
          />
        )}
      </div>
    );
  }

  // ── Summary screen ─────────────────────────────────────────────────────
  const industryMap: Record<string, string> = { ecom: "E-commerce", services: "Servicii B2B", agency: "Agenție marketing", coaching: "Coaching / Cursuri", saas: "SaaS / Tech", horeca: "HoReCa", realestate: "Imobiliare", health: "Sănătate", finance: "Finanțe", other: "Altceva" };
  const audMap: Record<string, string> = { b2c: "Consumatori (B2C)", b2b: "Companii (B2B)", both: "B2C + B2B" };

  function SummaryCard({ label, value }: { label: string; value: string }) {
    return (
      <div style={{ padding: "16px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
        <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>{value || "—"}</div>
      </div>
    );
  }

  // ── Layout ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: "100svh", background: "#0a0a0a", fontFamily: "var(--font-geist-sans)", overflow: "hidden" }}>

      {/* ── Sidebar (desktop) ── */}
      <aside style={{ width: 260, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.07)", padding: "32px 24px", display: "flex", flexDirection: "column", background: "#111113" }}
        className="hidden sm:flex">
        <div style={{ marginBottom: 40 }}>
          <Image src="/nesco-logo.png" alt="Nesco Digital" height={24} width={181} className="h-6 w-auto" />
        </div>

        {/* Step list */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {STEPS.map((s, i) => {
            const isDone = i < currentStep || isSummary;
            const isActive = i === currentStep && !isSummary;
            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "14px 0 14px 16px",
                  marginLeft: -16,
                  borderLeft: `2px solid ${isDone || isActive ? "#56db84" : "transparent"}`,
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
                    background: isActive ? "#56db84" : isDone ? "rgba(86,219,132,0.2)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isActive || isDone ? "#56db84" : "rgba(255,255,255,0.07)"}`,
                    color: isActive ? "#000" : isDone ? "#56db84" : "rgba(255,255,255,0.38)",
                  }}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: isActive ? "#fff" : "rgba(255,255,255,0.38)", marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
            <div style={{ height: "100%", width: `${isSummary ? 100 : pct}%`, background: "linear-gradient(90deg,#56db84,#3b82f6)", borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>{isSummary ? 100 : pct}% completat</div>
        </div>
      </aside>

      {/* ── Mobile progress bar (top) ── */}
      <div className="sm:hidden" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 10, background: "#111113", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <Image src="/nesco-logo.png" alt="Nesco Digital" height={18} width={136} className="h-[18px] w-auto" />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
            {isSummary ? "Finalizat" : `Pasul ${currentStep + 1} din ${STEPS.length}`}
          </span>
        </div>
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${isSummary ? 100 : pct}%`, background: "linear-gradient(90deg,#56db84,#3b82f6)", borderRadius: 99, transition: "width 0.4s ease" }} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        {!isSummary && step && (
          <div style={{ padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}
            className="sm:pt-5 pt-[72px]">
            <div style={{ fontWeight: 700, fontSize: 22, color: "#fff" }}>{step.title}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{step.subtitle}</div>
          </div>
        )}

        {/* Scrollable content */}
        <div ref={contentRef} style={{ flex: 1, overflowY: "auto", padding: "32px 32px" }}
          className={!isSummary ? "" : "sm:pt-8 pt-[72px]"}>

          {!isSummary && step && step.questions.map((q, qi) => renderQuestion(q, qi))}

          {/* Summary */}
          {isSummary && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 28, color: "#fff", marginBottom: 8 }}>
                🎉 Brand configurat!
              </div>
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: 14, marginBottom: 4 }}>
                Verifică datele și lansează workspace-ul tău AI.
              </div>
              <div style={{ color: "#fff", fontWeight: 600, fontSize: 18, marginTop: 16, marginBottom: 4 }}>
                {typeof answers["brand_name"] === "string" ? answers["brand_name"] : "Brandul tău"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 24 }}>
                {industryMap[answers["industry"] as string] || ""}{answers["business_size"] ? ` · ${answers["business_size"]}` : ""}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                <SummaryCard label="Audiență" value={`${audMap[answers["audience_type"] as string] || "—"}\n${(answers["audience_age"] as string[] || []).join(", ") || ""}`} />
                <SummaryCard label="Ton de voce" value={(answers["tone_words"] as string[] || []).join(", ")} />
                <SummaryCard label="Canale active" value={(answers["channels"] as string[] || []).join(", ")} />
                <SummaryCard label="Tip ofertă" value={(answers["offer_type"] as string[] || []).join(", ")} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <SummaryCard label="De ce te aleg clienții" value={typeof answers["usp"] === "string" ? answers["usp"] : "—"} />
                </div>
              </div>

              <button
                onClick={handleFinish}
                disabled={saving}
                style={{
                  marginTop: 32,
                  padding: "14px 36px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#56db84,#3b82f6)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-geist-sans)",
                  opacity: saving ? 0.7 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                {saving ? "Se salvează..." : "⚡ Lansează workspace-ul meu"}
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {!isSummary && (
          <div style={{ padding: "18px 32px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a0a" }}>
            <button
              onClick={goBack}
              style={{
                padding: "10px 20px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.07)",
                background: "transparent", color: "rgba(255,255,255,0.38)",
                fontSize: 13, cursor: "pointer",
                fontFamily: "var(--font-geist-sans)",
                visibility: currentStep === 0 ? "hidden" : "visible",
              }}
            >
              ← Înapoi
            </button>

            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
              Pasul {currentStep + 1} din {STEPS.length}
            </span>

            <button
              onClick={goNext}
              disabled={!canContinue}
              style={{
                padding: "11px 28px", borderRadius: 8,
                border: "none",
                background: canContinue ? "#56db84" : "rgba(86,219,132,0.2)",
                color: canContinue ? "#000" : "rgba(255,255,255,0.3)",
                fontSize: 13, fontWeight: 600,
                cursor: canContinue ? "pointer" : "not-allowed",
                fontFamily: "var(--font-geist-sans)",
                transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {currentStep === STEPS.length - 1 ? "Finalizează" : "Continuă"} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
