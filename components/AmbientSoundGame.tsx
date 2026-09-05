import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CloudRain, Waves, Wind, Flame, Bell, Timer, Play, Pause, Volume2 } from 'lucide-react';

interface Props {
  onBack: () => void;
}

type SoundType = 'RAIN' | 'WAVES' | 'WIND' | 'FIRE' | 'BOWL';

interface SoundState {
    active: boolean;
    volume: number; // 0 to 1
}

const defaultVolumes: Record<SoundType, number> = {
    RAIN: 0.5,
    WAVES: 0.5,
    WIND: 0.3,
    FIRE: 0.6,
    BOWL: 0.4
};

const AmbientSoundGame: React.FC<Props> = ({ onBack }) => {
  const [sounds, setSounds] = useState<Record<SoundType, SoundState>>({
      RAIN: { active: false, volume: defaultVolumes.RAIN },
      WAVES: { active: false, volume: defaultVolumes.WAVES },
      WIND: { active: false, volume: defaultVolumes.WIND },
      FIRE: { active: false, volume: defaultVolumes.FIRE },
      BOWL: { active: false, volume: defaultVolumes.BOWL },
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Store node references for each sound to modify volume or stop them
  const nodesRef = useRef<Record<SoundType, { 
      source: AudioScheduledSourceNode | null, 
      gain: GainNode | null,
      customNodes?: any[]
  }>>({
      RAIN: { source: null, gain: null },
      WAVES: { source: null, gain: null },
      WIND: { source: null, gain: null },
      FIRE: { source: null, gain: null },
      BOWL: { source: null, gain: null }
  });

  useEffect(() => {
    return () => {
      pauseAllSounds();
      if (audioCtxRef.current) {
        void audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
      let timer: any;
      if (isPlaying && timeLeft !== null && timeLeft > 0) {
          timer = setInterval(() => {
              setTimeLeft(t => {
                  if (t && t <= 1) {
                      setIsPlaying(false);
                      return null;
                  }
                  return t ? t - 1 : null;
              });
          }, 1000);
      }
      return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  // Master Play/Pause effect
  useEffect(() => {
      if (isPlaying) {
          startActiveSounds();
      } else {
          pauseAllSounds();
      }
  }, [isPlaying]);

  // Volume update effect
  useEffect(() => {
      if (!audioCtxRef.current) return;
      Object.keys(sounds).forEach((key) => {
          const type = key as SoundType;
          const gainNode = nodesRef.current[type].gain;
          if (gainNode) {
              gainNode.gain.setTargetAtTime(sounds[type].active ? sounds[type].volume : 0, audioCtxRef.current!.currentTime, 0.1);
          }
      });
  }, [sounds]);

  const initAudio = () => {
      if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
  };

  const createNoiseBuffer = (type: 'white' | 'brown' | 'pink', ctx: AudioContext) => {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds loop
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      
      if (type === 'brown') {
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      } else if (type === 'pink') {
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.11; // compensate gain
          b6 = white * 0.115926;
      } else {
        output[i] = white;
      }
    }
    return buffer;
  };

  const stopSoundNode = (type: SoundType) => {
      const node = nodesRef.current[type];
      if (node.source) {
          try { node.source.stop(); } catch(e) {}
          node.source.disconnect();
          node.source = null;
      }
      if (node.customNodes) {
          node.customNodes.forEach(n => {
              try { n.stop(); } catch(e) {}
              n.disconnect();
          });
          node.customNodes = [];
      }
      if (node.gain) {
          node.gain.disconnect();
          node.gain = null;
      }
  };

  const pauseAllSounds = () => {
      Object.keys(nodesRef.current).forEach(key => {
          stopSoundNode(key as SoundType);
      });
  };

  const stopAllSounds = () => {
      pauseAllSounds();
      setSounds(prev => Object.keys(prev).reduce((next, key) => {
          const type = key as SoundType;
          next[type] = { ...prev[type], active: false };
          return next;
      }, {} as Record<SoundType, SoundState>));
  };

  const handleBack = () => {
      stopAllSounds();
      if (audioCtxRef.current) {
          void audioCtxRef.current.close();
          audioCtxRef.current = null;
      }
      onBack();
  };

  const startActiveSounds = () => {
      const ctx = initAudio();
      Object.keys(sounds).forEach(key => {
          const type = key as SoundType;
          if (sounds[type].active && !nodesRef.current[type].source) {
              buildSoundGenerator(type, ctx);
          }
      });
  };

  const buildSoundGenerator = (type: SoundType, ctx: AudioContext) => {
      // Ensure any existing node is cleaned up
      stopSoundNode(type);

      const gain = ctx.createGain();
      gain.gain.value = sounds[type].volume;
      gain.connect(ctx.destination);
      nodesRef.current[type].gain = gain;
      nodesRef.current[type].customNodes = [];

      let sourceNode: AudioScheduledSourceNode | null = null;

      if (type === 'RAIN') {
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer('pink', ctx);
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1000;
          
          noise.connect(filter);
          filter.connect(gain);
          noise.start();
          sourceNode = noise;

      } else if (type === 'WAVES') {
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer('brown', ctx);
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 400;
          
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.1; // 10s period
          
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 300;
          
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          
          const ampLfo = ctx.createOscillator();
          ampLfo.type = 'sine';
          ampLfo.frequency.value = 0.1;
          
          const ampLfoGain = ctx.createGain();
          ampLfoGain.gain.value = 0.5;
          
          const waveGain = ctx.createGain();
          waveGain.gain.value = 0.5; // Base amplitude
          
          ampLfo.connect(ampLfoGain);
          ampLfoGain.connect(waveGain.gain);
          
          noise.connect(filter);
          filter.connect(waveGain);
          waveGain.connect(gain);
          
          noise.start();
          lfo.start();
          ampLfo.start();
          sourceNode = noise;
          nodesRef.current[type].customNodes?.push(lfo, ampLfo);

      } else if (type === 'WIND') {
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer('pink', ctx);
          noise.loop = true;
          
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 400;
          filter.Q.value = 0.5;
          
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.05; // 20s period
          
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 600;
          
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);

          const ampLfo = ctx.createOscillator();
          ampLfo.type = 'sine';
          ampLfo.frequency.value = 0.08;
          const ampLfoGain = ctx.createGain();
          ampLfoGain.gain.value = 0.3;
          
          const windGain = ctx.createGain();
          windGain.gain.value = 0.7;

          ampLfo.connect(ampLfoGain);
          ampLfoGain.connect(windGain.gain);
          
          noise.connect(filter);
          filter.connect(windGain);
          windGain.connect(gain);
          
          noise.start();
          lfo.start();
          ampLfo.start();
          sourceNode = noise;
          nodesRef.current[type].customNodes?.push(lfo, ampLfo);

      } else if (type === 'FIRE') {
          // Base rumble
          const noise = ctx.createBufferSource();
          noise.buffer = createNoiseBuffer('brown', ctx);
          noise.loop = true;
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 100;
          
          // Crackles using a script processor (legacy but easy for random spikes) or just lfo modulated white noise
          // We'll use white noise heavily filtered and clipped
          const crackleNoise = ctx.createBufferSource();
          crackleNoise.buffer = createNoiseBuffer('white', ctx);
          crackleNoise.loop = true;
          
          const crackleFilter = ctx.createBiquadFilter();
          crackleFilter.type = 'highpass';
          crackleFilter.frequency.value = 2000;
          
          // Modulate crackle volume with random LFO
          const crackleLfo = ctx.createOscillator();
          crackleLfo.type = 'square';
          crackleLfo.frequency.value = 5; // fast rate
          
          const crackleGain = ctx.createGain();
          crackleGain.gain.value = 0.1;

          crackleNoise.connect(crackleFilter);
          crackleFilter.connect(crackleGain);
          crackleGain.connect(gain);

          noise.connect(filter);
          filter.connect(gain);

          noise.start();
          crackleNoise.start();
          crackleLfo.start();
          sourceNode = noise;
          nodesRef.current[type].customNodes?.push(crackleNoise, crackleLfo);

      } else if (type === 'BOWL') {
          // Softer, drone-like singing bowl
          const osc1 = ctx.createOscillator();
          osc1.type = 'sine';
          osc1.frequency.value = 200; // Base freq
          
          const osc2 = ctx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.value = 202; // Slight detune for beating
          
          const osc3 = ctx.createOscillator();
          osc3.type = 'sine';
          osc3.frequency.value = 400; // Harmonic
          
          const droneGain = ctx.createGain();
          droneGain.gain.value = 0.4;
          
          // Slow amplitude modulation for the whole drone
          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.05; // 20s period
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 0.2;
          
          lfo.connect(lfoGain);
          lfoGain.connect(droneGain.gain);

          osc1.connect(droneGain);
          osc2.connect(droneGain);
          
          // Harmonic is quieter
          const harmonicGain = ctx.createGain();
          harmonicGain.gain.value = 0.1;
          osc3.connect(harmonicGain);
          harmonicGain.connect(droneGain);

          droneGain.connect(gain);
          
          osc1.start();
          osc2.start();
          osc3.start();
          lfo.start();

          sourceNode = osc1;
          nodesRef.current[type].customNodes?.push(osc2, osc3, lfo);
      }

      nodesRef.current[type].source = sourceNode;
  };

  const toggleSound = (type: SoundType) => {
      const nextActive = !sounds[type].active;
      setSounds(prev => ({ ...prev, [type]: { ...prev[type], active: nextActive } }));

      if (!isPlaying && nextActive) {
          // If activating a sound while paused, preserve the existing auto-play behavior.
          setTimeout(() => setIsPlaying(true), 0);
      }

      if (isPlaying) {
          if (nextActive) {
              const ctx = initAudio();
              buildSoundGenerator(type, ctx);
          } else {
              stopSoundNode(type);
          }
      }
  };

  const handleVolumeChange = (type: SoundType, val: number) => {
      setSounds(prev => ({ ...prev, [type]: { ...prev[type], volume: val } }));
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timerOptions = [5, 15, 30, 60]; // minutes

  return (
    <div
      data-ambient-root
      className="ambient-root h-[100dvh] min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-900 text-slate-100"
    >
      <div data-ambient-safe-stage className="app-safe-screen h-full w-full">
        <div
          data-ambient-layout
          className="ambient-layout relative flex h-full min-h-0 w-full flex-col overflow-hidden font-sans"
        >
          <button
            data-ambient-back
            type="button"
            onClick={handleBack}
            aria-label="返回遊戲選單"
            className="ambient-back absolute z-20 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-slate-800 text-slate-300 shadow-md transition-colors hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>

          <main className="ambient-main flex min-h-0 flex-1 flex-col">
            <header className="ambient-header text-center">
              <h2 className="ambient-title font-bold tracking-wider text-slate-200">環境白噪音</h2>
              <p className="ambient-helper text-slate-400">混合多種自然聲音，創造專屬的平靜空間。</p>
            </header>

            <section data-ambient-sounds className="ambient-sounds min-h-0">
              <SoundControl type="RAIN" icon={<CloudRain />} label="落雨" state={sounds.RAIN} onToggle={() => toggleSound('RAIN')} onVolume={(v) => handleVolumeChange('RAIN', v)} />
              <SoundControl type="WAVES" icon={<Waves />} label="海浪" state={sounds.WAVES} onToggle={() => toggleSound('WAVES')} onVolume={(v) => handleVolumeChange('WAVES', v)} />
              <SoundControl type="WIND" icon={<Wind />} label="微風" state={sounds.WIND} onToggle={() => toggleSound('WIND')} onVolume={(v) => handleVolumeChange('WIND', v)} />
              <SoundControl type="FIRE" icon={<Flame />} label="營火" state={sounds.FIRE} onToggle={() => toggleSound('FIRE')} onVolume={(v) => handleVolumeChange('FIRE', v)} />
              <SoundControl type="BOWL" icon={<Bell />} label="頌缽" state={sounds.BOWL} onToggle={() => toggleSound('BOWL')} onVolume={(v) => handleVolumeChange('BOWL', v)} />
            </section>
          </main>

          <aside data-ambient-session className="ambient-session rounded-3xl border border-slate-700 bg-slate-800/60 backdrop-blur-md">
            <div className="ambient-timer-header flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold text-slate-300"><Timer size={18} />計時</span>
              <span className="ambient-time font-mono text-slate-300">{timeLeft !== null ? formatTime(timeLeft) : '--:--'}</span>
            </div>

            <div className="ambient-timer-options" aria-label="播放時間">
              {timerOptions.map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setTimeLeft(mins * 60);
                    if (!isPlaying && (Object.values(sounds) as SoundState[]).some(s => s.active)) {
                      setIsPlaying(true);
                    }
                  }}
                  aria-label={`設定 ${mins} 分鐘計時`}
                  aria-pressed={timeLeft !== null && timeLeft <= mins * 60 && timeLeft > (mins - 5) * 60}
                  className={`ambient-timer-option min-h-11 rounded-full text-sm font-medium transition-colors ${timeLeft !== null && timeLeft <= mins * 60 && timeLeft > (mins - 5) * 60 ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                >
                  {mins}m
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTimeLeft(null)}
                aria-label="設定無限播放"
                aria-pressed={timeLeft === null}
                className={`ambient-timer-option min-h-11 rounded-full text-sm font-medium transition-colors ${timeLeft === null ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
              >
                無限
              </button>
            </div>

            <div data-ambient-master className="ambient-master">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? '暫停環境音' : '開始播放環境音'}
                className={`ambient-master-button min-h-12 w-full rounded-2xl px-4 font-bold shadow-lg transition-colors ${isPlaying ? 'bg-slate-700 text-indigo-300 hover:bg-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                <span>{isPlaying ? '暫停環境音' : '開始播放環境音'}</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const SoundControl = ({ type, icon, label, state, onToggle, onVolume }: { type: SoundType, icon: React.ReactNode, label: string, state: SoundState, onToggle: () => void, onVolume: (v: number) => void }) => {
    return (
        <div data-ambient-sound={type} className={`ambient-sound flex min-w-0 flex-col rounded-2xl border transition-colors ${state.active ? 'bg-slate-800 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60'}`}>
            <button
                type="button"
                data-ambient-toggle
                onClick={onToggle}
                aria-label={`切換${label}`}
                aria-pressed={state.active}
                className={`ambient-sound-toggle inline-flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-xl text-left font-medium tracking-wide transition-colors ${state.active ? 'text-indigo-300' : 'text-slate-300 hover:text-white'}`}
            >
                <span className="flex min-w-0 items-center gap-2">
                    <span className="ambient-sound-icon inline-flex shrink-0 items-center justify-center rounded-full bg-slate-900/60">{icon}</span>
                    <span className="truncate">{label}</span>
                </span>
                <span className="ambient-sound-state shrink-0 rounded-full px-2 py-1 text-xs font-bold">{state.active ? '開' : '關'}</span>
            </button>

            <label className="ambient-volume-row flex min-w-0 items-center gap-2">
                <Volume2 size={16} aria-hidden="true" className={state.active ? 'text-indigo-400' : 'text-slate-600'} />
                <input
                    type="range"
                    min="0" max="1" step="0.01"
                    value={state.volume}
                    onChange={(e) => onVolume(parseFloat(e.target.value))}
                    disabled={!state.active}
                    aria-label={`${label}音量`}
                    className={`ambient-volume min-w-0 flex-1 accent-indigo-500 ${state.active ? '' : 'opacity-50'}`}
                />
                <span className="ambient-volume-value w-9 shrink-0 text-right text-xs tabular-nums text-slate-500">{Math.round(state.volume * 100)}%</span>
            </label>
        </div>
    );
};

export default AmbientSoundGame;
