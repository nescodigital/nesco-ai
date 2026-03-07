import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" style={{ fontFamily: "var(--font-geist-sans)" }}>
      <header className="px-6 py-4 flex items-center border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <Logo />
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-8xl font-extrabold mb-4" style={{ color: "rgba(86,219,132,0.15)" }}>404</p>
          <h1 className="text-2xl font-bold text-white mb-3">Pagina nu a fost găsită</h1>
          <p className="text-white/50 text-sm mb-8 leading-relaxed">
            Pagina pe care o cauți nu există sau a fost mutată. Întoarce-te pe pagina principală.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/"
              className="px-6 py-3 rounded-full text-sm font-bold text-black"
              style={{ background: "linear-gradient(135deg,#56db84,#3ecf8e)" }}
            >
              Pagina principală
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-full text-sm font-semibold text-white/70 border border-white/15 hover:border-white/30 transition-colors"
            >
              Vezi planurile
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-zinc-600" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        © {new Date().getFullYear()} Nesco Digital.{" "}
        <Link href="/privacy" className="hover:text-zinc-400 transition-colors ml-2">Confidențialitate</Link>
        <Link href="/terms" className="hover:text-zinc-400 transition-colors ml-2">Termeni</Link>
      </footer>
    </div>
  );
}
