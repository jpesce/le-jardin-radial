import { useState, useRef, useEffect, useCallback } from 'react';
import { Sprout } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { useGarden } from '../hooks/useGarden';
import { raw as catalogRaw } from '../data/flowers';
import Button from './ui/button';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import FlowerCatalog from './FlowerCatalog';
import FlowerEditor from './FlowerEditor';
import FlowerGardenView from './FlowerGardenView';

const CATALOG_IDS = new Set(catalogRaw.map((f) => f.id));

type ViewState =
  | 'garden'
  | 'manage'
  | 'create'
  | { edit: string; from: ViewStringState };

type ViewStringState = 'garden' | 'manage' | 'create';

interface GardenPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Toggle the panel open/closed */
  onToggle: () => void;
  /** Close the panel */
  onClose: () => void;
  /** Round button shape */
  round?: boolean;
  /** Button size */
  size?: string;
}

/** Garden editing panel with trigger button — view routing, keyboard navigation. Reads garden state from Zustand. */
export default function GardenPanel({
  isOpen,
  onToggle,
  onClose,
  round = true,
  size = 'lg',
}: GardenPanelProps) {
  const { lang, t } = useI18n();
  const garden = useGarden(lang);
  const [view, setView] = useState<ViewState>('garden');
  const panelRef = useRef<HTMLDivElement>(null);

  const closePanel = useCallback(() => {
    setView('garden');
    onClose();
  }, [onClose]);

  // Custom keyboard handler — Escape navigates back through views before closing
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
      // Escape — navigate back through views
      e.preventDefault();
      e.stopPropagation(); // Prevent Radix from closing the popover
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
    document.addEventListener('keydown', handler, true); // capture phase to preempt Radix
    return () => {
      document.removeEventListener('keydown', handler, true);
    };
  }, [isOpen, view, closePanel]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        if (open) onToggle();
        else closePanel();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          round={round}
          size={size}
          icon={<Sprout size={14} />}
          className="text-fg"
          animated
        >
          {isOpen ? t('buttonDone') : t('buttonPlanGarden')}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        ref={panelRef}
        align="end"
        collisionPadding={0}
        aria-label="Garden panel"
        onOpenAutoFocus={(e) => {
          e.preventDefault(); // Don't auto-focus/select inputs
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault(); // Let our custom handler manage Escape
        }}
        className="flex flex-col w-screen max-sm:max-w-none sm:w-[300px] max-h-[calc(100dvh-9rem)] sm:max-h-[calc(100dvh-6rem)] p-0 overflow-hidden max-sm:rounded-none sm:rounded-xl shadow-[0_4px_24px_color-mix(in_srgb,var(--color-fg)_8%,transparent)]"
      >
        <div className="flex flex-1 flex-col gap-[0.25rem] min-h-0 px-[1.875rem] pt-6 overflow-y-auto">
          {view === 'manage' ? (
            <FlowerCatalog
              flowers={garden.allFlowers}
              onToggle={garden.toggleGarden}
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
                garden.addCustomFlower(data);
                setView('manage');
              }}
              onCancel={() => {
                setView('manage');
              }}
            />
          ) : typeof view === 'object' ? (
            <FlowerEditor
              flower={garden.allFlowers.find((f) => f.id === view.edit)}
              onSave={(data) => {
                garden.editFlower(view.edit, data);
                setView(view.from as ViewState);
              }}
              onCancel={() => {
                setView(view.from as ViewState);
              }}
              onDelete={
                !CATALOG_IDS.has(view.edit)
                  ? () => {
                      garden.deleteFlower(view.edit);
                      setView(view.from as ViewState);
                    }
                  : undefined
              }
            />
          ) : (
            <FlowerGardenView
              gardenFlowers={garden.gardenFlowers}
              selected={garden.selected}
              onToggle={garden.toggleSelected}
              onReorder={garden.reorderSelected}
              onEditFlower={(id) => {
                setView({ edit: id, from: 'garden' });
              }}
              onManage={() => {
                setView('manage');
              }}
              showLabels={garden.labels}
              onShowLabelsChange={garden.setLabels}
              gardenOwner={garden.owner}
              onGardenOwnerChange={garden.setOwner}
            />
          )}
          <div className="sticky bottom-0 shrink-0 h-6 pointer-events-none bg-linear-to-b from-transparent to-bg" />
        </div>
        {view === 'manage' && (
          <button
            className="relative z-[1] flex shrink-0 items-center justify-center w-full py-3 px-[1.875rem] text-xs text-muted lowercase tracking-[0.03em] cursor-pointer bg-surface border-0 border-t border-solid border-t-border transition-colors duration-150 hover:text-fg"
            onClick={() => {
              setView('create');
            }}
          >
            + {t('createFlower')}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
