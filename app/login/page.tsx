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
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#060810" }}>
      <NoiseCanvas />

      {/* Glassmorphism card */}
      <div
        className="relative w-full max-w-sm"
        style={{ zIndex: 1 }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {sent ? (
          <div
            className="rounded-3xl px-8 py-10 text-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset",
            }}
          >
            <div
              className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#56db84,#818cf8)", boxShadow: "0 8px 24px rgba(86,219,132,0.3)" }}
            >
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                <path d="M2 9l6 7L22 2" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-white mb-2">Verifică emailul</h2>
            <p className="text-[14px] text-white/50 leading-relaxed">
              Am trimis un link magic la{" "}
              <span className="text-white font-medium">{email}</span>.
              <br />Click pe el pentru a te autentifica.
            </p>
          </div>
        ) : (
          <div
            className="rounded-3xl px-8 py-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset",
            }}
          >
            <h1 className="text-[20px] font-bold text-white mb-1.5">Intră în cont</h1>
            <p className="text-[14px] text-white/40 mb-6 leading-relaxed">
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
          </div>
        )}

        <p className="text-center text-[12px] text-white/20 mt-5">
          Nesco Digital AI · Toate drepturile rezervate
        </p>
      </div>
    </div>
  );
}
