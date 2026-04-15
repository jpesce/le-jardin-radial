import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import RadialChart from './components/RadialChart';
import Footer from './components/Footer';
import Header from './components/Header';
import SharedBanner from './components/SharedBanner';
import FallbackPage from './components/FallbackPage';
import Button from './components/ui/button';
import {
  OUTER_PALETTE,
  INNER_PALETTE,
  pick,
  colorsFromName,
} from './utils/logoColors';
import { useGarden, getSharedState } from './hooks/useGarden';
import { useI18n } from './i18n/I18nContext';
import { updateMeta } from './i18n/updateMeta';
import { exportSvg, exportPng } from './utils/exportImage';

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
    const isNotFound = routeError === 'not-found';
    return (
      <FallbackPage
        title={t(isNotFound ? 'notFoundTitle' : 'invalidShareTitle') as string}
        description={
          t(
            isNotFound ? 'notFoundDescription' : 'invalidShareDescription',
          ) as string
        }
        actions={
          <Button
            variant="solid"
            size="md"
            onClick={() => {
              window.location.replace('/');
            }}
          >
            {t(isNotFound ? 'notFoundCta' : 'invalidShareCta') as string}
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
            backgroundColor={colorsFromName(garden.owner).outer}
            onSave={garden.saveShared}
            onDismiss={garden.dismissShared}
            animateEntry={hasBeenLocal}
          />
        )}
      </AnimatePresence>
      <main className="relative flex flex-1 flex-col items-center w-full p-8 max-sm:p-4">
        <Header
          panelOpen={panelOpen}
          onTogglePanel={() => {
            setPanelOpen((prev) => !prev);
          }}
          onClosePanel={() => {
            setPanelOpen(false);
          }}
          onExportSvg={handleExportSvg}
          onExportPng={handleExportPng}
          showActions={!garden.isShared}
        />

        <div className="w-full max-sm:flex-1 max-sm:flex max-sm:items-center">
          <RadialChart
            flowers={garden.selectedFlowers}
            showLabels={garden.labels}
            svgRef={chartSvgRef}
          />
        </div>

        <Footer />
      </main>
    </div>
  );
}
