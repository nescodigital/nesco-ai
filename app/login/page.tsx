"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#56db84]">
            <span className="text-2xl font-bold text-black">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Verifică emailul</h1>
          <p className="mt-3 text-zinc-400">
            Am trimis un link magic la{" "}
            <span className="text-white font-medium">{email}</span>.
            Click pe el pentru a te autentifica.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image
            src="/nesco-logo.png"
            alt="Nesco Digital"
            height={28}
            width={210}
            className="h-7 w-auto"
          />
        </div>

        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Intră în contul tău
        </h1>
        <p className="text-zinc-400 text-center text-sm mb-8">
          Introdu emailul și îți trimitem un link de autentificare.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplu.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white placeholder-zinc-500 outline-none ring-[#56db84] focus:ring-2"
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#56db84] px-6 py-3.5 text-sm font-bold text-black transition hover:bg-[#3ec96d] active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Se trimite..." : "Trimite link magic"}
          </button>
        </form>
      </div>
    </div>
  );
}
