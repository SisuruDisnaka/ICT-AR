import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createArScene } from "../ar/ArScene";
import { ObjectManager, type ObjState } from "../ar/ObjectManager";
import { AnimationController } from "../mascot/AnimationController";
import { AudioManager } from "../audio/AudioManager";
import { Director } from "../show/Director";
import { OBJECTS, type ICTObject } from "../data/objects";
import { InfoPanel } from "./Explorer";
import { startViewportSync, debugOn } from "../ar/viewport";
import { createHudRoot } from "../ar/hudRoot";
const explain = (e: any) =>
  e?.name === "NotAllowedError"
    ? "Camera permission denied. Allow the camera in the address bar, then retry."
    : e?.name === "NotFoundError"
      ? "No camera found. Plug in the USB webcam and retry."
      : e?.name === "NotReadableError"
        ? "Camera is busy in another app/tab."
        : `Camera error: ${e?.message || e}`;

export default function ArView({
  start,
  onBack,
}: {
  start: ICTObject;
  onBack: () => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    mgr = useRef<ObjectManager | null>(null),
    objRef = useRef(start);
  const anim = useRef<AnimationController | null>(null),
    audio = useRef(new AudioManager()),
    dir = useRef<Director | null>(null);
  const [obj, setObj] = useState(start);
  const [cam, setCam] = useState<"init" | "ready" | "error">("init");
  const [err, setErr] = useState("");
  const [retry, setRetry] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [marker, setMarker] = useState("Searching for marker…");
  const [model, setModel] = useState<{ s: ObjState; msg?: string }>({
    s: "loading",
  });
  const [auto, setAuto] = useState(true);
  const [caption, setCaption] = useState("");
  const [running, setRunning] = useState(false);
  const [seen, setSeen] = useState(false);
  const [guide, setGuide] = useState(false);
  objRef.current = obj;
  const [info, setInfo] = useState(false);
  const [dbg, setDbg] = useState("");
  useEffect(() => startViewportSync(), []);
  const [hud] = useState(createHudRoot);
  useEffect(() => () => hud.destroy(), [hud]);
  useEffect(() => {
    if (!debugOn()) return;
    const t = setInterval(() => {
      const q = (x: string, r: ParentNode = document) => {
        const e = r.querySelector(x);
        if (!e) return "none";
        const b = e.getBoundingClientRect();
        const c = getComputedStyle(e);
        return `${[b.left, b.top, b.width, b.height].map(Math.round).join(",")} ${c.display}/${c.visibility}/op${c.opacity}`;
      };
      const v = window.visualViewport;
      setDbg(
        `build-4 inner ${innerWidth}x${innerHeight} dpr ${devicePixelRatio}\nvv ${v?.width}x${v?.height} off ${v?.offsetLeft},${v?.offsetTop} sc ${v?.scale}\nhud ${q(".hud", hud.container)}\nbar ${q(".bar", hud.container)}\npill ${q(".pill", hud.container)}\nvideo ${q("#arjs-video")}\nscene ${q("a-scene")}\nhost open:${(() => {
          try {
            return hud.host.matches(":popover-open");
          } catch {
            return "n/a";
          }
        })()} conn:${hud.host.isConnected}\nhtml.class="${document.documentElement.className}" body.class="${document.body.className}"\nbody.style="${document.body.style.cssText.slice(0, 90)}" kids:${document.body.children.length}`,
      );
    }, 700);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let on = true;
    setCam("init");
    setErr(""); // camera permission + device list (once per attempt)
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(async (s) => {
        s.getTracks().forEach((t) => t.stop());
        const d = (await navigator.mediaDevices.enumerateDevices()).filter(
          (x) => x.kind === "videoinput",
        );
        if (!on) return;
        setDevices(d);
        setDeviceId(
          (id) =>
            id ||
            (
              d.find(
                (x) => !/integrated|built|facetime|front/i.test(x.label),
              ) || d[0]
            )?.deviceId ||
            "",
        );
        setCam("ready");
      })
      .catch((e) => {
        if (on) {
          setErr(explain(e));
          setCam("error");
        }
      });
    return () => {
      on = false;
    };
  }, [retry]);

  useEffect(() => {
    if (cam !== "ready" || !host.current) return; // ONE scene per camera; objects swap inside it
    let raf = 0,
      last = performance.now(),
      alive = true;
    const d = new Director(
      () => anim.current,
      audio.current,
      setCaption,
      setRunning,
    );
    dir.current = d;
    const h = createArScene(host.current, {
      deviceId,
      onFound: () => {
        setMarker("Marker detected");
        setSeen(true);
        d.setPaused(false);
        anim.current?.setPaused(false);
        audio.current.resume();
      },
      onLost: () => {
        setMarker("Marker lost");
        d.setPaused(true);
        anim.current?.setPaused(true);
        audio.current.pause();
      },
    });
    const m = new ObjectManager(
      h.marker,
      (s, msg) => alive && setModel({ s, msg }),
      (mc) => {
        if (!alive) return;
        anim.current = mc ? new AnimationController(mc.root, mc.clips) : null;
        anim.current?.play("Idle");
      },
    );
    mgr.current = m;
    m.show(objRef.current);
    const el = host.current;
    let drag: any = null;
    const dn = (e: PointerEvent) => (drag = [e.clientX, e.clientY]);
    const up = () => (drag = null);
    const mv = (e: PointerEvent) => {
      if (!drag) return;
      m.rotY += (e.clientX - drag[0]) * 0.01;
      m.rotX = Math.max(
        -1.2,
        Math.min(1.2, m.rotX + (e.clientY - drag[1]) * 0.01),
      );
      drag = [e.clientX, e.clientY];
    };
    el.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", mv);
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      m.tick(dt);
      anim.current?.update(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const g = setTimeout(() => setGuide(true), 8000);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(g);
      d.cancel();
      el.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", mv);
      h.dispose();
      mgr.current = null;
      anim.current = null;
    };
  }, [cam, deviceId]);

  useEffect(() => {
    dir.current?.cancel();
    mgr.current?.show(obj);
  }, [obj]); // object switch: no camera/scene restart
  const rot = (d: number) => mgr.current && (mgr.current.rotY += d),
    zoom = (f: number) =>
      mgr.current &&
      (mgr.current.zoom = Math.max(0.3, Math.min(3, mgr.current.zoom * f)));
  const toggleAuto = () => {
    if (mgr.current) {
      mgr.current.auto = !mgr.current.auto;
      setAuto(mgr.current.auto);
    }
  };
  const fs = () =>
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "SELECT") return;
      (
        ({
          ArrowLeft: () => rot(-0.2),
          ArrowRight: () => rot(0.2),
          "+": () => zoom(1.15),
          "=": () => zoom(1.15),
          "-": () => zoom(0.87),
          r: () => mgr.current?.reset(),
          a: toggleAuto,
          f: fs,
          Escape: onBack,
        }) as any
      )[e.key]?.();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const status =
    cam === "init"
      ? "Initializing camera…"
      : cam === "error"
        ? "Camera unavailable"
        : marker;
  const mt = {
    loading: "Loading 3D model…",
    shown:
      model.msg ||
      (marker === "Marker detected"
        ? "Object displayed"
        : "Model ready - point the camera at the marker"),
    missing: model.msg || "Model unavailable",
    error: model.msg || "Model unavailable",
  }[model.s];
  return (
    <>
      <div ref={host} className="ar-host" />
      {createPortal(
        <div className="hud">
          <header className="topbar">
            <button
              className="btn"
              onClick={onBack}
              aria-label="Back to explorer"
            >
              ‹<span className="hide-sm">Explorer</span>
            </button>
            <div
              role="status"
              aria-live="polite"
              className={`pill ${marker === "Marker detected" ? "found" : marker === "Marker lost" ? "lost" : ""}`}
            >
              <i className="dot" />
              {status}
            </div>
          </header>
          <div className="note" role="status">
            {mt}
          </div>
          {dbg && <pre className="dbg">{dbg}</pre>}
          {cam === "init" && (
            <div className="state" role="status">
              <div className="spinner" />
              <h2>Initializing camera</h2>
              <p>Allow camera access if your browser asks.</p>
            </div>
          )}
          {cam === "error" && (
            <div className="state err" role="alert">
              <h2>Camera unavailable</h2>
              <p>{err}</p>
              <button
                className="btn btn-primary"
                onClick={() => setRetry((r) => r + 1)}
              >
                Retry camera
              </button>
            </div>
          )}
          {cam === "ready" && !seen && guide && (
            <div className="state" role="status">
              <h2>Marker not found</h2>
              <p>
                Lay the printed marker flat, light it evenly, keep the full
                black border in view and angle the webcam ~45° down.
              </p>
            </div>
          )}
          {caption && (
            <div className="caption" key={caption}>
              {caption}
            </div>
          )}
          <aside
            className={`side ${info ? "open" : ""}`}
            aria-label="Object information"
          >
            <button
              className="btn btn-icon btn-ghost close"
              aria-label="Close information"
              onClick={() => setInfo(false)}
            >
              ✕
            </button>
            <InfoPanel o={obj} />
          </aside>
          <div className="bar" role="toolbar" aria-label="AR controls">
            <select
              value={obj.id}
              onChange={(e) =>
                setObj(OBJECTS.find((o) => o.id === e.target.value)!)
              }
              aria-label="Switch object"
            >
              {OBJECTS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            {devices.length > 1 && (
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                aria-label="Camera"
              >
                {devices.map((d, i) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            )}
            <button
              className="btn info-toggle"
              aria-expanded={info}
              onClick={() => setInfo((i) => !i)}
            >
              ℹ<span className="hide-sm">Info</span>
            </button>
            <button
              className="btn btn-icon"
              onClick={() => rot(-0.4)}
              aria-label="Rotate left"
            >
              ⟲
            </button>
            <button
              className="btn btn-icon"
              onClick={() => rot(0.4)}
              aria-label="Rotate right"
            >
              ⟳
            </button>
            <button
              className="btn btn-icon"
              onClick={() => zoom(1.2)}
              aria-label="Zoom in"
            >
              ＋
            </button>
            <button
              className="btn btn-icon"
              onClick={() => zoom(0.83)}
              aria-label="Zoom out"
            >
              －
            </button>
            <button className="btn" onClick={() => mgr.current?.reset()}>
              Reset
            </button>
            <button className="btn" aria-pressed={auto} onClick={toggleAuto}>
              Auto {auto ? "on" : "off"}
            </button>
            <button
              className="btn btn-icon"
              onClick={fs}
              aria-label="Toggle fullscreen"
            >
              ⛶
            </button>
            {obj.animated && (
              <button
                className="btn btn-primary"
                disabled={marker !== "Marker detected"}
                onClick={() => {
                  dir.current?.cancel();
                  setTimeout(() => dir.current?.run(), 50);
                }}
              >
                {running ? "↻ Replay" : "▶ Start show"}
              </button>
            )}
          </div>
        </div>,
        hud.container,
      )}
    </>
  );
}
