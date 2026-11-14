import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, OBJECTS, type ICTObject } from "../data/objects";
import Footer from "./Footer";
export function InfoPanel({ o }: { o: ICTObject }) {
  return (
    <article className="info">
      <p className="eyebrow">
        {CATEGORIES.find((c) => c.id === o.category)?.label}
      </p>
      <h3>
        {o.icon} {o.name}
      </h3>
      <p className="lead">{o.description}</p>
      <details open>
        <summary>Main purpose</summary>
        <p>{o.purpose}</p>
      </details>
      <details>
        <summary>Interesting fact</summary>
        <p>{o.fact}</p>
      </details>
      <details>
        <summary>Technical specifications</summary>
        <dl>
          {Object.entries(o.specs).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </details>
    </article>
  );
}
export default function Explorer({ onAr }: { onAr: (o: ICTObject) => void }) {
  const [cat, setCat] = useState("all"),
    [q, setQ] = useState(""),
    [sel, setSel] = useState<ICTObject>(OBJECTS[0]),
    [open, setOpen] = useState(false);
  const list = useMemo(
    () =>
      OBJECTS.filter(
        (o) =>
          (cat === "all" || o.category === cat) &&
          (o.name + o.description).toLowerCase().includes(q.toLowerCase()),
      ),
    [cat, q],
  );
  const label = CATEGORIES.find((c) => c.id === cat)!.label;
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  return (
    <div className="explorer">
      <header className="nav">
        <div className="brand">
          <h1 style={{ all: "unset" }}>
            <b>
              ICT <span>×</span> SISURU AR
            </b>
          </h1>
          <small>Explore the innovative world</small>
        </div>
        <input
          type="search"
          placeholder="Search objects…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search objects"
        />
      </header>
      <nav className="cats" aria-label="Categories">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className="chip"
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
          >
            {c.label}
            <small>
              {c.id === "all"
                ? OBJECTS.length
                : OBJECTS.filter((o) => o.category === c.id).length}
            </small>
          </button>
        ))}
      </nav>
      <main>
        <h2 className="page-title">
          {label}
          <span>{list.length} objects</span>
        </h2>
        <div className="grid">
          {list.map((o, i) => (
            <article
              key={o.id}
              className={`card ${sel.id === o.id ? "on" : ""}`}
              style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
            >
              <button
                className="card-main"
                onClick={() => {
                  setSel(o);
                  setOpen(true);
                }}
                aria-label={`Details: ${o.name}`}
              >
                <div className="thumb">
                  <span aria-hidden>{o.icon}</span>
                  <img
                    src={o.thumbnail}
                    alt=""
                    loading="lazy"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                </div>
                <span className="tag">
                  {CATEGORIES.find((c) => c.id === o.category)?.label}
                </span>
                <h3>{o.name}</h3>
                <p>{o.description}</p>
              </button>
              <button className="btn btn-primary" onClick={() => onAr(o)}>
                Explore in AR
              </button>
            </article>
          ))}
          {!list.length && (
            <div className="empty" role="status">
              <span aria-hidden style={{ fontSize: "2rem" }}>
                🔍
              </span>
              <b>No objects found</b>Try a different search
              {cat !== "all" ? " or choose another category" : ""}.
            </div>
          )}
        </div>
        <Footer />
      </main>
      {open && <div className="backdrop" onClick={() => setOpen(false)} />}
      <aside
        className={`detail ${open ? "open" : ""}`}
        aria-label="Object details"
      >
        <button
          className="btn btn-icon btn-ghost close"
          aria-label="Close details"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
        <InfoPanel o={sel} />
        <button className="btn btn-primary btn-lg" onClick={() => onAr(sel)}>
          Explore in AR ▶
        </button>
      </aside>
    </div>
  );
}
