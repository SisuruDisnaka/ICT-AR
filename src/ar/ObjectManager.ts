import { loadMascot, fit, type Mascot } from "../mascot/loadMascot";
import type { ICTObject } from "../data/objects";
export type ObjState = "loading" | "shown" | "missing" | "error";

export class ObjectManager {
  holder: any;
  private cur: any = null;
  private blob = "";
  private token = 0;
  rotX = 0;
  rotY = 0;
  zoom = 1;
  auto = true;
  constructor(
    marker: HTMLElement,
    private onState: (s: ObjState, msg?: string) => void,
    private onMascot: (m: Mascot | null) => void,
  ) {
    this.holder = document.createElement("a-entity");
    marker.appendChild(this.holder);
  }
  reset() {
    this.rotX = this.rotY = 0;
    this.zoom = 1;
  }
  tick(dt: number) {
    if (this.auto) this.rotY += dt * 0.8;
    this.holder.object3D.rotation.set(this.rotX, this.rotY, 0);
    this.holder.object3D.scale.setScalar(this.zoom);
  }
  private clear() {
    this.cur?.object3D.traverse((n: any) => {
      n.geometry?.dispose();
      ([] as any[]).concat(n.material || []).forEach((m: any) => {
        Object.values(m).forEach((v: any) => v?.isTexture && v.dispose());
        m.dispose();
      });
    });
    this.cur?.remove();
    this.cur = null;
    if (this.blob) URL.revokeObjectURL(this.blob);
    this.blob = "";
    this.onMascot(null);
  }
  async show(o: ICTObject) {
    const t = ++this.token;
    this.clear();
    this.reset();
    this.onState("loading");
    if (o.animated) {
      const m = await loadMascot(this.holder);
      if (t !== this.token) {
        this.cur = m.entity;
        this.clear();
        return;
      }
      this.cur = m.entity;
      this.onMascot(m);
      this.onState("shown", m.note);
      return;
    }
    try {
      const r = await fetch(o.model);
      const b = await r.blob();
      if (
        !r.ok ||
        new TextDecoder().decode(await b.slice(0, 4).arrayBuffer()) !== "glTF"
      )
        throw new Error("missing"); // Vite returns index.html for unknown files
      if (t !== this.token) return;
      this.blob = URL.createObjectURL(b);
      const el: any = document.createElement("a-entity");
      this.cur = el;
      el.addEventListener("model-loaded", (e: any) => {
        if (t !== this.token) return;
        fit(el, e.detail.model, o.scale);
        this.onState("shown");
      });
      el.addEventListener(
        "model-error",
        () =>
          t === this.token &&
          this.onState("error", "This model file is damaged."),
      );
      el.setAttribute("gltf-model", this.blob);
      this.holder.appendChild(el);
    } catch {
      if (t !== this.token) return;
      const el: any = document.createElement("a-entity");
      this.cur = el; // holographic placeholder box (clearly not the real object)
      el.setAttribute("geometry", "primitive:box;width:.8;height:.5;depth:.8");
      el.setAttribute("material", "color:#22d3ee;wireframe:true;opacity:.8");
      el.setAttribute("position", "0 .25 0");
      this.holder.appendChild(el);
      this.onState(
        "missing",
        `Model not found: add ${o.model.replace(import.meta.env.BASE_URL, "public/")}`,
      );
    }
  }
}
