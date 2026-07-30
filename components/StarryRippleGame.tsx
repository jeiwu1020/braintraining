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

  const colors = ['#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#fbbf24'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
    };

    const initStars = (width: number, height: number) => {
        starsRef.current = [];
        const numStars = Math.floor((width * height) / 2000); // Density
        for (let i = 0; i < numStars; i++) {
            starsRef.current.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2,
                alpha: Math.random(),
                velocity: 0.005 + Math.random() * 0.01
            });
        }
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      // Clear with slight trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.2)'; // Slate 900 with opacity for trails
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
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
      color: rgbStr
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
    <div className="relative w-full h-[100dvh] bg-slate-900 overflow-hidden touch-none">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur-md rounded-full shadow-md text-white hover:bg-white/20 z-50 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="absolute top-4 left-0 w-full text-center pointer-events-none z-40">
          <p className="text-white/50 text-sm tracking-widest">輕觸或滑動螢幕</p>
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      />
    </div>
  );
};

export default StarryRippleGame;
