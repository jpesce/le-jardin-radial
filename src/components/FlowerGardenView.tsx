import { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, GripVertical } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useDragReorder } from '../hooks/useDragReorder';
import Button from './Button';
import { Checkbox } from './ui/checkbox';
import { cn } from '../utils/cn';
import FlowerRow from './FlowerRow';
import type { EnrichedFlower } from '../types';

const LAYOUT_TRANSITION = { duration: 0.3, ease: 'easeInOut' as const };

interface FlowerGardenViewProps {
  gardenFlowers: EnrichedFlower[];
  selected: string[];
  onToggle: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onEditFlower: (id: string) => void;
  onManage: () => void;
  showLabels: boolean;
  onShowLabelsChange: (value: boolean) => void;
  gardenOwner: string;
  onGardenOwnerChange: (value: string) => void;
}

export default function FlowerGardenView({
  gardenFlowers,
  selected,
  onToggle,
  onReorder,
  onEditFlower,
  onManage,
  showLabels,
  onShowLabelsChange,
  gardenOwner,
  onGardenOwnerChange,
}: FlowerGardenViewProps) {
  const { t } = useI18n();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const suppressHover = useRef(false);

  const { dragFrom, dropTarget, handlePointerDown } = useDragReorder(
    listRef,
    selected,
    onReorder,
  );

  const handleKeyboardReorder = useCallback(
    (e: React.KeyboardEvent, flowerId: string, selectedIdx: number) => {
      const dir = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      if (!dir) return;
      e.preventDefault();

      const toIdx = selectedIdx + dir;
      if (toIdx < 0 || toIdx >= selected.length) return;

      const reordered = [...selected];
      const removed = reordered.splice(selectedIdx, 1)[0];
      if (removed !== undefined) reordered.splice(toIdx, 0, removed);
      onReorder(reordered);

      requestAnimationFrame(() => {
        const handle = listRef.current?.querySelector<HTMLElement>(
          `[data-reorder-id="${flowerId}"]`,
        );
        handle?.focus();
      });

      if (liveRegionRef.current) {
        const flower = gardenFlowers.find((f) => f.id === flowerId);
        if (flower) {
          liveRegionRef.current.textContent = `${flower.displayName}, ${toIdx + 1} of ${selected.length}`;
        }
      }
    },
    [selected, onReorder, gardenFlowers],
  );

  const sortedFlowers = useMemo(() => {
    const sel = selected
      .map((id) => gardenFlowers.find((f) => f.id === id))
      .filter((f): f is EnrichedFlower => Boolean(f));
    const unselected = gardenFlowers.filter((f) => !selected.includes(f.id));
    return [...sel, ...unselected];
  }, [gardenFlowers, selected]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  return (
    <>
      <div className="flex flex-col gap-[0.35rem]">
        <label className="flex gap-[0.4rem] items-center text-xs text-muted lowercase tracking-[0.03em] cursor-pointer select-none">
          {t('gardenerLabel')}
        </label>
        <input
          type="text"
          className="px-[0.6rem] py-[0.4rem] text-xs text-fg outline-none bg-surface-input border border-border rounded-md transition-[border-color] duration-150 focus:bg-surface focus:border-border-hover"
          value={gardenOwner}
          onChange={(e) => {
            onGardenOwnerChange(e.target.value);
          }}
        />
        <label className="flex gap-[0.4rem] items-center text-xs text-muted lowercase tracking-[0.03em] cursor-pointer select-none mt-[0.6rem]">
          <Checkbox
            checked={showLabels}
            onCheckedChange={(checked) => {
              onShowLabelsChange(checked === true);
            }}
          />
          {t('showFlowerNames')}
        </label>
      </div>
      <div className="flex items-center pt-5">
        <h3 className="text-xs font-bold text-muted uppercase tracking-[0.05em]">
          {t('pickFlowers')}
        </h3>
        <Button
          variant="ghost"
          size="xs"
          icon={<Pencil size={10} />}
          className="ml-1"
          aria-label="Manage flowers"
          onClick={onManage}
        />
      </div>

      <ul
        ref={listRef}
        className={cn(
          'flex flex-col list-none',
          dragFrom !== null && 'pointer-events-none',
        )}
      >
        <AnimatePresence initial={false}>
          {sortedFlowers.flatMap((flower) => {
            const isSelected = selectedSet.has(flower.id);
            const selectedIdx = selected.indexOf(flower.id);

            const isDragging = dragFrom !== null;
            const isDraggedItem = isSelected && dragFrom === selectedIdx;
            const isHovered = hoveredId === flower.id;

            const showIndicatorAbove =
              isDragging &&
              isSelected &&
              dropTarget === selectedIdx &&
              dropTarget !== dragFrom &&
              dropTarget !== dragFrom + 1;

            const showIndicatorBelow =
              isDragging &&
              isSelected &&
              selectedIdx === selected.length - 1 &&
              dropTarget === selected.length &&
              dropTarget !== dragFrom + 1;

            const items = [
              <motion.li
                key={flower.id}
                layout
                transition={{ layout: LAYOUT_TRANSITION }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isDraggedItem ? 0.4 : 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'group relative',
                  showIndicatorAbove &&
                    'before:content-[""] before:absolute before:inset-x-0 before:h-px before:bg-border-hover before:top-0',
                  showIndicatorBelow &&
                    'after:content-[""] after:absolute after:inset-x-0 after:h-px after:bg-border-hover after:bottom-0',
                )}
                data-hovered={isHovered || undefined}
                data-selected-idx={isSelected ? selectedIdx : undefined}
                onPointerMove={() => {
                  if (
                    dragFrom === null &&
                    !suppressHover.current &&
                    hoveredId !== flower.id
                  )
                    setHoveredId(flower.id);
                }}
                onMouseLeave={() => {
                  setHoveredId(null);
                }}
                onPointerDown={
                  isSelected
                    ? (e) => {
                        handlePointerDown(e, selectedIdx);
                      }
                    : undefined
                }
              >
                <label className="flex flex-1 gap-[0.5rem] items-center py-[0.25rem] text-xs text-subtle cursor-pointer">
                  <FlowerRow
                    flower={flower}
                    checked={isSelected}
                    onToggle={() => {
                      setHoveredId(null);
                      suppressHover.current = true;
                      setTimeout(() => {
                        suppressHover.current = false;
                      }, LAYOUT_TRANSITION.duration * 1000);
                      onToggle(flower.id);
                    }}
                    onEdit={() => {
                      onEditFlower(flower.id);
                    }}
                    dragHandle={
                      isSelected ? (
                        <span
                          className="absolute top-1/2 left-[calc(-20px-4.5px)] flex items-center justify-center w-5 py-1 text-drag-handle cursor-grab select-none touch-none bg-transparent rounded-[3px] opacity-0 -translate-y-1/2 transition-[opacity,background] duration-100 hover:bg-divider active:text-muted active:cursor-grabbing group-data-[hovered]:opacity-100 max-sm:opacity-100 focus-visible:opacity-100 focus-visible:bg-divider focus-visible:outline-none"
                          role="button"
                          tabIndex={0}
                          aria-label={`Reorder ${flower.displayName}`}
                          aria-roledescription="sortable"
                          data-reorder-id={flower.id}
                          onKeyDown={(e) => {
                            handleKeyboardReorder(e, flower.id, selectedIdx);
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            handlePointerDown(e, selectedIdx);
                          }}
                        >
                          <GripVertical size={11} />
                        </span>
                      ) : null
                    }
                  />
                </label>
              </motion.li>,
            ];

            const isLastSelected =
              isSelected &&
              selectedIdx === selected.length - 1 &&
              sortedFlowers.length > selected.length;

            if (isLastSelected) {
              items.push(
                <motion.li
                  key="__divider"
                  layout
                  transition={{ layout: LAYOUT_TRANSITION }}
                  className="h-px my-[0.4rem] bg-divider"
                  aria-hidden
                />,
              );
            }

            return items;
          })}
        </AnimatePresence>
      </ul>
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </>
  );
}
