import type { AnimationController } from "../mascot/AnimationController";
import type { AudioManager } from "../audio/AudioManager";
/** Performance timeline. Pauses while the marker is lost; cancelable for reset/replay. */
export class Director {
  private id = 0;
  private paused = false;
  constructor(
    private anim: () => AnimationController | null,
    private audio: AudioManager,
    private caption: (t: string) => void,
    private done: (running: boolean) => void,
  ) {}
  setPaused(p: boolean) {
    this.paused = p;
  }
  cancel() {
    this.id++;
    this.audio.stop();
    this.caption("");
    this.anim()?.play("Idle");
    this.done(false);
  }
  private async sleep(ms: number, id: number) {
    for (let t = 0; t < ms; t += 100) {
      await new Promise((r) => setTimeout(r, 100));
      if (this.paused) t -= 100;
      if (id !== this.id) throw 0;
    }
  }
  async run() {
    const id = ++this.id,
      a = this.anim();
    if (!a) return;
    this.done(true);
    try {
      this.caption("MARKER LOCKED");
      this.audio.sting(660);
      await this.sleep(1200, id);
      this.caption("");
      await a.play("Entrance");
      if (id !== this.id) throw 0;
      await this.audio.start();
      a.play("Dance");
      await this.sleep(5000, id);
      this.caption("ICT!");
      this.audio.sting(990);
      await this.sleep(3000, id);
      this.caption("SISURU!");
      this.audio.sting(1200);
      await this.sleep(3000, id);
      this.caption("");
      this.audio.sting(1500);
      await a.play("Victory");
      if (id !== this.id) throw 0;
      this.caption("DON'T JUST USE TECHNOLOGY. CREATE IT.");
      a.play("Wave");
      await this.sleep(3000, id);
      a.play("Idle");
      this.audio.stop();
      this.done(false);
    } catch {
      /* cancelled */
    }
  }
}
