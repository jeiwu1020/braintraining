import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Mic, MicOff, Download, RefreshCcw, PenTool, Eraser, Paintbrush } from 'lucide-react';

interface Props {
  onBack: () => void;
}

type Mode = 'DRAW' | 'VOICE';

const MandalaGame: React.FC<Props> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>('DRAW');
  
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number>();
  const modeRef = useRef<Mode>('DRAW');
  const mountedRef = useRef(true);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#60a5fa'); // blue-400
  const [brushSize, setBrushSize] = useState(3);
  
  const angleRef = useRef(0);
  const hueRef = useRef(0);
  const symmetry = 8; // Number of symmetrical petals

  const colors = ['#f8fafc', '#fca5a5', '#fcd34d', '#86efac', '#60a5fa', '#a78bfa', '#f472b6'];

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Fill dark background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    angleRef.current = 0;
  };

  useEffect(() => {
    initCanvas();
    return () => {
      mountedRef.current = false;
      stopRecording();
    };
  }, []);

  // --- Voice Mode Logic ---
  const toggleRecording = async () => {
      if (isRecording) {
          stopRecording();
      } else {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              if (modeRef.current !== 'VOICE') {
                  stream.getTracks().forEach(track => track.stop());
                  return;
              }
              streamRef.current = stream;
              
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              audioCtxRef.current = audioCtx;
              
              const source = audioCtx.createMediaStreamSource(stream);
              const analyser = audioCtx.createAnalyser();
              analyser.fftSize = 256;
              source.connect(analyser);
              analyserRef.current = analyser;
              
              setIsRecording(true);
              drawVoice();
          } catch (err) {
              console.error('Error accessing microphone:', err);
              stopRecording();
              alert('無法存取麥克風，請確認權限設定。');
          }
      }
  };

  const stopRecording = () => {
      if (requestRef.current !== undefined) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = undefined;
      }
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      if (audioCtxRef.current) {
          void audioCtxRef.current.close();
          audioCtxRef.current = null;
      }
      analyserRef.current = null;
      if (mountedRef.current) setIsRecording(false);
  };

  const handleBack = () => {
      stopRecording();
      onBack();
  };

  const drawVoice = () => {
      if (!analyserRef.current || !canvasRef.current || modeRef.current !== 'VOICE') return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate overall volume
      let sum = 0;
      let highestFreqIdx = 0;
      let highestFreqValue = 0;
      
      for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
          if (dataArray[i] > highestFreqValue) {
              highestFreqValue = dataArray[i];
              highestFreqIdx = i;
          }
      }
      const volume = sum / bufferLength;
      
      // Expand the dynamic range dramatically
      // volume typically ranges 0-100 for normal speech, maxing out at 255.
      const rawNormalized = volume / 255;
      
      // Use an exponential curve to heavily exaggerate volume differences
      // Small sounds remain small, loud sounds get huge
      const boostedVolume = Math.pow(rawNormalized * 2.5, 1.5);
      
      // Clamp between 0 and 1
      const finalVolume = Math.min(Math.max(boostedVolume, 0), 1);

      // Only draw if there is some sound
      if (volume > 1) {
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          
          // Map highest frequency to hue
          const currentHue = (highestFreqIdx / bufferLength) * 360 + hueRef.current;
          hueRef.current += 0.5; // Slowly shift base color
          
          // Map final volume to radius/distance from center (wider range)
          const radius = finalVolume * (canvas.width / 2 - 10) + 5;
          
          // Map final volume to brush size
          const bSize = finalVolume * 20 + 2;

          ctx.save();
          ctx.translate(cx, cy);
          
          for (let i = 0; i < symmetry; i++) {
              ctx.rotate((Math.PI * 2) / symmetry);
              
              ctx.beginPath();
              ctx.arc(
                  Math.cos(angleRef.current) * radius, 
                  Math.sin(angleRef.current) * radius, 
                  bSize, 
                  0, 
                  Math.PI * 2
              );
              ctx.fillStyle = `hsl(${currentHue}, 80%, 60%)`;
              ctx.shadowColor = `hsl(${currentHue}, 80%, 60%)`;
              ctx.shadowBlur = 10;
              ctx.fill();
          }
          ctx.restore();
          
          angleRef.current += 0.05;
      }

      if (modeRef.current === 'VOICE') {
          requestRef.current = requestAnimationFrame(drawVoice);
      }
  };

  useEffect(() => {
      modeRef.current = mode;
      if (mode === 'DRAW' && isRecording) {
          stopRecording();
      }
  }, [mode]);

  // --- Draw Mode Logic ---
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const drawSymmetric = (ctx: CanvasRenderingContext2D, x: number, y: number, isDown: boolean) => {
    const cx = ctx.canvas.width / 2;
    const cy = ctx.canvas.height / 2;

    for (let i = 0; i < symmetry; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i * 2 * Math.PI) / symmetry);
      
      const rx = x - cx;
      const ry = y - cy;
      
      if (isDown) {
        ctx.beginPath();
        ctx.moveTo(rx, ry);
      } else {
        ctx.lineTo(rx, ry);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'DRAW') return;
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      drawSymmetric(ctx, x, y, true);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (mode !== 'DRAW' || !isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      drawSymmetric(ctx, x, y, false);
      drawSymmetric(ctx, x, y, true);
    }
  };

  const handlePointerUp = () => {
    if (mode !== 'DRAW') return;
    setIsDrawing(false);
  };


  const handleDownload = () => {
      if (!canvasRef.current) return;
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'mandala.png';
      link.href = dataUrl;
      link.click();
  };

  const colorNames: Record<string, string> = {
    '#f8fafc': '白色',
    '#fca5a5': '紅色',
    '#fcd34d': '黃色',
    '#86efac': '綠色',
    '#60a5fa': '藍色',
    '#a78bfa': '紫色',
    '#f472b6': '粉紅色',
  };

  return (
    <div
      data-mandala-root
      className="mandala-root h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-slate-950 font-sans text-slate-100"
    >
      <div data-mandala-safe-stage className="app-safe-screen h-full w-full">
        <div data-mandala-layout className="mandala-layout relative flex h-full min-h-0 w-full overflow-hidden">
          <button
            data-mandala-back
            type="button"
             onClick={handleBack}
            aria-label="返回遊戲選單"
            className="mandala-back absolute z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/10 text-white shadow-md backdrop-blur-md transition-colors hover:bg-white/20"
          >
            <ArrowLeft size={24} />
          </button>

          <main className="mandala-main flex min-h-0 w-full items-center">
            <section data-mandala-controls className="mandala-controls min-h-0">
              <h2 className="mandala-title font-bold tracking-wider text-slate-200">紓壓畫板</h2>

              <div data-mandala-mode className="mandala-mode flex rounded-full bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setMode('DRAW')}
                  aria-pressed={mode === 'DRAW'}
                  className={`mandala-mode-button inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors ${mode === 'DRAW' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <PenTool size={16} /> 手繪
                </button>
                <button
                  type="button"
                  onClick={() => setMode('VOICE')}
                  aria-pressed={mode === 'VOICE'}
                  className={`mandala-mode-button inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-colors ${mode === 'VOICE' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Mic size={16} /> 聲控
                </button>
              </div>

              {mode === 'DRAW' ? (
                <div className="mandala-draw-tools">
                  <div className="mandala-colors" aria-label="選擇畫筆顏色">
                    {colors.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-label={`選擇顏色 ${colorNames[c]}`}
                        aria-pressed={color === c}
                        className="mandala-color-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-full shadow-sm transition-shadow"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <label className="mandala-brush flex items-center gap-2 text-slate-400">
                    <Paintbrush size={18} aria-hidden="true" />
                    <input
                      type="range"
                      min="1" max="10"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      aria-label="筆刷大小"
                      className="mandala-brush-range min-h-11 flex-1 accent-indigo-500"
                    />
                  </label>

                  <div className="mandala-tool-actions flex">
                    <button type="button" onClick={initCanvas} aria-label="清除畫布" className="mandala-tool-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:text-slate-200">
                      <Eraser size={20} />
                    </button>
                    <button type="button" onClick={handleDownload} aria-label="下載作品" className="mandala-tool-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:text-white">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mandala-voice-tools">
                  <p className="mandala-voice-helper text-slate-400">
                    發出聲音，音量決定半徑與粗細，音高決定顏色。<br />(請允許麥克風權限)
                  </p>
                  <div className="mandala-tool-actions flex">
                    <button type="button" onClick={initCanvas} aria-label="清除畫布" className="mandala-tool-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:text-white">
                      <RefreshCcw size={20} />
                    </button>
                    <button
                      data-mandala-mic
                      type="button"
                      onClick={toggleRecording}
                      aria-label={isRecording ? '停止聲控繪圖' : '開始聲控繪圖'}
                      className={`mandala-mic-button inline-flex min-h-12 min-w-12 items-center justify-center rounded-full shadow-lg transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                    >
                      {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>
                    <button type="button" onClick={handleDownload} aria-label="下載作品" className="mandala-tool-button inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:text-white">
                      <Download size={20} />
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section data-mandala-canvas className="mandala-canvas-stage min-h-0 min-w-0">
              <div className="mandala-canvas-frame relative aspect-square overflow-hidden rounded-2xl bg-slate-900 shadow-2xl ring-2 ring-slate-800">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  aria-label="紓壓聲繪畫布"
                  className={`mandala-canvas h-full w-full touch-none bg-slate-900 object-contain ${mode === 'DRAW' ? 'cursor-crosshair' : 'cursor-default'}`}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseOut={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                />
                {mode === 'DRAW' && (
                  <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
                    <div className="absolute left-0 top-1/2 h-px w-full bg-white" />
                    <div className="absolute left-1/2 top-0 h-full w-px bg-white" />
                    <div className="absolute left-0 top-1/2 h-px w-full origin-center rotate-45 bg-white" />
                    <div className="absolute left-0 top-1/2 h-px w-full origin-center -rotate-45 bg-white" />
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MandalaGame;
