import { useState, useCallback, useMemo } from "react";
import RadialChart from "./components/RadialChart.jsx";
import FlowerList from "./components/FlowerList.jsx";
import Logo from "./components/Logo.jsx";
import { flowers } from "./data/flowers.js";
import "./App.css";

const INITIAL_IDS = ["rose", "lavender", "sunflower", "tulip", "snowdrop"];

export default function App() {
  const [selectedIds, setSelectedIds] = useState(INITIAL_IDS);
  const [showLabels, setShowLabels] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [gardenOwner, setGardenOwner] = useState("TAINAH DRUMMOND");

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
    </div>
  );
}
