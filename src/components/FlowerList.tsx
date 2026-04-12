import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { raw as catalogRaw } from '../data/flowers';
import { useClickOutside } from '../hooks/useClickOutside';
import Button from './Button';
import FlowerCatalog from './FlowerCatalog';
import FlowerEditor from './FlowerEditor';
import FlowerGardenView from './FlowerGardenView';
import Reset from './Reset';
import Share from './Share';
import type {
  EnrichedFlower,
  CustomFlowerData,
  ImportCallbacks,
} from '../types';

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
  onExportSvg: () => void;
  onExportPng: () => void;
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
  onExportSvg,
  onExportPng,
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
  const [view, setViewRaw] = useState<ViewState>('garden');
  const setView = (v: ViewState) => {
    setViewRaw(v);
  };
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  useClickOutside(closePanel, isOpen, [panelRef, buttonRef]);

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
        <Reset
          isOpen={activePopover === 'reset'}
          onToggle={() => {
            togglePopover('reset');
          }}
          onClose={closePopover}
          onReset={onReset}
        />
        <Share
          isOpen={activePopover === 'share'}
          onToggle={() => {
            togglePopover('share');
          }}
          onClose={closePopover}
          onGetShareUrl={onGetShareUrl}
          onExportJson={onExportJson}
          onExportSvg={onExportSvg}
          onExportPng={onExportPng}
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
                <FlowerGardenView
                  gardenFlowers={gardenFlowers}
                  selected={selected}
                  onToggle={onToggle}
                  onReorder={onReorder}
                  onEditFlower={(id) => {
                    setView({ edit: id, from: 'garden' });
                  }}
                  onManage={() => {
                    setView('manage');
                  }}
                  showLabels={showLabels}
                  onShowLabelsChange={onShowLabelsChange}
                  gardenOwner={gardenOwner}
                  onGardenOwnerChange={onGardenOwnerChange}
                />
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
