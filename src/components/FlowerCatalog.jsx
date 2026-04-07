import { useState, useMemo } from "react";
import { useI18n } from "../i18n/I18nContext.jsx";
import FlowerRow from "./FlowerRow.jsx";
import "./FlowerCatalog.css";

export default function FlowerCatalog({ flowers, onToggle, onBack, onCreateFlower, onEditFlower }) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return flowers.filter((f) => f.displayName.toLowerCase().includes(q));
  }, [flowers, search]);

  return (
    <>
      <button className="catalog-back" onClick={onBack}>
        ← {t("backButton")}
      </button>
      <input
        type="text"
        className="panel-input catalog-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("searchPlaceholder")}
      />
      <h3 className="panel-title">{t("catalogTitle")}</h3>
      <ul className="flower-items">
        {filtered.map((flower) => (
          <li key={flower.id} className="flower-item">
            <label className="flower-label catalog-label">
              <FlowerRow
                flower={flower}
                checked={flower.inGarden}
                onToggle={() => onToggle(flower.id)}
                onEdit={onEditFlower ? () => onEditFlower(flower.id) : null}
              />
            </label>
          </li>
        ))}
      </ul>
      <button className="catalog-create" onClick={onCreateFlower}>
        + {t("createFlower")}
      </button>
    </>
  );
}
