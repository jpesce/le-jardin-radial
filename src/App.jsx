import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import RadialChart from './components/RadialChart.jsx';
import FlowerList from './components/FlowerList.jsx';
import LanguageSwitcher from './components/LanguageSwitcher.jsx';
import Logo from './components/Logo.jsx';
import SharedBanner from './components/SharedBanner.jsx';
import {
  OUTER_PALETTE,
  INNER_PALETTE,
  pick,
} from './components/logo-colors.js';
import { useGarden } from './hooks/useGarden.js';
import { useI18n } from './i18n/I18nContext.jsx';
import { updateMeta } from './i18n/updateMeta.js';
import './App.css';

export default function App() {
  const { lang, t } = useI18n();
  const garden = useGarden(lang);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hasBeenLocal, setHasBeenLocal] = useState(!garden.isShared);
  if (!garden.isShared && !hasBeenLocal) {
    setHasBeenLocal(true);
  }

  useEffect(() => {
    updateMeta(lang, garden.owner);
  }, [lang, garden.owner]);

  useEffect(() => {
    const link =
      document.querySelector('link[rel="icon"]') ||
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
    return () => clearInterval(id);
  }, []);

  return (
    <div className={'app' + (garden.isShared ? ' app--shared' : '')}>
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
      <main className="chart-area">
        <div className="app-logo-wrapper">
          <Logo className="app-logo" name={garden.owner} />
          <span className="app-logo-subtitle">de {garden.owner}</span>
        </div>
        <RadialChart
          flowers={garden.selectedFlowers}
          showLabels={garden.labels}
        />
        {!garden.isShared && (
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
            onImportJson={garden.importJson}
            showLabels={garden.labels}
            onShowLabelsChange={garden.setLabels}
            gardenOwner={garden.owner}
            onGardenOwnerChange={garden.setOwner}
            isOpen={panelOpen}
            onTogglePanel={() => setPanelOpen((prev) => !prev)}
            onClose={() => setPanelOpen(false)}
          />
        )}
        <p className="app-credits">{t('credits')}</p>
        <div className="app-bottom-left">
          <LanguageSwitcher />
          <p className="app-description">
            <strong>{t('descriptionBrand')}</strong> {t('descriptionBody')}
          </p>
        </div>
      </main>
    </div>
  );
}
