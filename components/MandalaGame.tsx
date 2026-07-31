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
              alert('無法存取麥克風，請確認權限設定。');
          }
      }
  };

  const stopRecording = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioCtxRef.current) {
          audioCtxRef.current.close();
      }
      setIsRecording(false);
  };

  const drawVoice = () => {
      if (!analyserRef.current || !canvasRef.current || mode !== 'VOICE') return;
      
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

      requestRef.current = requestAnimationFrame(drawVoice);
  };

  useEffect(() => {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 p-4 font-sans text-slate-100 touch-none">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-white/10 backdrop-blur-md rounded-full shadow-md text-white hover:bg-white/20 z-50 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full h-[90dvh] sm:h-auto sm:max-h-[90dvh] landscape:h-[95dvh] max-w-6xl mt-12 landscape:mt-0 bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-2xl border border-slate-800 flex flex-col landscape:flex-row items-center landscape:items-stretch justify-center gap-4 landscape:gap-8 relative z-10">
        
        <div className="flex flex-col items-center justify-center w-full landscape:w-72 flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-200 mb-4 tracking-wider">紓壓畫板</h2>
            
            {/* Mode Toggle */}
            <div className="flex bg-slate-800 p-1 rounded-full mb-4 landscape:mb-8 w-full max-w-[240px]">
                <button 
                    onClick={() => setMode('DRAW')}
                    className={`flex-1 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'DRAW' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <PenTool size={16} /> 手繪
                </button>
                <button 
                    onClick={() => setMode('VOICE')}
                    className={`flex-1 py-2 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'VOICE' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <Mic size={16} /> 聲控
                </button>
            </div>

            <div className="hidden landscape:flex flex-col w-full items-center justify-center">
                {mode === 'DRAW' ? (
                    <div className="flex flex-col w-full gap-6">
                        <div className="flex justify-center gap-2 sm:gap-3">
                            {colors.map(c => (
                                <button 
                                    key={c}
                                    onClick={() => setColor(c)}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full shadow-sm transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c }}
                                ></button>
                            ))}
                        </div>
                        <div className="flex flex-col gap-4 px-2">
                            <div className="flex justify-center items-center gap-4 text-slate-400">
                                <Paintbrush size={18} />
                                <input 
                                    type="range" 
                                    min="1" max="10" 
                                    value={brushSize} 
                                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                    className="w-32 accent-indigo-500"
                                />
                            </div>
                            <div className="flex justify-center gap-6 mt-2">
                                <button onClick={initCanvas} className="p-3 text-slate-400 hover:text-slate-200 transition-colors bg-slate-800 rounded-full">
                                    <Eraser size={20} />
                                </button>
                                <button onClick={handleDownload} className="p-3 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full">
                                    <Download size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center w-full gap-6">
                        <p className="text-slate-400 text-sm text-center mb-2">
                            發出聲音，音量決定半徑與粗細，音高決定顏色。<br/>(請允許麥克風權限)
                        </p>
                        <div className="flex items-center gap-6">
                            <button onClick={initCanvas} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                <RefreshCcw size={20} />
                            </button>
                            
                            <button 
                                onClick={toggleRecording}
                                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105'}`}
                            >
                                {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                            </button>
                            
                            <button onClick={handleDownload} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div className="flex-1 w-full h-full flex justify-center items-center min-h-0 min-w-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-2 ring-slate-800 bg-slate-900 w-full max-w-[400px] landscape:max-w-full landscape:max-h-full aspect-square">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={600}
                    className={`w-full h-full object-contain bg-slate-900 ${mode === 'DRAW' ? 'cursor-crosshair' : 'cursor-default'}`}
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseOut={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                />
                {mode === 'DRAW' && (
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white"></div>
                        <div className="absolute left-1/2 top-0 w-px h-full bg-white"></div>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white rotate-45 origin-center"></div>
                        <div className="absolute top-1/2 left-0 w-full h-px bg-white -rotate-45 origin-center"></div>
                    </div>
                )}
            </div>
        </div>

        <div className="landscape:hidden w-full max-w-[400px]">
            {mode === 'DRAW' ? (
                <div className="flex flex-col w-full gap-4">
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {colors.map(c => (
                            <button 
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 rounded-full shadow-sm transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-slate-900 ring-indigo-500' : 'hover:scale-110'}`}
                                style={{ backgroundColor: c }}
                            ></button>
                        ))}
                    </div>
                    <div className="flex justify-between items-center gap-4 px-2 mt-2">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Paintbrush size={18} />
                            <input 
                                type="range" 
                                min="1" max="10" 
                                value={brushSize} 
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-24 accent-indigo-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={initCanvas} className="p-2 text-slate-400 hover:text-slate-200 transition-colors bg-slate-800 rounded-full">
                                <Eraser size={18} />
                            </button>
                            <button onClick={handleDownload} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-full">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center w-full gap-4">
                    <p className="text-slate-400 text-sm text-center mb-2">
                        發出聲音，音量決定半徑與粗細，音高決定顏色。<br/>(請允許麥克風權限)
                    </p>
                    <div className="flex items-center gap-6">
                        <button onClick={initCanvas} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <RefreshCcw size={20} />
                        </button>
                        
                        <button 
                            onClick={toggleRecording}
                            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105'}`}
                        >
                            {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
                        </button>
                        
                        <button onClick={handleDownload} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <Download size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default MandalaGame;
