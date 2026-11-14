import { useState } from "react";
import Explorer from "./components/Explorer";
import ArView from "./components/ArView";
import type { ICTObject } from "./data/objects";
import Footer from "./components/Footer";
export default function App() {
  const [screen, setScreen] = useState<"welcome" | "explorer" | "ar">(
    "welcome",
  );
  const [obj, setObj] = useState<ICTObject | null>(null);
  if (screen === "welcome")
    return (
      <main className="hero">
        <div className="logo">
          ICT <span>×</span> SISURU AR
        </div>
        <h1>EXPLORE THE INNOVATIVE WORLD</h1>
        <p>
          Pick an ICT device, point your camera at the marker, and see it come
          alive in 3D.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setScreen("explorer")}
        >
          Start exploring
        </button>
        <Footer />
      </main>
    );
  if (screen === "ar" && obj)
    return <ArView start={obj} onBack={() => setScreen("explorer")} />; // unmounting releases the webcam
  return (
    <Explorer
      onAr={(o) => {
        setObj(o);
        setScreen("ar");
      }}
    />
  );
}
