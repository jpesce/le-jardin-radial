import { useState, useCallback } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { useGarden } from '../hooks/useGarden';
import { useIsMobile } from '../hooks/useIsMobile';
import { colorsFromName } from '../utils/logoColors';
import GardenPanel from './GardenPanel';
import Logo from './Logo';
import Reset from './Reset';
import Share from './Share';

interface HeaderProps {
  /** Whether the garden panel is open */
  panelOpen: boolean;
  /** Toggle the garden panel */
  onTogglePanel: () => void;
  /** Close the garden panel */
  onClosePanel: () => void;
  /** Export chart as SVG (needs chartSvgRef from App) */
  onExportSvg: () => void;
  /** Export chart as PNG (needs chartSvgRef from App) */
  onExportPng: () => void;
  /** Whether to show action buttons (Reset, Share, Plan garden) */
  showActions?: boolean;
}

/** App header — logo, action buttons, and garden panel. Reads garden state from Zustand. */
export default function Header({
  panelOpen,
  onTogglePanel,
  onClosePanel,
  onExportSvg,
  onExportPng,
  showActions = true,
}: HeaderProps) {
  const { lang } = useI18n();
  const garden = useGarden(lang);
  const ownerColors = colorsFromName(garden.owner);
  const isMobile = useIsMobile();
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const round = !isMobile;
  const buttonSize = isMobile ? 'sm' : 'lg';

  const closePopover = useCallback(() => {
    setActivePopover(null);
  }, []);

  const togglePopover = useCallback(
    (name: string) => {
      setActivePopover((prev) => {
        if (prev === name) return null;
        if (panelOpen) onClosePanel();
        return name;
      });
    },
    [panelOpen, onClosePanel],
  );

  const handleTogglePanel = useCallback(() => {
    setActivePopover(null);
    onTogglePanel();
  }, [onTogglePanel]);

  return (
    <header className="absolute top-8 left-8 right-8 z-[100] flex items-start justify-between max-sm:static max-sm:w-full max-sm:mb-6 max-sm:flex-wrap max-sm:gap-3">
      {/* Logo + owner — hidden on mobile when panel open */}
      <div className="max-sm:w-full">
        {/* Stacked logo — desktop */}
        <div className="w-[max(120px,20vw)] max-sm:hidden">
          <Logo
            className="block w-full h-auto"
            circleOuterColor={ownerColors.outer}
            circleInnerColor={ownerColors.inner}
          />
          <span className="block mt-[1.2vw] text-[0.95vw] font-normal text-fg uppercase tracking-[0.15em]">
            de {garden.owner}
          </span>
        </div>
        {/* Inline logo + owner — mobile */}
        <div className="sm:hidden">
          <Logo
            className="block w-full h-auto"
            circleOuterColor={ownerColors.outer}
            circleInnerColor={ownerColors.inner}
            variant="inline"
          />
          <span className="block mt-1 text-xs font-normal text-fg uppercase tracking-[0.15em]">
            de {garden.owner}
          </span>
        </div>
      </div>

      {/* Actions — hidden when viewing a shared garden */}
      <div
        className={`flex gap-[0.4rem] items-center ml-auto max-sm:ml-0 max-sm:w-full ${showActions ? '' : 'sm:hidden max-sm:invisible'}`}
      >
        <div className="max-sm:order-3 max-sm:ml-auto">
          <Share
            isOpen={activePopover === 'share'}
            onToggle={() => {
              togglePopover('share');
            }}
            onClose={closePopover}
            onGetShareUrl={garden.getShareUrl}
            onExportJson={garden.exportJson}
            onExportSvg={onExportSvg}
            onExportPng={onExportPng}
            onImportJson={garden.importJson}
            round={round}
            size={buttonSize}
          />
        </div>
        <div className="max-sm:order-2">
          <Reset
            isOpen={activePopover === 'reset'}
            onToggle={() => {
              togglePopover('reset');
            }}
            onClose={closePopover}
            onReset={garden.reset}
            round={round}
            size={buttonSize}
            align={isMobile ? 'left' : 'right'}
          />
        </div>
        <GardenPanel
          isOpen={panelOpen}
          onToggle={handleTogglePanel}
          onClose={onClosePanel}
          round={round}
          size={buttonSize}
        />
      </div>
    </header>
  );
}
