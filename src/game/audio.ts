/**
 * Web Audio API synthesizer for Sky Hopper
 * Procedurally generates retro/arcade sound effects and a cheerful background music loop.
 * Zero external audio files required, runs 100% locally and offline.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private currentStep: number = 0;

  constructor() {
    const savedMute = localStorage.getItem('skyhopper_muted');
    this.isMuted = savedMute === 'true';
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master FX gain
      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.value = this.isMuted ? 0 : 0.45;
      this.sfxGainNode.connect(this.ctx.destination);

      // Music gain
      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.value = this.isMuted ? 0 : 0.16;
      this.musicGainNode.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public unlock() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('skyhopper_muted', String(muted));

    if (this.sfxGainNode) {
      this.sfxGainNode.gain.setValueAtTime(muted ? 0 : 0.45, this.ctx?.currentTime || 0);
    }
    if (this.musicGainNode) {
      this.musicGainNode.gain.setValueAtTime(muted ? 0 : 0.16, this.ctx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.unlock();
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Wing flap sound: soft wind swoosh + cheerful chirp
   */
  public playFlap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;

    // Chirp/swoosh oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.12);

    // Subtle wing flutter noise
    this.playNoiseFlutter(t);
  }

  private playNoiseFlutter(t: number) {
    if (!this.ctx || !this.sfxGainNode) return;
    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGainNode);

    noise.start(t);
    noise.stop(t + 0.06);
  }

  /**
   * Score Point sound: clean bright coin chime
   */
  public playPoint() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const notes = [659.25, 987.77]; // E5, B5 bright arpeggio

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0.35, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.22);
    });
  }

  /**
   * Collision sound: thud + cartoon spring crash
   */
  public playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;

    // Low pitch punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.25);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.28);

    // Impact crunch noise
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.05));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGainNode);

    noise.start(t);
    noise.stop(t + 0.18);
  }

  /**
   * Triumphant fanfare for new high score
   */
  public playNewBest() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const fanfare = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.5, d: 0.35 }, // C6
    ];

    let start = t;
    fanfare.forEach((n) => {
      if (!this.ctx || !this.sfxGainNode) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.4, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(start);
      osc.stop(start + n.d);

      start += n.d * 0.9;
    });
  }

  /**
   * Clean UI button tap
   */
  public playButton() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Cheerful, lightweight chiptune background music loop
   * Synthesized in real-time with zero audio files
   */
  public startMusic() {
    if (this.isBgmPlaying) return;
    this.initContext();
    this.isBgmPlaying = true;
    this.currentStep = 0;
    this.scheduleNextBeat();
  }

  public stopMusic() {
    this.isBgmPlaying = false;
    if (this.bgmTimer !== null) {
      window.clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private scheduleNextBeat() {
    if (!this.isBgmPlaying) return;

    // 130 BPM, 16th note steps = (60 / 130) / 4 ~ 115ms per step
    const stepDuration = 0.125;
    this.playBgmStep(this.currentStep);
    this.currentStep = (this.currentStep + 1) % 64;

    this.bgmTimer = window.setTimeout(() => {
      this.scheduleNextBeat();
    }, stepDuration * 1000);
  }

  private playBgmStep(step: number) {
    if (!this.ctx || !this.musicGainNode || this.isMuted) return;

    const t = this.ctx.currentTime;
    const stepDuration = 0.12;

    // Chord progression: C - G - Am - F (16 steps each = 64 total)
    // Melody notes (pentatonic friendly for sunny arcade vibe)
    const melodyPattern: (number | null)[] = [
      523.25, null, 659.25, 783.99,  null, 659.25, 523.25, null, // bar 1 (C)
      783.99, null, 880.00, 783.99,  null, 659.25, 587.33, null, // bar 2 (G)
      659.25, null, 783.99, 880.00,  null, 1046.5, 880.00, null, // bar 3 (Am)
      783.99, null, 659.25, 587.33,  523.25, null, 587.33, null, // bar 4 (F)

      523.25, 659.25, null, 783.99,  null, 880.00, 783.99, null, // bar 5
      987.77, null, 880.00, 783.99,  659.25, null, 587.33, null, // bar 6
      659.25, 783.99, 880.00, null,  1046.5, null, 880.00, 783.99, // bar 7
      659.25, null, 587.33, 523.25,  null, null, null, null      // bar 8
    ];

    const bassNotes = [
      130.81, // C3
      98.00,  // G2
      110.00, // A2
      87.31   // F2
    ];

    const currentChordIdx = Math.floor(step / 16);
    const bassFreq = bassNotes[currentChordIdx];

    // Bass note on steps 0, 4, 8, 12 of each 16-step bar
    if (step % 4 === 0) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, t);

      bassGain.gain.setValueAtTime(0.22, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGainNode);

      bassOsc.start(t);
      bassOsc.stop(t + 0.28);
    }

    // Melody note
    const note = melodyPattern[step];
    if (note) {
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();

      leadOsc.type = 'sine';
      leadOsc.frequency.setValueAtTime(note, t);

      leadGain.gain.setValueAtTime(0.12, t);
      leadGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.95);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGainNode);

      leadOsc.start(t);
      leadOsc.stop(t + stepDuration);
    }

    // Gentle hi-hat on every off-beat (step % 2 === 1)
    if (step % 2 === 1) {
      const bufferSize = this.ctx.sampleRate * 0.02;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      const hat = this.ctx.createBufferSource();
      hat.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, t);

      const hatGain = this.ctx.createGain();
      hatGain.gain.setValueAtTime(0.04, t);
      hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

      hat.connect(filter);
      filter.connect(hatGain);
      hatGain.connect(this.musicGainNode);

      hat.start(t);
      hat.stop(t + 0.02);
    }
  }
}

export const sound = new SoundEngine();
