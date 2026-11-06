/**
 * Fuzzy Petal Shop - Tactile Audio Engine
 * Pure Web Audio API synthetic sound design for responsive, playful feedback.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initMutePreference();
  }

  initMutePreference() {
    try {
      this.muted = localStorage.getItem('fp-muted') === '1';
    } catch {
      this.muted = false;
    }
  }

  ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = Boolean(muted);
    try {
      localStorage.setItem('fp-muted', this.muted ? '1' : '0');
    } catch {}
  }

  toggleMute() {
    this.setMuted(!this.muted);
    if (!this.muted) {
      this.pop();
    }
    return this.muted;
  }

  tone(freqs, duration = 0.2, volume = 0.05, type = 'sine') {
    if (this.muted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {}
  }

  /**
   * Door opening chime
   */
  bell() {
    this.tone([1046.5, 1318.5, 1567.98, 2093], 1.2, 0.07, 'sine');
  }

  /**
   * Tactile pop for buttons & swatches
   */
  pop(frequency = 520) {
    this.tone([frequency], 0.09, 0.06, 'triangle');
  }

  /**
   * Slider / counter step tick
   */
  tick() {
    this.tone([740], 0.04, 0.03, 'sine');
  }

  /**
   * Order confirmation fanfare
   */
  celebrate() {
    this.tone([523.25, 659.25, 783.99, 1046.5], 0.8, 0.08, 'sine');
  }
}

export const audio = new AudioEngine();

