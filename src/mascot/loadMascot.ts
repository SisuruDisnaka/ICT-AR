import { MODEL_URL } from "../ar/markers";
import { buildFallbackRobot } from "./fallbackRobot";
const THREE = (window as any).AFRAME.THREE;
const TARGET_HEIGHT = 1.4; // marker-widths tall (marker width = 1 unit)
export interface Mascot {
  entity: any;
  root: any;
  clips: any[];
  source: "glb" | "fallback";
  note?: string;
}

export function fit(entity: any, obj: any, size = TARGET_HEIGHT) {
  entity.object3D.scale.setScalar(1);
  entity.object3D.position.set(0, 0, 0);
  const b = new THREE.Box3().setFromObject(obj),
    h = Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) || 1,
    s = size / h;
  entity.object3D.scale.setScalar(s);
  entity.object3D.position.y = -b.min.y * s;
}
export function loadMascot(marker: HTMLElement): Promise<Mascot> {
  return new Promise((resolve) => {
    const el: any = document.createElement("a-entity");
    let done = false;
    const fallback = (why: string) => {
      if (done) return;
      done = true;
      el.removeAttribute("gltf-model");
      const r = buildFallbackRobot();
      el.setObject3D("mesh", r.root);
      fit(el, r.root);
      resolve({
        entity: el,
        root: r.root,
        clips: r.clips,
        source: "fallback",
        note: `Using built-in robot (${why})`,
      });
    };
    el.addEventListener("model-loaded", (e: any) => {
      if (done) return;
      done = true;
      const m = e.detail.model;
      fit(el, m);
      resolve({
        entity: el,
        root: m,
        clips: m.animations || [],
        source: "glb",
      });
    });
    el.addEventListener("model-error", () =>
      fallback("sisuru-bot.glb failed to load"),
    );
    setTimeout(() => fallback("model timed out"), 20000);
    el.setAttribute("gltf-model", MODEL_URL);
    marker.appendChild(el);
  });
}
