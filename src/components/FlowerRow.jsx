import { Pencil } from "lucide-react";
import { bloomRanges } from "../data/months.js";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function FlowerRow({
  flower,
  checked,
  onToggle,
  onEdit,
  dragHandle,
}) {
  const { t } = useI18n();
  const months = t("months");

  return (
    <>
      {dragHandle}
      <input
        type="checkbox"
        className="checkbox"
        checked={checked}
        onChange={onToggle}
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
          .map(({ start, end }) =>
            start === end
              ? months[start]
              : `${months[start]}–${months[end]}`,
          )
          .join(", ")}
      </span>
      {onEdit && (
        <button
          className="edit-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Pencil size={11} />
        </button>
      )}
    </>
  );
}
