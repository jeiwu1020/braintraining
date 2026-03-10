
class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

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
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
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
}

export const soundService = new SoundService();
