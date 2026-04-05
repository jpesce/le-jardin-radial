import { useState, useCallback, useMemo, useEffect } from "react";
import RadialChart from "./components/RadialChart.jsx";
import FlowerList from "./components/FlowerList.jsx";
import Logo, { OUTER_PALETTE, INNER_PALETTE, pick } from "./components/Logo.jsx";
import { flowers } from "./data/flowers.js";
import "./App.css";

const INITIAL_IDS = ["rose", "lavender", "sunflower", "tulip", "snowdrop"];

export default function App() {
  const [selectedIds, setSelectedIds] = useState(INITIAL_IDS);
  const [showLabels, setShowLabels] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [gardenOwner, setGardenOwner] = useState("Tainah Drummond");

  useEffect(() => {
    document.title = gardenOwner
      ? `Le Jardin Radial de ${gardenOwner}`
      : "Le Jardin Radial";
  }, [gardenOwner]);

  useEffect(() => {
    const link =
      document.querySelector('link[rel="icon"]') ||
      (() => {
        const el = document.createElement("link");
        el.rel = "icon";
        document.head.appendChild(el);
        return el;
      })();

    const update = () => {
      const outer = pick(OUTER_PALETTE);
      const inner = pick(INNER_PALETTE);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="${outer}" cx="50" cy="50" r="50"/><circle fill="${inner}" cx="50" cy="50" r="28"/></svg>`;
      link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleToggle = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // Reverse so top of sidebar list = outermost ring
  const selected = useMemo(
    () =>
      [...selectedIds]
        .reverse()
        .map((id) => flowers.find((f) => f.id === id))
        .filter(Boolean),
    [selectedIds],
  );

  return (
    <div className="app">
      <div className="app-logo-wrapper">
        <Logo className="app-logo" name={gardenOwner} />
        <span className="app-logo-subtitle">de {gardenOwner}</span>
      </div>
      <main className="chart-area">
        <RadialChart flowers={selected} showLabels={showLabels} />
      </main>
      <FlowerList
        selectedIds={selectedIds}
        onToggle={handleToggle}
        onReorder={setSelectedIds}
        showLabels={showLabels}
        onShowLabelsChange={setShowLabels}
        gardenOwner={gardenOwner}
        onGardenOwnerChange={setGardenOwner}
        isOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((prev) => !prev)}
        onClose={() => setPanelOpen(false)}
      />
      <p className="app-credits">
        Cultivé&nbsp;🪴 avec amour par Tainah Drummond&nbsp;👩‍🌾, en
        collaboration avec João Pesce&nbsp;👨‍💻 et
        Chandra Drummond&nbsp;👩‍🎨, enraciné en
        France&nbsp;🇫🇷 et au Brésil&nbsp;🇧🇷.
      </p>
      <p className="app-description">
        <strong>LE JARDIN RADIAL</strong> traduisent les jardins en graphiques
        radiaux qui révèlent, au fil de l'année, les cycles de floraison et
        leurs variations de couleurs. Chaque composition visuelle anticipe
        l'expérience du jardin dans le temps, articulant botanique et dessin
        dans une lecture sensible et stratégique, rendant visible la dimension
        temporelle et vivante du paysage.
      </p>
    </div>
  );
}
