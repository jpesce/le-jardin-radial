import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Pencil, GripVertical } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { raw as catalogRaw } from '../data/flowers.js';
import { useClickOutside } from '../hooks/useClickOutside.js';
import { useDragReorder } from '../hooks/useDragReorder.js';
import FlowerCatalog from './FlowerCatalog.jsx';
import FlowerEditor from './FlowerEditor.jsx';
import FlowerRow from './FlowerRow.jsx';
import ResetConfirmation from './ResetConfirmation.jsx';
import './FlowerList.css';

const LAYOUT_TRANSITION = { duration: 0.3, ease: 'easeInOut' };
const CATALOG_IDS = new Set(catalogRaw.map((f) => f.id));

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
  showLabels,
  onShowLabelsChange,
  gardenOwner,
  onGardenOwnerChange,
  isOpen,
  onTogglePanel,
  onClose,
}) {
  const { t } = useI18n();
  const [hoveredId, setHoveredId] = useState(null);
  const [view, setViewRaw] = useState('garden');
  const setView = (v) => {
    setHoveredId(null);
    setViewRaw(v);
  };
  const listRef = useRef(null);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);

  const { dragFrom, dropTarget, handlePointerDown } = useDragReorder(
    listRef,
    selected,
    onReorder,
  );

  const closePanel = useCallback(() => {
    setViewRaw('garden');
    onClose();
  }, [onClose]);

  const sortedFlowers = useMemo(() => {
    const sel = selected
      .map((id) => gardenFlowers.find((f) => f.id === id))
      .filter(Boolean);
    const unselected = gardenFlowers.filter((f) => !selected.includes(f.id));
    return [...sel, ...unselected];
  }, [gardenFlowers, selected]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Click outside to close panel
  const handleClickOutside = useCallback(() => {
    if (dragFrom !== null) return;
    closePanel();
  }, [closePanel, dragFrom]);
  useClickOutside(handleClickOutside, isOpen, [panelRef, buttonRef]);

  // Escape key: navigate back or close panel
  useEffect(() => {
    if (!isOpen) return;
    const isEditorView =
      view === 'create' || (typeof view === 'object' && view.edit);
    const handler = (e) => {
      if (e.key !== 'Escape' && e.key !== 'Enter') return;
      if (document.activeElement?.type === 'color') return;
      const active = document.activeElement;
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
      document.activeElement?.blur();
      if (typeof view === 'object' && view.edit) {
        setView(view.from || 'garden');
      } else if (view === 'create') {
        setView('manage');
      } else if (view === 'manage') {
        setView('garden');
      } else {
        closePanel();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, view, closePanel]);

  return (
    <div className="panel-wrapper">
      <div className="panel-actions">
        <ResetConfirmation
          onReset={onReset}
          isOpen={isOpen}
          onClosePanel={closePanel}
        />
        <button
          ref={buttonRef}
          className="panel-toggle"
          onClick={onTogglePanel}
        >
          <Sprout size={14} />
          {isOpen ? t('buttonDone') : t('buttonPlanGarden')}
        </button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            ref={panelRef}
            className="flower-panel"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flower-panel-inner">
              {view === 'manage' ? (
                <FlowerCatalog
                  flowers={allFlowers}
                  onToggle={onToggleGarden}
                  onBack={() => setView('garden')}
                  onEditFlower={(id) => setView({ edit: id, from: 'manage' })}
                />
              ) : view === 'create' ? (
                <FlowerEditor
                  flower={null}
                  onSave={(data) => {
                    onAddCustomFlower(data);
                    setView('manage');
                  }}
                  onCancel={() => setView('manage')}
                />
              ) : typeof view === 'object' && view.edit ? (
                <FlowerEditor
                  flower={allFlowers.find((f) => f.id === view.edit)}
                  onSave={(data) => {
                    onEditFlower(view.edit, data);
                    setView(view.from || 'garden');
                  }}
                  onCancel={() => setView(view.from || 'garden')}
                  onDelete={
                    !CATALOG_IDS.has(view.edit)
                      ? () => {
                          onDeleteFlower(view.edit);
                          setView(view.from || 'garden');
                        }
                      : undefined
                  }
                />
              ) : (
                <>
                  <div className="panel-section">
                    <label className="toggle-label">{t('gardenerLabel')}</label>
                    <input
                      type="text"
                      className="panel-input"
                      value={gardenOwner}
                      onChange={(e) => onGardenOwnerChange(e.target.value)}
                    />
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={showLabels}
                        onChange={(e) => onShowLabelsChange(e.target.checked)}
                      />
                      {t('showFlowerNames')}
                    </label>
                  </div>
                  <div className="panel-title-row">
                    <h3 className="panel-title">{t('pickFlowers')}</h3>
                    <button
                      className="panel-edit-link"
                      onClick={() => setView('manage')}
                    >
                      <Pencil size={10} />
                    </button>
                  </div>

                  <ul ref={listRef} className="flower-items">
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
                            className={
                              'flower-item' +
                              (isHovered ? ' flower-item--hovered' : '') +
                              (showIndicatorAbove
                                ? ' drop-indicator-above'
                                : '') +
                              (showIndicatorBelow
                                ? ' drop-indicator-below'
                                : '')
                            }
                            data-selected-idx={
                              isSelected ? selectedIdx : undefined
                            }
                            onPointerMove={() => {
                              if (dragFrom === null && hoveredId !== flower.id)
                                setHoveredId(flower.id);
                            }}
                            onMouseLeave={() => setHoveredId(null)}
                            onPointerDown={
                              isSelected
                                ? (e) => handlePointerDown(e, selectedIdx)
                                : undefined
                            }
                          >
                            <label className="flower-label">
                              <FlowerRow
                                flower={flower}
                                checked={isSelected}
                                onToggle={() => onToggle(flower.id)}
                                onEdit={() =>
                                  setView({ edit: flower.id, from: 'garden' })
                                }
                                dragHandle={
                                  isSelected ? (
                                    <span
                                      className="drag-handle"
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
                              className="flower-divider-inline"
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
              <div className="panel-fade" />
            </div>
            {view === 'manage' && (
              <button
                className="catalog-create"
                onClick={() => setView('create')}
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
