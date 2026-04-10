import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Pencil, GripVertical } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { raw as catalogRaw } from '../data/flowers';
import { useClickOutside } from '../hooks/useClickOutside';
import { useDragReorder } from '../hooks/useDragReorder';
import Button from './Button';
import Checkbox from './Checkbox';
import { cn } from '../utils/cn';
import FlowerCatalog from './FlowerCatalog';
import FlowerEditor from './FlowerEditor';
import FlowerRow from './FlowerRow';
import ResetConfirmation from './ResetConfirmation';
import ShareButton from './ShareButton';
import type {
  EnrichedFlower,
  CustomFlowerData,
  ImportCallbacks,
} from '../types';

const LAYOUT_TRANSITION = { duration: 0.3, ease: 'easeInOut' as const };
const CATALOG_IDS = new Set(catalogRaw.map((f) => f.id));

type ViewState =
  | 'garden'
  | 'manage'
  | 'create'
  | { edit: string; from: ViewStringState };

type ViewStringState = 'garden' | 'manage' | 'create';

interface FlowerListProps {
  gardenFlowers: EnrichedFlower[];
  allFlowers: EnrichedFlower[];
  selected: string[];
  onToggle: (id: string) => void;
  onReorder: (ids: string[]) => void;
  onToggleGarden: (id: string) => void;
  onAddCustomFlower: (data: CustomFlowerData) => void;
  onEditFlower: (id: string, data: CustomFlowerData) => void;
  onDeleteFlower: (id: string) => void;
  onReset: () => void;
  onGetShareUrl: () => string;
  onExportJson: () => void;
  onImportJson: (file: File, callbacks?: ImportCallbacks) => void;
  showLabels: boolean;
  onShowLabelsChange: (value: boolean) => void;
  gardenOwner: string;
  onGardenOwnerChange: (value: string) => void;
  isOpen: boolean;
  onTogglePanel: () => void;
  onClose: () => void;
}

export default function FlowerList({
  gardenFlowers,
  allFlowers,
  selected,
  onToggle,
  onReorder,
  onToggleGarden,
  onAddCustomFlower,
  onEditFlower,
  onDeleteFlower,
  onReset,
  onGetShareUrl,
  onExportJson,
  onImportJson,
  showLabels,
  onShowLabelsChange,
  gardenOwner,
  onGardenOwnerChange,
  isOpen,
  onTogglePanel,
  onClose,
}: FlowerListProps) {
  const { t } = useI18n();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [view, setViewRaw] = useState<ViewState>('garden');
  const setView = (v: ViewState) => {
    setHoveredId(null);
    setViewRaw(v);
  };
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { dragFrom, dropTarget, handlePointerDown } = useDragReorder(
    listRef,
    selected,
    onReorder,
  );

  const closePanel = useCallback(() => {
    setViewRaw('garden');
    onClose();
  }, [onClose]);

  const closePopover = useCallback(() => {
    setActivePopover(null);
  }, []);

  const togglePopover = useCallback(
    (name: string) => {
      setActivePopover((prev) => {
        if (prev === name) return null;
        if (isOpen) closePanel();
        return name;
      });
    },
    [isOpen, closePanel],
  );

  const handleTogglePanel = useCallback(() => {
    setActivePopover(null);
    onTogglePanel();
  }, [onTogglePanel]);

  const sortedFlowers = useMemo(() => {
    const sel = selected
      .map((id) => gardenFlowers.find((f) => f.id === id))
      .filter((f): f is EnrichedFlower => Boolean(f));
    const unselected = gardenFlowers.filter((f) => !selected.includes(f.id));
    return [...sel, ...unselected];
  }, [gardenFlowers, selected]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const handleClickOutside = useCallback(() => {
    if (dragFrom !== null) return;
    closePanel();
  }, [closePanel, dragFrom]);
  useClickOutside(handleClickOutside, isOpen, [panelRef, buttonRef]);

  useEffect(() => {
    if (!isOpen) return;
    const isEditorView =
      view === 'create' || (typeof view === 'object' && view.edit);
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' && e.key !== 'Enter') return;
      if ((document.activeElement as HTMLInputElement | null)?.type === 'color')
        return;
      const active = document.activeElement as HTMLElement | null;
      if (active?.tagName === 'INPUT' || active?.tagName === 'TEXTAREA') {
        active.blur();
        return;
      }
      if (e.key === 'Enter') {
        if (!isEditorView) return;
        const form = panelRef.current?.querySelector('form');
        if (form) form.requestSubmit();
        return;
      }
      e.preventDefault();
      (document.activeElement as HTMLElement | null)?.blur();
      if (typeof view === 'object') {
        setView(view.from as ViewState);
      } else if (view === 'create') {
        setView('manage');
      } else if (view === 'manage') {
        setView('garden');
      } else {
        closePanel();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [isOpen, view, closePanel]);

  return (
    <div className="absolute top-6 right-8 z-[100] flex flex-col items-end max-[480px]:top-3 max-[480px]:right-3">
      <div className="panel-actions flex gap-[0.4rem] items-center">
        <ResetConfirmation
          isOpen={activePopover === 'reset'}
          onToggle={() => {
            togglePopover('reset');
          }}
          onClose={closePopover}
          onReset={onReset}
        />
        <ShareButton
          isOpen={activePopover === 'share'}
          onToggle={() => {
            togglePopover('share');
          }}
          onClose={closePopover}
          onGetShareUrl={onGetShareUrl}
          onExportJson={onExportJson}
          onImportJson={onImportJson}
        />
        <Button
          ref={buttonRef}
          variant="outline"
          round
          size="lg"
          icon={<Sprout size={14} />}
          className="text-fg"
          animated
          onClick={handleTogglePanel}
        >
          {isOpen ? t('buttonDone') : t('buttonPlanGarden')}
        </Button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            ref={panelRef}
            className="relative flex flex-col w-[300px] max-h-[calc(100dvh-6rem)] mt-[0.5rem] overflow-hidden bg-surface border border-border rounded-xl shadow-[0_4px_24px_color-mix(in_srgb,var(--color-fg)_8%,transparent)] max-[480px]:w-[calc(100vw-1.5rem)]"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flex flex-1 flex-col gap-[0.25rem] min-h-0 px-[1.875rem] pt-6 overflow-y-auto">
              {view === 'manage' ? (
                <FlowerCatalog
                  flowers={allFlowers}
                  onToggle={onToggleGarden}
                  onBack={() => {
                    setView('garden');
                  }}
                  onEditFlower={(id: string) => {
                    setView({ edit: id, from: 'manage' });
                  }}
                />
              ) : view === 'create' ? (
                <FlowerEditor
                  flower={null}
                  onSave={(data) => {
                    onAddCustomFlower(data);
                    setView('manage');
                  }}
                  onCancel={() => {
                    setView('manage');
                  }}
                />
              ) : typeof view === 'object' ? (
                <FlowerEditor
                  flower={allFlowers.find((f) => f.id === view.edit)}
                  onSave={(data) => {
                    onEditFlower(view.edit, data);
                    setView(view.from as ViewState);
                  }}
                  onCancel={() => {
                    setView(view.from as ViewState);
                  }}
                  onDelete={
                    !CATALOG_IDS.has(view.edit)
                      ? () => {
                          onDeleteFlower(view.edit);
                          setView(view.from as ViewState);
                        }
                      : undefined
                  }
                />
              ) : (
                <>
                  <div className="flex flex-col gap-[0.35rem]">
                    <label className="flex gap-[0.4rem] items-center text-xs text-muted lowercase tracking-[0.03em] cursor-pointer select-none">
                      {t('gardenerLabel')}
                    </label>
                    <input
                      type="text"
                      className="px-[0.6rem] py-[0.4rem] font-[inherit] text-xs text-fg outline-none bg-surface-input border border-border rounded-md transition-[border-color] duration-150 focus:bg-surface focus:border-border-hover"
                      value={gardenOwner}
                      onChange={(e) => {
                        onGardenOwnerChange(e.target.value);
                      }}
                    />
                    <label className="flex gap-[0.4rem] items-center text-xs text-muted lowercase tracking-[0.03em] cursor-pointer select-none mt-[0.6rem]">
                      <Checkbox
                        checked={showLabels}
                        onChange={(e) => {
                          onShowLabelsChange(e.target.checked);
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
                      onClick={() => {
                        setView('manage');
                      }}
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
                        const isDraggedItem =
                          isSelected && dragFrom === selectedIdx;
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
                            data-selected-idx={
                              isSelected ? selectedIdx : undefined
                            }
                            onPointerMove={() => {
                              if (dragFrom === null && hoveredId !== flower.id)
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
                                  onToggle(flower.id);
                                }}
                                onEdit={() => {
                                  setView({ edit: flower.id, from: 'garden' });
                                }}
                                dragHandle={
                                  isSelected ? (
                                    <span
                                      className="absolute top-1/2 left-[calc(-20px-4.5px)] flex items-center justify-center w-5 py-1 text-drag-handle cursor-grab select-none bg-transparent rounded-[3px] opacity-0 -translate-y-1/2 transition-[opacity,background] duration-100 hover:bg-divider active:text-muted active:cursor-grabbing group-hover:opacity-100 group-data-[hovered]:opacity-100"
                                      role="img"
                                      aria-label="reorder"
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
                </>
              )}
              <div className="sticky bottom-0 shrink-0 h-6 pointer-events-none bg-linear-to-b from-transparent to-bg" />
            </div>
            {view === 'manage' && (
              <button
                className="relative z-[1] flex shrink-0 items-center justify-center w-full py-3 px-[1.875rem] font-[inherit] text-xs text-muted lowercase tracking-[0.03em] cursor-pointer bg-surface border-0 border-t border-solid border-t-border transition-colors duration-150 hover:text-fg"
                onClick={() => {
                  setView('create');
                }}
              >
                + {t('createFlower')}
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
