/** Keeps CSS vars (--vvw/--vvh/--vvl/--vvt) equal to the *visible* area, so the HUD can never be laid out off-screen on mobile browsers. */
export function startViewportSync() {
  const r = document.documentElement.style,
    vv = window.visualViewport;
  const sync = () => {
    r.setProperty("--vvw", (vv?.width ?? window.innerWidth) + "px");
    r.setProperty("--vvh", (vv?.height ?? window.innerHeight) + "px");
    r.setProperty("--vvl", (vv?.offsetLeft ?? 0) + "px");
    r.setProperty("--vvt", (vv?.offsetTop ?? 0) + "px");
  };
  sync();
  vv?.addEventListener("resize", sync);
  vv?.addEventListener("scroll", sync);
  window.addEventListener("resize", sync);
  window.addEventListener("orientationchange", sync);
  return () => {
    vv?.removeEventListener("resize", sync);
    vv?.removeEventListener("scroll", sync);
    window.removeEventListener("resize", sync);
    window.removeEventListener("orientationchange", sync);
    ["--vvw", "--vvh", "--vvl", "--vvt"].forEach((x) => r.removeProperty(x));
  };
}
export const debugOn = () => /[?&]debug/.test(location.search);
