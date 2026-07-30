import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CloudRain, Waves, Wind, Flame, TreePine, Bell, Timer, Play, Pause, Volume2 } from 'lucide-react';

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
      stopAllSounds();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
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
  };

  const pauseAllSounds = () => {
      Object.keys(nodesRef.current).forEach(key => {
          stopSoundNode(key as SoundType);
      });
  };

  const stopAllSounds = () => {
      pauseAllSounds();
      setSounds(prev => {
          const next = { ...prev };
          Object.keys(next).forEach(k => {
              next[k as SoundType].active = false;
          });
          return next;
      });
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
      setSounds(prev => {
          const next = { ...prev, [type]: { ...prev[type], active: !prev[type].active } };
          
          if (!isPlaying && Object.values(next).some(s => s.active)) {
              // If activating a sound while paused, auto-play
              setTimeout(() => setIsPlaying(true), 0);
          }
          
          if (isPlaying) {
              if (next[type].active) {
                  const ctx = initAudio();
                  buildSoundGenerator(type, ctx);
              } else {
                  stopSoundNode(type);
              }
          }
          
          return next;
      });
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
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-900 p-4 font-sans text-slate-100">
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-slate-800 rounded-full shadow-md text-slate-400 hover:bg-slate-700 hover:text-slate-200 z-50 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="w-full max-w-2xl text-center z-10 relative">
        <h2 className="text-3xl font-bold mb-4 tracking-wider text-slate-200">環境白噪音</h2>
        <p className="text-slate-400 mb-12">混合多種自然聲音，創造專屬的平靜空間。</p>

        {/* Sound Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <SoundControl type="RAIN" icon={<CloudRain />} label="落雨" state={sounds.RAIN} onToggle={() => toggleSound('RAIN')} onVolume={(v) => handleVolumeChange('RAIN', v)} />
            <SoundControl type="WAVES" icon={<Waves />} label="海浪" state={sounds.WAVES} onToggle={() => toggleSound('WAVES')} onVolume={(v) => handleVolumeChange('WAVES', v)} />
            <SoundControl type="WIND" icon={<Wind />} label="微風" state={sounds.WIND} onToggle={() => toggleSound('WIND')} onVolume={(v) => handleVolumeChange('WIND', v)} />
            <SoundControl type="FIRE" icon={<Flame />} label="營火" state={sounds.FIRE} onToggle={() => toggleSound('FIRE')} onVolume={(v) => handleVolumeChange('FIRE', v)} />
            <SoundControl type="BOWL" icon={<Bell />} label="頌缽" state={sounds.BOWL} onToggle={() => toggleSound('BOWL')} onVolume={(v) => handleVolumeChange('BOWL', v)} />
        </div>

        {/* Master Controls */}
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl border border-slate-700 flex flex-col items-center">
            
            <div className="flex gap-4 mb-6">
                {timerOptions.map(mins => (
                    <button
                        key={mins}
                        onClick={() => {
                            setTimeLeft(mins * 60);
                            if (!isPlaying && Object.values(sounds).some(s => s.active)) {
                                setIsPlaying(true);
                            }
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timeLeft && timeLeft <= mins * 60 && timeLeft > (mins - 5) * 60 ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                    >
                        {mins}m
                    </button>
                ))}
                <button
                    onClick={() => setTimeLeft(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timeLeft === null ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                >
                    無限
                </button>
            </div>

            <div className="flex items-center gap-8">
                <div className="text-xl font-mono text-slate-400 w-24 text-right">
                    {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                </div>
                
                <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${isPlaying ? 'bg-slate-700 text-indigo-400 hover:bg-slate-600' : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105'}`}
                >
                    {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
                </button>
                
                <div className="w-24"></div> {/* Spacer for balance */}
            </div>
        </div>

      </div>
    </div>
  );
};

const SoundControl = ({ type, icon, label, state, onToggle, onVolume }: { type: string, icon: React.ReactNode, label: string, state: SoundState, onToggle: () => void, onVolume: (v: number) => void }) => {
    return (
        <div className={`flex flex-col p-4 rounded-2xl border transition-colors ${state.active ? 'bg-slate-800 border-indigo-500/50' : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/60'}`}>
            <div className="flex items-center justify-between mb-4">
                <button 
                    onClick={onToggle}
                    className={`flex items-center gap-3 transition-colors ${state.active ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'}`}
                >
                    <div className="p-2 rounded-full bg-slate-900/50">
                        {icon}
                    </div>
                    <span className="font-medium tracking-wide">{label}</span>
                </button>
                
                {/* Custom Toggle Switch */}
                <button 
                    onClick={onToggle}
                    className={`relative w-12 h-6 rounded-full transition-colors ${state.active ? 'bg-indigo-500' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${state.active ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>
            
            <div className="flex items-center gap-3 opacity-80">
                <Volume2 size={16} className={state.active ? 'text-indigo-400' : 'text-slate-600'} />
                <input 
                    type="range" 
                    min="0" max="1" step="0.01" 
                    value={state.volume} 
                    onChange={(e) => onVolume(parseFloat(e.target.value))}
                    disabled={!state.active}
                    className={`flex-1 h-2 rounded-full appearance-none bg-slate-900 outline-none ${state.active ? 'accent-indigo-500' : 'opacity-50'}`}
                />
            </div>
        </div>
    );
};

export default AmbientSoundGame;
