import type { ReactNode } from 'react';
import { Pencil, User } from 'lucide-react';
import { bloomRanges } from '../data/months';
import { useI18n } from '../i18n/I18nContext';
import Button from './Button';
import type { EnrichedFlower } from '../types';

interface FlowerRowProps {
  flower: EnrichedFlower;
  checked: boolean;
  onToggle: () => void;
  onEdit?: (() => void) | null;
  dragHandle?: ReactNode;
}

export default function FlowerRow({
  flower,
  checked,
  onToggle,
  onEdit,
  dragHandle,
}: FlowerRowProps) {
  const { t } = useI18n();
  const months = t('months') as string[];

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
          background: flower.colors.blooming,
        }}
      />
      <span className="flower-name">
        {flower.displayName}
        {flower.isCustom && <User size={10} className="custom-icon" />}
      </span>
      <span className="flower-bloom-range">
        {bloomRanges(flower.monthStates)
          .map(({ start, end }) =>
            start === end ? months[start] : `${months[start]}–${months[end]}`,
          )
          .join(', ')}
      </span>
      {onEdit && flower.isCustom && (
        <Button
          variant="ghost"
          size="xs"
          icon={<Pencil size={11} />}
          className="edit-btn"
          aria-label="Edit flower"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
        />
      )}
    </>
  );
}
