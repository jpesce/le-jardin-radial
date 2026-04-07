import { useState, useMemo } from "react";
import { useI18n } from "../i18n/I18nContext.jsx";
import { bloomRanges } from "../data/months.js";
import "./FlowerCatalog.css";

export default function FlowerCatalog({ flowers, onToggle, onBack }) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return flowers.filter((f) => f.displayName.toLowerCase().includes(q));
  }, [flowers, search]);

  // Keep stable bloom order — no reordering on check/uncheck
  const sorted = filtered;

  return (
    <div className="catalog">
      <button className="catalog-back" onClick={onBack}>
        ← {t("backButton")}
      </button>
      <input
        type="text"
        className="panel-input catalog-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍"
      />
      <h3 className="panel-title">{t("catalogTitle")}</h3>
      <ul className="flower-items">
        {sorted.map((flower) => (
          <li key={flower.id} className="flower-item">
            <label className="flower-label catalog-label">
              <input
                type="checkbox"
                className="checkbox"
                checked={flower.inGarden}
                onChange={() => onToggle(flower.id)}
              />
              <span
                className="flower-swatch"
                style={{
                  background: flower.colors?.blooming ?? "var(--color-text)",
                }}
              />
              <span className="flower-name">{flower.displayName}</span>
              <span className="flower-bloom-range">
                {bloomRanges(flower.monthStates)
                  .map(({ start, end }) => {
                    const months = t("months");
                    return start === end
                      ? months[start]
                      : `${months[start]}–${months[end]}`;
                  })
                  .join(", ")}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
