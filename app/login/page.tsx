"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/app/components/Logo";

// ── WebGL noise background ─────────────────────────────────────────────────
const VERT = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform float uTime;
uniform vec2 uResolution;

vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  vec4 i = floor(v.xyzz + dot(v, C.yyyy));
  vec4 x0 = v.xyzz - i.xyzz + dot(i.xyzz, C.xxxx);
  vec4 i1 = vec4(0.0);
  i1.xyz = step(x0.yzw, x0.xxx);
  i1.w = 1.0 - i1.x - i1.y - i1.z;
  vec4 i2 = clamp(i1 + vec4(i1.yzwx) - 1.0, 0.0, 1.0);
  vec4 x1 = x0 - i1 + C.xxxx;
  vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - 0.5;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.w + vec4(0.0, i1.w, i2.w, 1.0))
    + i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0);
  vec3 ns = 0.142857142857 * vec3(0.0, 1.0, -1.0) - vec3(0.0, 0.5, 0.5);
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = (x_ * ns.x + ns.yyyy);
  vec4 y = (y_ * ns.x + ns.yyyy);
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uTime * 0.15;

  float n1 = snoise(vec3(uv * 2.5, t));
  float n2 = snoise(vec3(uv * 2.0 + 1.5, t + 1.0));
  float n3 = snoise(vec3(uv * 1.5 + 3.0, t + 2.0));

  float n = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
  n = n * 0.5 + 0.5;

  vec3 col1 = vec3(0.04, 0.04, 0.08);
  vec3 col2 = vec3(0.08, 0.15, 0.25);
  vec3 col3 = vec3(0.05, 0.25, 0.15);

  vec3 color = mix(col1, col2, n);
  color = mix(color, col3, snoise(vec3(uv * 3.0, t + 3.0)) * 0.3 + 0.3);

  gl_FragColor = vec4(color, 1.0);
}
`;

function NoiseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    function compileShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "uTime");
    const uRes = gl.getUniformLocation(prog, "uResolution");

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl!.viewport(0, 0, canvas.width, canvas.height);
      gl!.uniform2f(uRes, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    function render() {
      gl!.uniform1f(uTime, (performance.now() - start) / 1000);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 0 }}
    />
  );
}

// ── Login page ─────────────────────────────────────────────────────────────
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
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#060810", fontFamily: "var(--font-geist-sans)" }}>
      <NoiseCanvas />

      {/* ── Left panel: graphic (desktop only) ── */}
      <div
        className="hidden lg:flex lg:flex-1 lg:flex-col lg:items-start lg:justify-between relative overflow-hidden px-12 py-12"
        style={{ zIndex: 1 }}
      >
        {/* Logo top-left */}
        <Logo />

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          {/* Floating orbs */}
          <div className="relative w-full h-64 mb-10">
            {/* Large orb */}
            <div
              className="absolute rounded-full"
              style={{
                width: 220, height: 220,
                left: "50%", top: "50%",
                transform: "translate(-50%,-50%)",
                background: "radial-gradient(circle at 40% 40%, rgba(86,219,132,0.25), rgba(129,140,248,0.1) 60%, transparent 80%)",
                border: "1px solid rgba(86,219,132,0.15)",
                boxShadow: "0 0 60px rgba(86,219,132,0.1)",
              }}
            />
            {/* Inner orb */}
            <div
              className="absolute rounded-full"
              style={{
                width: 120, height: 120,
                left: "50%", top: "50%",
                transform: "translate(-50%,-50%)",
                background: "radial-gradient(circle at 35% 35%, rgba(86,219,132,0.35), rgba(129,140,248,0.2) 70%, transparent)",
                border: "1px solid rgba(86,219,132,0.25)",
              }}
            />
            {/* Center dot */}
            <div
              className="absolute rounded-full"
              style={{
                width: 40, height: 40,
                left: "50%", top: "50%",
                transform: "translate(-50%,-50%)",
                background: "linear-gradient(135deg,#56db84,#818cf8)",
                boxShadow: "0 0 24px rgba(86,219,132,0.5)",
              }}
            />
            {/* Floating mini cards */}
            {[
              { top: "8%", left: "5%", label: "Post Instagram", icon: "📸", delay: "0s" },
              { top: "12%", right: "0%", label: "Email campaign", icon: "📧", delay: "0.4s" },
              { bottom: "5%", left: "8%", label: "Reclamă Ads", icon: "🎯", delay: "0.8s" },
              { bottom: "10%", right: "2%", label: "Post LinkedIn", icon: "💼", delay: "0.2s" },
            ].map((c, i) => (
              <div
                key={i}
                className="absolute flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-medium text-white/70"
                style={{
                  top: c.top, left: c.left, right: (c as {right?: string}).right, bottom: c.bottom,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  animation: `float 4s ease-in-out infinite`,
                  animationDelay: c.delay,
                }}
              >
                <span>{c.icon}</span>
                <span>{c.label}</span>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#56db84", boxShadow: "0 0 6px #56db84" }} />
              </div>
            ))}
          </div>

          <h2 className="text-[28px] font-bold text-white leading-tight mb-3">
            AI care scrie<br />în vocea brandului tău.
          </h2>
          <p className="text-[15px] text-white/40 leading-relaxed">
            Conținut personalizat pentru fiecare canal,<br />generat în secunde.
          </p>

          {/* Mini testimonial */}
          <div
            className="mt-8 rounded-2xl px-5 py-4 flex items-start gap-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black"
              style={{ background: "linear-gradient(135deg,#56db84,#818cf8)" }}
            >
              M
            </div>
            <div>
              <p className="text-[13px] text-white/70 leading-relaxed italic">
                "Am economisit 6 ore pe săptămână. AI-ul știe exact cum să vorbesc cu clienții mei."
              </p>
              <p className="text-[11px] text-white/30 mt-1.5">Mihai D. · CEO, agenție digitală</p>
            </div>
          </div>
        </div>

        {/* Bottom footnote */}
        <p className="text-[11px] text-white/20">© 2025 Nesco Digital</p>
      </div>

      {/* ── Divider (desktop) ── */}
      <div className="hidden lg:block w-px" style={{ background: "rgba(255,255,255,0.06)", zIndex: 1 }} />

      {/* ── Right panel: form ── */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative min-h-screen lg:min-h-0 lg:max-w-[480px]"
        style={{ zIndex: 1 }}
      >
        {/* Logo (mobile only) */}
        <div className="lg:hidden flex justify-center mb-8">
          <Logo />
        </div>

        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div
                className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#56db84,#818cf8)", boxShadow: "0 8px 24px rgba(86,219,132,0.3)" }}
              >
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                  <path d="M2 9l6 7L22 2" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-[22px] font-bold text-white mb-2">Verifică emailul</h2>
              <p className="text-[14px] text-white/50 leading-relaxed">
                Am trimis un link magic la{" "}
                <span className="text-white font-medium">{email}</span>.
                <br />Click pe el pentru a te autentifica.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-[24px] font-bold text-white mb-1.5">Intră în cont</h1>
              <p className="text-[14px] text-white/40 mb-8 leading-relaxed">
                Introdu emailul și îți trimitem un link de autentificare.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplu.com"
                  className="w-full rounded-2xl px-4 py-3.5 text-[14px] text-white placeholder-white/25 outline-none transition-all duration-150"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1.5px solid rgba(255,255,255,0.1)",
                    fontFamily: "var(--font-geist-sans)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(86,219,132,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(86,219,132,0.08)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                />

                {error && (
                  <p className="text-[13px] text-red-400/80">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl py-3.5 text-[15px] font-bold text-black transition-all duration-150 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{
                    background: loading
                      ? "rgba(86,219,132,0.6)"
                      : "linear-gradient(135deg,#56db84,#3ecf8e 60%,#818cf8)",
                    boxShadow: loading ? "none" : "0 4px 20px rgba(86,219,132,0.3)",
                    letterSpacing: "-0.01em",
                    fontFamily: "var(--font-geist-sans)",
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
                        <path d="M8 2a6 6 0 0 1 6 6" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Se trimite...
                    </>
                  ) : (
                    "Trimite link magic →"
                  )}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-[12px] text-white/20 mt-8">
            Nesco Digital AI · Toate drepturile rezervate
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
