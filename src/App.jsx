import { useState, useCallback, useMemo, useEffect } from "react";
import RadialChart from "./components/RadialChart.jsx";
import FlowerList from "./components/FlowerList.jsx";
import LanguageSwitcher from "./components/LanguageSwitcher.jsx";
import Logo, { OUTER_PALETTE, INNER_PALETTE, pick } from "./components/Logo.jsx";
import { flowers } from "./data/flowers.js";
import { useI18n } from "./i18n/I18nContext.jsx";
import { updateMeta } from "./i18n/updateMeta.js";
import "./App.css";

const INITIAL_IDS = ["rose", "lavender", "sunflower", "tulip", "snowdrop"];

export default function App() {
  const [selectedIds, setSelectedIds] = useState(INITIAL_IDS);
  const [showLabels, setShowLabels] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [gardenOwner, setGardenOwner] = useState("Tainah Drummond");
  const { lang, t } = useI18n();

  useEffect(() => {
    updateMeta(lang, gardenOwner);
  }, [lang, gardenOwner]);

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
  // Attach displayName from translations
  const selected = useMemo(
    () =>
      [...selectedIds]
        .reverse()
        .map((id) => flowers.find((f) => f.id === id))
        .filter(Boolean)
        .map((f) => ({ ...f, displayName: f.names[lang] })),
    [selectedIds, lang],
  );

  return (
    <div className="app">
      <div className="app-logo-wrapper">
        <Logo className="app-logo" name={gardenOwner} />
        <span className="app-logo-subtitle">
          de {gardenOwner}
        </span>
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
      <p className="app-credits">{t("credits")}</p>
      <div className="app-bottom-left">
        <LanguageSwitcher />
        <p className="app-description">
          <strong>{t("descriptionBrand")}</strong> {t("descriptionBody")}
        </p>
      </div>
    </div>
  );
}
