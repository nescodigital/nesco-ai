'use client';
import { useEffect, useRef } from 'react';

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d')!;
    let W: number, H: number, raf: number;

    // Electric Dusk - 10% mai întunecat
    const BG = [9, 4, 0];
    const SP: [number,number,number][] = [
      [230, 90,   0],
      [230,  0,  90],
      [135,  0, 230],
      [  0, 180, 230],
      [230, 45, 135],
      [180, 90,   0],
      [ 90,  0, 200],
    ];

    let curtains: any[] = [], rays: any[] = [], stars: any[] = [];
    let glows: any[] = [], particles: any[] = [];

    function rand(min: number, max: number) { return min + Math.random() * (max - min); }

    function build() {
      curtains = SP.map(([r,g,b], i) => ({
        r, g, b,
        baseY: H * (0.02 + i * 0.13),
        layers: Array.from({length: 4}, (_, li) => ({
          amp:   H * (0.04 + rand(0, 0.09) + li * 0.02),
          freq:  0.002 + rand(0, 0.003) + li * 0.001,
          phase: rand(0, Math.PI * 2),
          speed: (0.003 + rand(0, 0.005)) * (li % 2 === 0 ? 1 : -1),
          width: H * (0.08 + rand(0, 0.08) - li * 0.01),
          alpha: (0.08 - li * 0.015 + rand(0, 0.04)) * 0.5,
        }))
      }));

      rays = Array.from({length: 55}, () => ({
        col: SP[Math.floor(rand(0, 7))],
        x:   rand(0, W),
        y:   rand(0, H * 0.3),
        h:   H * rand(0.2, 0.6),
        w:   rand(2, 9),
        alpha: rand(0.03, 0.08),
        ph:  rand(0, Math.PI * 2),
        sp:  rand(0.008, 0.022),
      }));

      stars = Array.from({length: 500}, () => ({
        x: rand(0, W), y: rand(0, H),
        r: rand(0.2, 1.4),
        a: rand(0.3, 0.95),
        tw: rand(0, Math.PI * 2),
        sp: rand(0.007, 0.018),
      }));

      glows = Array.from({length: 7}, () => ({
        x: rand(0, W), y: rand(0, H),
        radius: rand(120, 300),
        col: SP[Math.floor(rand(0, 7))],
        ph: rand(0, Math.PI * 2),
        sp: rand(0.003, 0.009),
      }));

      particles = Array.from({length: 480}, () => ({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.4, 0.4), vy: rand(-0.25, 0.25),
        r: rand(0.3, 1.9),
        a: rand(0.1, 0.55),
        tw: rand(0, Math.PI * 2),
        sp: rand(0.008, 0.022),
        col: SP[Math.floor(rand(0, 7))],
      }));
    }

    function drawGlow(x: number, y: number, radius: number, r: number, g: number, b: number, alpha: number, steps = 6) {
      for (let i = steps; i >= 1; i--) {
        const frac = i / steps;
        const a = alpha * (1 - frac) * (1 - frac);
        if (a < 0.002) continue;
        ctx.beginPath();
        ctx.arc(x, y, radius * frac, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fill();
      }
    }

    function draw() {
      ctx.fillStyle = `rgba(${BG[0]},${BG[1]},${BG[2]},0.07)`;
      ctx.fillRect(0, 0, W, H);

      // 1. Glow zones
      glows.forEach(gl => {
        gl.ph += gl.sp;
        const pulse = 0.85 + Math.sin(gl.ph) * 0.15;
        const a = 0.025 + Math.sin(gl.ph) * 0.01;
        const [r,g,b] = gl.col;
        drawGlow(gl.x, gl.y, gl.radius * pulse, r, g, b, a, 6);
      });

      // 2. Rays
      rays.forEach(ray => {
        ray.ph += ray.sp;
        ray.x  += Math.sin(ray.ph * 0.3) * 0.4;
        if (ray.x < 0) ray.x = W; if (ray.x > W) ray.x = 0;
        const a = ray.alpha * (Math.sin(ray.ph) * 0.5 + 0.5);
        if (a < 0.005) return;
        const [r,g,b] = ray.col;
        for (let step = 0; step < 5; step++) {
          const frac = step / 4;
          const alpha2 = a * (1 - Math.abs(frac * 2 - 1));
          const yTop = ray.y + frac * ray.h;
          const yBot = ray.y + (frac + 0.25) * ray.h;
          const wTop = ray.w * (1 + frac * 0.5);
          ctx.beginPath();
          ctx.rect(ray.x - wTop, yTop, wTop * 2, yBot - yTop);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha2 * 0.4})`;
          ctx.fill();
        }
      });

      // 3. Aurora curtains
      curtains.forEach(curtain => {
        curtain.layers.forEach((layer: any) => {
          layer.phase += layer.speed;
          const yBase = curtain.baseY + layer.width * 0.15;
          const pts: [number, number][] = [];
          for (let x = 0; x <= W + 20; x += 7) {
            const y = yBase
              + Math.sin(x * layer.freq + layer.phase) * layer.amp
              + Math.sin(x * layer.freq * 2.7 + layer.phase * 1.4) * layer.amp * 0.3
              + Math.sin(x * layer.freq * 0.5 + layer.phase * 0.6) * layer.amp * 0.5;
            pts.push([x, y]);
          }
          const passes = 3;
          for (let p = 0; p < passes; p++) {
            const blurScale = 1 - p / passes;
            const a = layer.alpha * 1.8 * blurScale * 0.7;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(W + 20, 0);
            for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.closePath();
            ctx.fillStyle = `rgba(${curtain.r},${curtain.g},${curtain.b},${a})`;
            ctx.fill();
          }
        });
      });

      // 4. Particles
      particles.forEach(p => {
        p.tw += p.sp;
        p.x += p.vx + Math.sin(p.tw) * 0.2;
        p.y += p.vy + Math.cos(p.tw * 0.6) * 0.15;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const a = p.a * (Math.sin(p.tw) * 0.45 + 0.55);
        const [r,g,b] = p.col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${a * 0.6})`;
        ctx.fill();
      });

      // 5. Stars
      stars.forEach(s => {
        s.tw += s.sp;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a * (Math.sin(s.tw) * 0.35 + 0.55)})`;
        ctx.fill();
      });

      // 6. Vignette
      const vignette = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.1, W / 2, H * 0.42, W * 0.75);
      vignette.addColorStop(0, 'rgba(0,0,0,0.55)');
      vignette.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      // 7. Bottom fade to match page bg
      const fade = ctx.createLinearGradient(0, H * 0.75, 0, H);
      fade.addColorStop(0, 'rgba(10,10,10,0)');
      fade.addColorStop(1, 'rgba(10,10,10,1)');
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(draw);
    }

    function resize() {
      if (!cv) return;
      W = cv.width  = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
      build();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        zIndex: 0,
      }}
    />
  );
}
