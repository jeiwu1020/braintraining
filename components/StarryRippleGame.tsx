import React, { useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Props {
  onBack: () => void;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  velocity: number;
}

const StarryRippleGame: React.FC<Props> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const starsRef = useRef<Star[]>([]);
  const requestRef = useRef<number>();
  const canvasSizeRef = useRef({ width: 0, height: 0 });

  const colors = ['#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#fbbf24'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initStars = (width: number, height: number) => {
      starsRef.current = [];
      const numStars = Math.floor((width * height) / 2000); // Density
      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2,
          alpha: Math.random(),
          velocity: 0.005 + Math.random() * 0.01,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width || canvas.parentElement?.clientWidth || window.innerWidth));
      const height = Math.max(1, Math.floor(rect.height || canvas.parentElement?.clientHeight || window.innerHeight));
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvasSizeRef.current = { width, height };
      initStars(width, height);
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const { width, height } = canvasSizeRef.current;

      // Clear with slight trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Slate 900 with opacity for trails
      ctx.fillRect(0, 0, width, height);

      // Draw Stars
      starsRef.current.forEach(star => {
        star.alpha += star.velocity;
        if (star.alpha > 1 || star.alpha < 0) {
          star.velocity = -star.velocity;
        }
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, star.alpha))})`;
        ctx.fill();
      });

      // Draw Ripples
      ripplesRef.current = ripplesRef.current.filter(ripple => {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ripple.color}, ${ripple.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ripple.radius += 2;
        ripple.alpha -= 0.01;

        return ripple.alpha > 0;
      });

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined;
      }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Pick a random color from the palette, convert to RGB string for alpha manipulation
    const hex = colors[Math.floor(Math.random() * colors.length)];
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const rgbStr = `${r}, ${g}, ${b}`;

    ripplesRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: 100 + Math.random() * 50,
      alpha: 1,
      color: rgbStr,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1) return; // Only if mouse is down
    // Add smaller ripples when dragging
    if (Math.random() > 0.7) {
      handlePointerDown(e);
    }
  };

  return (
    <div
      data-starry-root
      className="starry-root relative h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-slate-900 touch-none"
    >
      <canvas
        ref={canvasRef}
        data-starry-canvas
        className="starry-canvas absolute inset-0 h-full w-full cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      />

      <div
        data-starry-safe-overlay
        className="starry-safe-overlay app-safe-screen pointer-events-none absolute inset-0 z-10 h-full w-full"
      >
        <button
          data-starry-back
          type="button"
          onClick={onBack}
          aria-label="返回遊戲選單"
          className="starry-back pointer-events-auto absolute inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur-md transition-colors hover:bg-white/20"
        >
          <ArrowLeft size={24} />
        </button>

        <div data-starry-instruction className="starry-instruction absolute w-full text-center pointer-events-none">
          <p className="text-white/70 tracking-widest">輕觸或滑動螢幕</p>
        </div>
      </div>
    </div>
  );
};

export default StarryRippleGame;
