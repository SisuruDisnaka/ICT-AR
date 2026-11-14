// Procedural cartoon robot + the 6 clips. Used automatically when sisuru-bot.glb is missing/broken.
const THREE = (window as any).AFRAME.THREE;
const M = (c: number) =>
  new THREE.MeshStandardMaterial({ color: c, roughness: 0.4, metalness: 0.2 });
const box = (w: number, h: number, d: number, m: any, y = 0, x = 0) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y, 0);
  return o;
};
export function buildFallbackRobot() {
  const root = new THREE.Group(),
    rig = new THREE.Group();
  rig.name = "rig";
  root.add(rig);
  const body = M(0x7c3aed),
    cy = M(0x22d3ee),
    wh = M(0xffffff);
  rig.add(box(0.55, 0.5, 0.35, body, 0.6));
  const head = new THREE.Group();
  head.name = "head";
  head.position.y = 1.15;
  head.add(
    box(0.6, 0.45, 0.45, wh),
    box(0.12, 0.12, 0.05, cy, 0.03, -0.14),
    box(0.12, 0.12, 0.05, cy, 0.03, 0.14),
    box(0.04, 0.2, 0.04, cy, 0.32),
  );
  head.children[1].position.z = head.children[2].position.z = 0.23;
  rig.add(head);
  for (const [n, s] of [
    ["armL", 1],
    ["armR", -1],
  ] as const) {
    const a = new THREE.Group();
    a.name = n;
    a.position.set(0.38 * s, 0.8, 0);
    a.add(box(0.14, 0.5, 0.14, cy, -0.25));
    rig.add(a);
  }
  rig.add(
    box(0.18, 0.35, 0.2, body, 0.17, -0.14),
    box(0.18, 0.35, 0.2, body, 0.17, 0.14),
  );
  const T = (n: string, t: number[], v: number[]) =>
    new THREE.NumberKeyframeTrack(n, t, v);
  const S = (t: number[], v: number[]) =>
    ["x", "y", "z"].map((a) => T(`rig.scale[${a}]`, t, v));
  const C = (n: string, d: number, tr: any[]) =>
    new THREE.AnimationClip(n, d, tr);
  const P = Math.PI * 2;
  const clips = [
    C("Idle", 2, [
      T("rig.position[y]", [0, 1, 2], [0, 0.03, 0]),
      T("head.rotation[y]", [0, 1, 2], [-0.15, 0.15, -0.15]),
      T("armL.rotation[z]", [0, 1, 2], [0.1, 0.2, 0.1]),
      T("armR.rotation[z]", [0, 1, 2], [-0.1, -0.2, -0.1]),
    ]),
    C("Entrance", 1.5, [
      ...S([0, 0.8, 1.2, 1.5], [0.01, 1.15, 0.95, 1]),
      T("rig.rotation[y]", [0, 1.5], [0, P]),
    ]),
    C("Dance", 2, [
      T("rig.position[y]", [0, 0.5, 1, 1.5, 2], [0, 0.14, 0, 0.14, 0]),
      T("armL.rotation[z]", [0, 1, 2], [2.6, 1.2, 2.6]),
      T("armR.rotation[z]", [0, 1, 2], [-1.2, -2.6, -1.2]),
      T("rig.rotation[y]", [0, 1, 2], [-0.5, 0.5, -0.5]),
      T("head.rotation[z]", [0, 1, 2], [-0.25, 0.25, -0.25]),
    ]),
    C("Wave", 2, [
      T(
        "armL.rotation[z]",
        [0, 0.3, 0.6, 0.9, 1.2, 1.7, 2],
        [0, 2.6, 2.2, 2.6, 2.2, 2.6, 0],
      ),
      T("head.rotation[z]", [0, 1, 2], [0, 0.2, 0]),
    ]),
    C("Point", 1.6, [
      T("armR.rotation[z]", [0, 0.4, 1.2, 1.6], [0, -1.55, -1.55, 0]),
      T("head.rotation[y]", [0, 0.4, 1.2, 1.6], [0, -0.4, -0.4, 0]),
    ]),
    C("Victory", 2.2, [
      T("armL.rotation[z]", [0, 0.3, 2.2], [0, 2.8, 2.8]),
      T("armR.rotation[z]", [0, 0.3, 2.2], [0, -2.8, -2.8]),
      T("rig.position[y]", [0, 0.4, 0.8, 1.2, 2.2], [0, 0.4, 0, 0.25, 0]),
      T("rig.rotation[y]", [0, 1.2], [0, P]),
    ]),
  ];
  return { root, clips };
}
