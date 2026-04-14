import type { ReactNode } from 'react';
import { Pencil, User } from 'lucide-react';
import { bloomRanges } from '../data/months';
import { useI18n } from '../i18n/I18nContext';
import Button from './Button';
import Checkbox from './Checkbox';
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
      <Checkbox
        checked={checked}
        onChange={onToggle}
        className="group-hover:border-fg group-data-[hovered]:border-fg"
      />
      <span
        className="shrink-0 w-2.5 h-2.5 border border-[color-mix(in_srgb,var(--color-fg)_8%,transparent)] rounded-full"
        style={{
          background: flower.colors.blooming,
        }}
      />
      <span className="flex flex-1 gap-1 items-center overflow-hidden text-ellipsis whitespace-nowrap select-none group-hover:text-fg group-data-[hovered]:text-fg">
        {flower.displayName}
        {flower.isCustom && <User size={10} className="shrink-0" />}
      </span>
      <span className="shrink-0 text-2xs text-faint text-right group-hover:text-subtle group-data-[hovered]:text-subtle">
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
          className="absolute top-1/2 right-[calc(-20px-4.5px)] opacity-0 -translate-y-1/2 transition-opacity duration-100 group-hover:opacity-100 group-data-[hovered]:opacity-100 max-sm:opacity-100"
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
