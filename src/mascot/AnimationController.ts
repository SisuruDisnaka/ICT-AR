const THREE = (window as any).AFRAME.THREE;
export const CLIP_NAMES = [
  "Idle",
  "Entrance",
  "Dance",
  "Wave",
  "Point",
  "Victory",
] as const;
export type ClipName = (typeof CLIP_NAMES)[number];
const ONCE: ClipName[] = ["Entrance", "Wave", "Point", "Victory"];

export class AnimationController {
  mixer: any;
  actions: Partial<Record<ClipName, any>> = {};
  missing: ClipName[] = [];
  current: any = null;
  constructor(root: any, clips: any[]) {
    this.mixer = new THREE.AnimationMixer(root);
    for (const n of CLIP_NAMES) {
      const c =
        clips.find((c) => c.name.toLowerCase() === n.toLowerCase()) ||
        clips.find((c) => c.name.toLowerCase().includes(n.toLowerCase()));
      if (c) this.actions[n] = this.mixer.clipAction(c);
      else {
        this.missing.push(n);
        console.warn(`[AnimationController] missing clip "${n}"`);
      }
    }
  }
  /** Plays a clip (cross-faded). Resolves when a once-clip ends. Missing clips fall back to Idle. */
  play(name: ClipName, fade = 0.3): Promise<void> {
    const a = this.actions[name] || this.actions.Idle;
    if (!a) return Promise.resolve();
    const once = ONCE.includes(name) && !!this.actions[name];
    a.reset();
    a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    a.clampWhenFinished = once;
    a.fadeIn(fade).play();
    if (this.current && this.current !== a) this.current.fadeOut(fade);
    this.current = a;
    return once
      ? new Promise((res) => {
          const f = (e: any) => {
            if (e.action === a) {
              this.mixer.removeEventListener("finished", f);
              res();
            }
          };
          this.mixer.addEventListener("finished", f);
        })
      : Promise.resolve();
  }
  setPaused(p: boolean) {
    this.mixer.timeScale = p ? 0 : 1;
  }
  update(dt: number) {
    this.mixer.update(dt);
  }
}
