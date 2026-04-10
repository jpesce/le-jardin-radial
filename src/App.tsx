import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadialChart from './components/RadialChart';
import FlowerList from './components/FlowerList';
import LanguageSwitcher from './components/LanguageSwitcher';
import Logo from './components/Logo';
import SharedBanner from './components/SharedBanner';
import FallbackPage from './components/FallbackPage';
import Button from './components/Button';
import { OUTER_PALETTE, INNER_PALETTE, pick } from './components/logo-colors';
import { useGarden, getSharedState } from './hooks/useGarden';
import { useI18n } from './i18n/I18nContext';
import { updateMeta } from './i18n/updateMeta';
import { exportSvg, exportPng } from './utils/exportSvg';
import type { Lang } from './types';

type RouteError = 'not-found' | 'invalid-share' | null;

function detectRouteError(): RouteError {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  const clean = path.replace(/\/\/+/g, '/');
  if (clean !== path) {
    window.location.replace(
      clean + window.location.search + window.location.hash,
    );
    return null;
  }
  const seg = path.split('/')[1] ?? '';
  if (!seg) return null;
  if (seg === 'en' || seg === 'fr') return null;
  if (seg === 'share') {
    const result = getSharedState();
    return result.status === 'invalid' ? 'invalid-share' : null;
  }
  return 'not-found';
}

const fallbackStrings: Record<
  NonNullable<RouteError>,
  Record<Lang, { title: string; description: string; cta: string }>
> = {
  'not-found': {
    en: {
      title: 'Nothing planted here',
      description:
        'This path doesn\u2019t lead anywhere in the garden. Head back to see what\u2019s blooming.',
      cta: 'Go to garden',
    },
    fr: {
      title: 'Rien n\u2019est plant\u00e9 ici',
      description:
        'Ce chemin ne m\u00e8ne nulle part dans le jardin. Revenez voir ce qui fleurit.',
      cta: 'Aller au jardin',
    },
  },
  'invalid-share': {
    en: {
      title: 'This bouquet wilted',
      description:
        'The share link seems to be invalid or incomplete. Ask for a fresh one, or head to your garden.',
      cta: 'Go to garden',
    },
    fr: {
      title: 'Ce bouquet a fan\u00e9',
      description:
        'Le lien de partage semble invalide ou incomplet. Demandez-en un nouveau, ou retournez \u00e0 votre jardin.',
      cta: 'Aller au jardin',
    },
  },
};

export default function App() {
  const { lang, t } = useI18n();
  const routeError = useMemo(() => detectRouteError(), []);
  const garden = useGarden(lang);
  const chartSvgRef = useRef<SVGSVGElement | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hasBeenLocal, setHasBeenLocal] = useState(!garden.isShared);
  if (!garden.isShared && !hasBeenLocal) {
    setHasBeenLocal(true);
  }

  useEffect(() => {
    if (routeError) return;
    updateMeta(lang, garden.owner);
  }, [lang, garden.owner, routeError]);

  useEffect(() => {
    const link =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]') ||
      (() => {
        const el = document.createElement('link');
        el.rel = 'icon';
        document.head.appendChild(el);
        return el;
      })();

    const update = () => {
      const outer = pick(OUTER_PALETTE);
      const inner = pick(INNER_PALETTE);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle fill="${outer}" cx="50" cy="50" r="50"/><circle fill="${inner}" cx="50" cy="50" r="28"/></svg>`;
      link.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    update();
    const id = setInterval(update, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  const handleExportSvg = useCallback(() => {
    if (chartSvgRef.current) {
      void exportSvg(chartSvgRef.current, garden.owner);
    }
  }, [garden.owner]);

  const handleExportPng = useCallback(() => {
    if (chartSvgRef.current) {
      void exportPng(chartSvgRef.current, garden.owner);
    }
  }, [garden.owner]);

  if (routeError) {
    const s = fallbackStrings[routeError][lang];
    return (
      <FallbackPage
        title={s.title}
        description={s.description}
        actions={
          <Button
            variant="solid"
            size="md"
            onClick={() => {
              window.location.replace('/');
            }}
          >
            {s.cta}
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <AnimatePresence>
        {garden.isShared && (
          <SharedBanner
            owner={garden.owner}
            onSave={garden.saveShared}
            onDismiss={garden.dismissShared}
            animateEntry={hasBeenLocal}
          />
        )}
      </AnimatePresence>
      <main className="relative flex flex-1 flex-col items-center w-full p-8 max-[480px]:p-4">
        <div className="absolute top-8 left-8 z-50 w-[max(120px,20vw)]">
          <Logo className="block w-full h-auto" name={garden.owner} />
          <span className="block mt-[1.2vw] text-[0.95vw] font-normal text-fg uppercase tracking-[0.15em]">
            de {garden.owner}
          </span>
        </div>
        <RadialChart
          flowers={garden.selectedFlowers}
          showLabels={garden.labels}
          svgRef={chartSvgRef}
        />
        <AnimatePresence>
          {!garden.isShared && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FlowerList
                gardenFlowers={garden.gardenFlowers}
                allFlowers={garden.allFlowers}
                selected={garden.selected}
                onToggle={garden.toggleSelected}
                onReorder={garden.reorderSelected}
                onToggleGarden={garden.toggleGarden}
                onAddCustomFlower={garden.addCustomFlower}
                onEditFlower={garden.editFlower}
                onDeleteFlower={garden.deleteFlower}
                onReset={garden.reset}
                onGetShareUrl={garden.getShareUrl}
                onExportJson={garden.exportJson}
                onExportSvg={handleExportSvg}
                onExportPng={handleExportPng}
                onImportJson={garden.importJson}
                showLabels={garden.labels}
                onShowLabelsChange={garden.setLabels}
                gardenOwner={garden.owner}
                onGardenOwnerChange={garden.setOwner}
                isOpen={panelOpen}
                onTogglePanel={() => {
                  setPanelOpen((prev) => !prev);
                }}
                onClose={() => {
                  setPanelOpen(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <p className="absolute right-8 bottom-8 z-50 w-[360px] text-xs font-normal leading-[1.6] text-fg text-left">
          {t('credits')}
        </p>
        <div className="absolute bottom-8 left-8 z-50 w-[max(200px,20vw)]">
          <LanguageSwitcher />
          <p className="font-['JetBrains_Mono_Variable',monospace] text-xs font-normal leading-[1.6] text-fg">
            <strong className="font-bold">{t('descriptionBrand')}</strong>{' '}
            {t('descriptionBody')}
          </p>
        </div>
      </main>
    </div>
  );
}
