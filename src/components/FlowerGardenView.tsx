import { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, GripVertical } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useDragReorder } from '../hooks/useDragReorder';
import Button from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { cn } from '../utils/cn';
import FlowerRow from './FlowerRow';
import type { EnrichedFlower } from '../types';

const LAYOUT_TRANSITION = { duration: 0.3, ease: 'easeInOut' as const };

// ── Drag handle ─────────────────────────────────────────────────────────

interface DragHandleProps {
  /** Flower name for accessible label */
  displayName: string;
  /** Flower ID for focus restoration after keyboard reorder */
  flowerId: string;
  /** Called on keyboard ArrowUp/ArrowDown */
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** Called on pointer drag start */
  onPointerDown: (e: React.PointerEvent) => void;
}

/** Grip icon for drag reorder — supports both pointer drag and keyboard ArrowUp/ArrowDown. */
function DragHandle({
  displayName,
  flowerId,
  onKeyDown,
  onPointerDown,
}: DragHandleProps) {
  return (
    <span
      className="absolute top-1/2 left-[calc(-20px-4.5px)] flex items-center justify-center w-5 py-1 text-earth-200 cursor-grab select-none touch-none bg-transparent rounded-[3px] opacity-0 -translate-y-1/2 transition-[opacity,background] duration-100 hover:bg-divider active:text-muted active:cursor-grabbing group-data-[hovered]:opacity-100 max-sm:opacity-100 focus-visible:opacity-100 focus-visible:bg-divider focus-visible:outline-none"
      role="button"
      tabIndex={0}
      aria-label={`Reorder ${displayName}`}
      aria-roledescription="sortable"
      data-reorder-id={flowerId}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        e.preventDefault();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown(e);
      }}
    >
      <GripVertical size={11} />
    </span>
  );
}

// ── List item ───────────────────────────────────────────────────────────

interface FlowerListItemProps {
  /** Flower data */
  flower: EnrichedFlower;
  /** Whether this flower is selected (checked) */
  isSelected: boolean;
  /** Index within the selected array (-1 if unselected) */
  selectedIdx: number;
  /** Whether this item is being dragged */
  isDraggedItem: boolean;
  /** Whether to show a drop indicator above this item */
  showIndicatorAbove: boolean;
  /** Whether to show a drop indicator below this item */
  showIndicatorBelow: boolean;
  /** Whether this item is hovered */
  isHovered: boolean;
  /** Pointer move handler for hover tracking */
  onHover: () => void;
  /** Mouse leave handler to clear hover */
  onHoverEnd: () => void;
  /** Pointer down handler for drag initiation */
  onPointerDown: (e: React.PointerEvent) => void;
  /** Toggle flower selection */
  onToggle: () => void;
  /** Edit this flower */
  onEdit: () => void;
  /** Keyboard reorder handler for the drag handle */
  onKeyboardReorder: (e: React.KeyboardEvent) => void;
}

/** Animated flower list item with optional drag handle and drop indicators. */
function FlowerListItem({
  flower,
  isSelected,
  selectedIdx,
  isDraggedItem,
  showIndicatorAbove,
  showIndicatorBelow,
  isHovered,
  onHover,
  onHoverEnd,
  onPointerDown,
  onToggle,
  onEdit,
  onKeyboardReorder,
}: FlowerListItemProps) {
  return (
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
      onPointerMove={onHover}
      onMouseLeave={onHoverEnd}
      onPointerDown={isSelected ? onPointerDown : undefined}
    >
      <label className="flex flex-1 gap-[0.5rem] items-center py-[0.25rem] text-xs text-subtle cursor-pointer">
        <FlowerRow
          flower={flower}
          checked={isSelected}
          onToggle={onToggle}
          onEdit={onEdit}
          dragHandle={
            isSelected ? (
              <DragHandle
                displayName={flower.displayName}
                flowerId={flower.id}
                onKeyDown={onKeyboardReorder}
                onPointerDown={onPointerDown}
              />
            ) : null
          }
        />
      </label>
    </motion.li>
  );
}

// ── Garden view ─────────────────────────────────────────────────────────

interface FlowerGardenViewProps {
  /** Flowers currently in the garden, in display order */
  gardenFlowers: EnrichedFlower[];
  /** IDs of flowers selected (checked) for display on the chart */
  selected: string[];
  /** Toggle a flower's selected state by ID */
  onToggle: (id: string) => void;
  /** Reorder garden flowers by providing new ID order and optional dragged flower ID */
  onReorder: (ids: string[], draggedId?: string) => void;
  /** Edit a custom flower by ID */
  onEditFlower: (id: string) => void;
  /** Navigate to the manage/catalog view */
  onManage: () => void;
  /** Whether flower name labels are shown on the chart */
  showLabels: boolean;
  /** Toggle flower name labels on the chart */
  onShowLabelsChange: (value: boolean) => void;
  /** Garden owner name displayed in the header */
  gardenOwner: string;
  /** Update the garden owner name */
  onGardenOwnerChange: (value: string) => void;
}

/** Garden view — owner input, labels toggle, sortable flower list with drag reorder and keyboard navigation. */
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
      onReorder(reordered, removed);

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

  const isDragging = dragFrom !== null;

  return (
    <>
      <div className="flex flex-col gap-[0.35rem]">
        <label
          htmlFor="garden-owner"
          className="flex gap-[0.4rem] items-center text-xs text-muted lowercase tracking-[0.03em] cursor-pointer select-none"
        >
          {t('gardenerLabel')}
        </label>
        <Input
          id="garden-owner"
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
        <h2 className="text-xs font-bold text-muted uppercase tracking-[0.05em]">
          {t('pickFlowers')}
        </h2>
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
          isDragging && 'pointer-events-none',
        )}
      >
        <AnimatePresence initial={false}>
          {sortedFlowers.flatMap((flower) => {
            const isSelected = selectedSet.has(flower.id);
            const selectedIdx = selected.indexOf(flower.id);

            const items = [
              <FlowerListItem
                key={flower.id}
                flower={flower}
                isSelected={isSelected}
                selectedIdx={selectedIdx}
                isDraggedItem={isSelected && dragFrom === selectedIdx}
                showIndicatorAbove={
                  isDragging &&
                  isSelected &&
                  dropTarget === selectedIdx &&
                  dropTarget !== dragFrom &&
                  dropTarget !== dragFrom + 1
                }
                showIndicatorBelow={
                  isDragging &&
                  isSelected &&
                  selectedIdx === selected.length - 1 &&
                  dropTarget === selected.length &&
                  dropTarget !== dragFrom + 1
                }
                isHovered={hoveredId === flower.id}
                onHover={() => {
                  if (
                    !isDragging &&
                    !suppressHover.current &&
                    hoveredId !== flower.id
                  )
                    setHoveredId(flower.id);
                }}
                onHoverEnd={() => {
                  setHoveredId(null);
                }}
                onPointerDown={(e) => {
                  handlePointerDown(e, selectedIdx);
                }}
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
                onKeyboardReorder={(e) => {
                  handleKeyboardReorder(e, flower.id, selectedIdx);
                }}
              />,
            ];

            // Divider between selected and unselected flowers
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
