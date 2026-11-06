/**
 * Artistically. - Tactile Audio & Lo-Fi Atmosphere Engine
 * Pure Web Audio API synthetic sound design for responsive, playful feedback
 * plus cozy lo-fi background ambience ("Chrysanthemum Tea" & "Shoreline by Filo").
 */

import { LOFI_TRACKS } from './config.js';

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.lofiPlaying = false;
    this.currentTrackIndex = 0;
    this.lofiTimer = null;
    this.chordStep = 0;
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
    if (this.muted && this.lofiPlaying) {
      this.pauseLofi();
    }
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

  bell() {
    this.tone([1046.5, 1318.5, 1567.98, 2093], 1.2, 0.07, 'sine');
  }

  pop(frequency = 520) {
    this.tone([frequency], 0.09, 0.06, 'triangle');
  }

  tick() {
    this.tone([740], 0.04, 0.03, 'sine');
  }

  celebrate() {
    this.tone([523.25, 659.25, 783.99, 1046.5], 0.8, 0.08, 'sine');
  }

  /* ---------------- Lo-Fi Background Music Atmosphere ---------------- */
  // Curated chord progressions matching "Chrysanthemum Tea" & "Shoreline by Filo"
  getTrackProgressions() {
    return [
      // Track 0: Chrysanthemum Tea (F#maj7 - Bmaj7 - Ebm7 - C#)
      [
        [185.00, 277.18, 349.23, 440.00], // F#maj7
        [246.94, 311.13, 369.99, 493.88], // Bmaj7
        [155.56, 233.08, 277.18, 369.99], // Ebm7
        [138.59, 207.65, 277.18, 329.63]  // C#sus
      ],
      // Track 1: Shoreline by Filo (Ebmaj7 - Gm7 - Abmaj7 - Bb7)
      [
        [155.56, 233.08, 293.66, 349.23], // Ebmaj7
        [196.00, 293.66, 349.23, 440.00], // Gm7
        [207.65, 261.63, 329.63, 415.30], // Abmaj7
        [233.08, 293.66, 349.23, 466.16]  // Bb7
      ],
      // Track 2: Velvet Chenille Blooms (Abmaj7 - Fm7 - Bbm7 - Eb7)
      [
        [207.65, 261.63, 311.13, 415.30], // Abmaj7
        [174.61, 261.63, 311.13, 392.00], // Fm7
        [233.08, 277.18, 349.23, 466.16], // Bbm7
        [155.56, 233.08, 311.13, 369.99]  // Eb7
      ]
    ];
  }

  playWarmLoFiChord(notes, duration = 3.6) {
    if (this.muted) return;
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Filter for warm lo-fi tape rolloff
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(820, now);
      filter.connect(ctx.destination);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm Rhodes-like triangle with slight tape vibrato detune
        osc.type = idx === 0 ? 'sine' : 'triangle';
        const detune = (idx % 2 === 0 ? 1 : -1) * (2.5 + Math.random() * 2);
        osc.frequency.setValueAtTime(freq + detune * 0.1, now);

        // Mellow envelope
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.024, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch {}
  }

  startLoFiSequence() {
    if (this.lofiTimer) clearInterval(this.lofiTimer);
    const progressions = this.getTrackProgressions();
    const chords = progressions[this.currentTrackIndex % progressions.length];

    const playStep = () => {
      if (!this.lofiPlaying) return;
      const chord = chords[this.chordStep % chords.length];
      this.playWarmLoFiChord(chord, 3.8);
      this.chordStep++;
    };

    playStep();
    this.lofiTimer = setInterval(playStep, 4000);
  }

  toggleLofi() {
    this.ensureContext();
    this.lofiPlaying = !this.lofiPlaying;
    if (this.lofiPlaying) {
      if (this.muted) {
        this.setMuted(false);
      }
      this.startLoFiSequence();
    } else {
      this.pauseLofi();
    }
    return this.lofiPlaying;
  }

  pauseLofi() {
    this.lofiPlaying = false;
    if (this.lofiTimer) {
      clearInterval(this.lofiTimer);
      this.lofiTimer = null;
    }
  }

  nextTrack() {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % LOFI_TRACKS.length;
    this.chordStep = 0;
    if (this.lofiPlaying) {
      this.startLoFiSequence();
    }
    return this.getCurrentTrack();
  }

  getCurrentTrack() {
    return LOFI_TRACKS[this.currentTrackIndex % LOFI_TRACKS.length];
  }
}

export const audio = new AudioEngine();

