// Procedural 124-BPM synth loop (Web Audio, no files)
export class AudioManager {
  private ctx?: AudioContext;
  private timer?: number;
  private step = 0;
  private next = 0;
  private bpm = 124;
  private tone(
    f: number,
    t: number,
    d: number,
    type: OscillatorType,
    g: number,
    f2?: number,
  ) {
    const c = this.ctx!,
      o = c.createOscillator(),
      v = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    v.gain.setValueAtTime(g, t);
    v.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(v).connect(c.destination);
    o.start(t);
    o.stop(t + d);
  }
  private schedule() {
    const c = this.ctx!,
      sp = 60 / this.bpm / 4,
      scale = [220, 261.6, 293.7, 329.6, 392, 440, 523.3, 587.3];
    while (this.next < c.currentTime + 0.2) {
      const s = this.step,
        t = this.next;
      if (s % 4 === 0) this.tone(150, t, 0.2, "sine", 0.9, 40);
      if (s % 4 === 2) this.tone(7000, t, 0.04, "square", 0.05);
      if (s % 8 === 0 || s % 8 === 3 || s % 8 === 6)
        this.tone(scale[(s >> 3) % 2 ? 0 : 2] / 2, t, 0.25, "sawtooth", 0.18);
      this.tone(
        scale[[0, 2, 4, 5, 4, 2, 6, 7][(s * 3) % 8]] * 2,
        t,
        0.12,
        "square",
        0.06,
      );
      this.next += sp;
      this.step++;
    }
  }
  async start() {
    this.ctx ||= new AudioContext();
    await this.ctx.resume();
    if (this.timer) return;
    this.step = 0;
    this.next = this.ctx.currentTime + 0.05;
    this.timer = window.setInterval(() => this.schedule(), 50);
  }
  sting(f = 880) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.tone(f, t, 0.4, "triangle", 0.3, f * 2);
  }
  pause() {
    this.ctx?.suspend();
  }
  resume() {
    this.ctx?.resume();
  }
  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
  }
}
