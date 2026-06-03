// Lightweight sound engine using the Web Audio API. No assets required.
type SoundName =
  | "click"
  | "place"
  | "win"
  | "lose"
  | "draw"
  | "hover";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicNodes: { osc: OscillatorNode; lfo: OscillatorNode }[] = [];
  private musicPlaying = false;

  muted = false;
  volume = 0.7;
  musicVolume = 0.25;
  sfxVolume = 0.6;

  ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicVolume;
    this.musicGain.connect(this.master);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxVolume;
    this.sfxGain.connect(this.master);
  }

  setMuted(m: boolean) {
    this.muted = m;
    this.ensure();
    if (this.master) this.master.gain.value = m ? 0 : this.volume;
  }

  setVolume(v: number) {
    this.volume = v;
    this.ensure();
    if (this.master && !this.muted) this.master.gain.value = v;
  }

  setMusicVolume(v: number) {
    this.musicVolume = v;
    if (this.musicGain) this.musicGain.gain.value = v;
  }

  setSfxVolume(v: number) {
    this.sfxVolume = v;
    if (this.sfxGain) this.sfxGain.gain.value = v;
  }

  play(name: SoundName) {
    this.ensure();
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const tone = (
      freq: number,
      dur: number,
      type: OscillatorType = "sine",
      startGain = 0.3,
      startAt = 0,
      slideTo?: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + startAt);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + startAt + dur);
      gain.gain.setValueAtTime(0, now + startAt);
      gain.gain.linearRampToValueAtTime(startGain, now + startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startAt + dur);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + startAt);
      osc.stop(now + startAt + dur + 0.05);
    };

    switch (name) {
      case "click":
        tone(880, 0.08, "square", 0.18);
        tone(1320, 0.06, "sine", 0.12, 0.01);
        break;
      case "hover":
        tone(1200, 0.05, "sine", 0.08);
        break;
      case "place":
        tone(220, 0.12, "triangle", 0.35, 0, 660);
        tone(880, 0.18, "sine", 0.18, 0.02);
        break;
      case "win":
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.35, "triangle", 0.3, i * 0.12));
        tone(1568, 0.6, "sine", 0.2, 0.5);
        break;
      case "lose":
        [440, 392, 349.23, 261.63].forEach((f, i) => tone(f, 0.4, "sawtooth", 0.18, i * 0.15));
        break;
      case "draw":
        tone(440, 0.3, "sine", 0.25, 0);
        tone(440, 0.3, "sine", 0.25, 0.18);
        break;
    }
  }

  startMusic() {
    this.ensure();
    if (!this.ctx || !this.musicGain || this.musicPlaying) return;
    this.musicPlaying = true;
    const ctx = this.ctx;

    // Slow ambient pad: layered detuned oscillators with a slow LFO filter sweep.
    const baseFreqs = [55, 82.5, 110, 164.81]; // A1, E2, A2, E3
    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      osc.detune.value = (i - 1.5) * 6;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 600;
      filter.Q.value = 4;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + i * 0.02;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 250;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      const g = ctx.createGain();
      g.gain.value = 0.18;

      osc.connect(filter);
      filter.connect(g);
      g.connect(this.musicGain!);

      osc.start();
      lfo.start();
      this.musicNodes.push({ osc, lfo });
    });
  }

  stopMusic() {
    this.musicNodes.forEach(({ osc, lfo }) => {
      try { osc.stop(); lfo.stop(); } catch { /* ignore */ }
    });
    this.musicNodes = [];
    this.musicPlaying = false;
  }
}

export const sound = new SoundEngine();
