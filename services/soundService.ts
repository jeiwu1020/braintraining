
class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  // Nodes used for the generated "relaxation ambient" loop (see startRelaxAmbient/stopRelaxAmbient)
  private ambientNodes: {
    oscillators: OscillatorNode[];
    noiseSource: AudioBufferSourceNode;
    masterGain: GainNode;
    lfo: OscillatorNode;
  } | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      // Use standard or webkit prefix for broader compatibility
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  // Allow user to toggle sound if needed (optional feature for future)
  toggleMute() {
    this.isMuted = !this.isMuted;
  }

  // Safe play wrapper
  playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      // Resume context if suspended (browser policy requires user interaction)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(e => console.error(e));
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = type;
      osc.frequency.value = freq;

      const now = ctx.currentTime + startTime;
      
      // Envelope to avoid clicking sounds
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.05); // Attack
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }

  // --- Standard UI Sounds ---

  playCorrect() {
    // High pitched "Ding" - E5 then C6
    const ctx = this.getContext();
    if (this.isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator(); const gain1 = ctx.createGain();
    osc1.connect(gain1); gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0, now); gain1.gain.linearRampToValueAtTime(0.1, now + 0.05); gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.start(now); osc1.stop(now + 0.3);

    const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(1046.50, now + 0.1);
    gain2.gain.setValueAtTime(0, now + 0.1); gain2.gain.linearRampToValueAtTime(0.1, now + 0.15); gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.start(now + 0.1); osc2.stop(now + 0.6);
  }

  playWrong() {
    // Low pitched "Buzz"
    const ctx = this.getContext();
    if (this.isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
  }

  playWin() {
    const ctx = this.getContext();
    if (this.isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const notes = [{ f: 523.25, t: 0 }, { f: 659.25, t: 0.15 }, { f: 783.99, t: 0.30 }, { f: 1046.50, t: 0.45 }];
    notes.forEach(note => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'triangle'; osc.frequency.value = note.f;
        const startTime = now + note.t;
        gain.gain.setValueAtTime(0, startTime); gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
        osc.start(startTime); osc.stop(startTime + 0.5);
    });
  }

  playTilePlace() {
    const ctx = this.getContext();
    if (this.isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playCardFlip() {
    const ctx = this.getContext();
    if (this.isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // --- Game Specific Pattern Sounds (Longer & More Varieties) ---

  playGameSound(type: 'HIGH' | 'LOW' | 'RISE' | 'FALL' | 'ALARM' | 'GAME' | 'BOUNCE' | 'MAGIC' | 'TELEPHONE') {
    const ctx = this.getContext();
    if (this.isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
        case 'HIGH': // High Bird-like chirp (Longer)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.linearRampToValueAtTime(1600, now + 0.2);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.4);
            osc.frequency.linearRampToValueAtTime(1600, now + 0.6);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.8);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            osc.start(now); osc.stop(now + 1.5);
            break;
        case 'LOW': // Low Drum/Bass (Longer)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(100, now);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
            osc.start(now); osc.stop(now + 1.5);
            break;
        case 'RISE': // Whistle up (Longer)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 1.5);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.5);
            osc.start(now); osc.stop(now + 1.5);
            break;
        case 'FALL': // Slide down (Longer)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 1.5);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.5);
            osc.start(now); osc.stop(now + 1.5);
            break;
        case 'ALARM': // Two tone alarm (Longer loop)
            osc.type = 'square';
            // Beep 1
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.setValueAtTime(600, now + 0.3);
            // Beep 2
            osc.frequency.setValueAtTime(800, now + 0.6);
            osc.frequency.setValueAtTime(600, now + 0.9);
            // Beep 3
            osc.frequency.setValueAtTime(800, now + 1.2);
            osc.frequency.setValueAtTime(600, now + 1.5);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.8);
            osc.start(now); osc.stop(now + 1.8);
            break;
        case 'GAME': // 8-bit jump (Longer sequence)
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.2); // Jump 1
            osc.frequency.setValueAtTime(200, now + 0.3);
            osc.frequency.linearRampToValueAtTime(700, now + 0.5); // Jump 2
            osc.frequency.setValueAtTime(200, now + 0.6);
            osc.frequency.linearRampToValueAtTime(800, now + 0.9); // Jump 3
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.0);
            osc.start(now); osc.stop(now + 1.0);
            break;
        case 'BOUNCE': // Frequency modulation (boing)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.3); // Drop
            osc.frequency.setValueAtTime(300, now + 0.3);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.5); // Drop 2
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.8);
            osc.start(now); osc.stop(now + 0.8);
            break;
        case 'MAGIC': // Sparkly Arpeggio
            osc.type = 'triangle';
            // C5, E5, G5, C6, E6
            [523, 659, 784, 1046, 1318].forEach((f, i) => {
                osc.frequency.setValueAtTime(f, now + i * 0.2);
            });
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.2);
            osc.start(now); osc.stop(now + 1.2);
            break;
        case 'TELEPHONE': // Trill
            osc.type = 'square';
            const startTime = now;
            for(let i=0; i<15; i++) {
                osc.frequency.setValueAtTime(i % 2 === 0 ? 800 : 1000, startTime + i * 0.1);
            }
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.5);
            osc.start(now); osc.stop(now + 1.5);
            break;
    }
  }

  // --- Relaxation Ambient Loop (replaces the old static /relaxing-music.mp3 file) ---
  // Generated in real time with the Web Audio API so there is no external audio file
  // that can be corrupted or fail to decode on a specific browser (e.g. iOS Safari).

  private createBrownNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
    const bufferSize = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brownian/red noise: integrate white noise then normalize, gives a soft "ocean/wind" texture
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  startRelaxAmbient() {
    if (this.ambientNodes) return; // already playing
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.error(e));
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.22, ctx.currentTime + 2);
    masterGain.connect(ctx.destination);

    // Slow "breathing" swell so the pad gently rises and falls (~10s cycle)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start();

    // Warm, low pad chord (soft sine layers, gently detuned)
    const freqs = [130.81, 164.81, 196.0, 261.63]; // C3, E3, G3, C4
    const oscillators: OscillatorNode[] = [];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      osc.detune.value = (i % 2 === 0 ? -4 : 4);
      const voiceGain = ctx.createGain();
      voiceGain.gain.value = 0.5 / freqs.length;
      osc.connect(voiceGain);
      voiceGain.connect(masterGain);
      osc.start();
      oscillators.push(osc);
    });

    // Soft looping brown noise bed for an ocean/wind-like texture
    const noiseBuffer = this.createBrownNoiseBuffer(ctx, 6);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 500;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.35;
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();

    this.ambientNodes = { oscillators, noiseSource, masterGain, lfo };
  }

  stopRelaxAmbient() {
    if (!this.ambientNodes) return;
    const ctx = this.getContext();
    const { oscillators, noiseSource, masterGain, lfo } = this.ambientNodes;
    const now = ctx.currentTime;
    // Fade out smoothly to avoid a click, then stop/disconnect all nodes
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + 0.6);

    setTimeout(() => {
      oscillators.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch (e) {} });
      try { lfo.stop(); lfo.disconnect(); } catch (e) {}
      try { noiseSource.stop(); noiseSource.disconnect(); } catch (e) {}
      try { masterGain.disconnect(); } catch (e) {}
    }, 700);

    this.ambientNodes = null;
  }

  setRelaxAmbientVolume(volume: number) {
    if (this.ambientNodes) {
      const ctx = this.getContext();
      this.ambientNodes.masterGain.gain.setTargetAtTime(volume, ctx.currentTime, 0.3);
    }
  }
}

export const soundService = new SoundService();
