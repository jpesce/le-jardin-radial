import { useState, useMemo } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import FlowerRow from './FlowerRow.jsx';
import './FlowerCatalog.css';

export default function FlowerCatalog({
  flowers,
  onToggle,
  onBack,
  onEditFlower,
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return flowers.filter((f) => f.displayName.toLowerCase().includes(q));
  }, [flowers, search]);

  const customFlowers = filtered.filter((f) => f.isCustom);
  const catalogFlowers = filtered.filter((f) => !f.isCustom);

  const renderFlower = (flower) => (
    <li key={flower.id} className="flower-item">
      <label className="flower-label catalog-label">
        <FlowerRow
          flower={flower}
          checked={flower.inGarden}
          onToggle={() => onToggle(flower.id)}
          onEdit={onEditFlower ? () => onEditFlower(flower.id) : null}
        />
      </label>
    </li>
  );

  return (
    <>
      <button className="catalog-back" onClick={onBack}>
        ← {t('backButton')}
      </button>
      <div className="catalog-header">
        <h3 className="panel-title">{t('catalogTitle')}</h3>
        <p className="catalog-hint">{t('catalogHint')}</p>
      </div>
      <input
        type="text"
        className="panel-input catalog-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('searchPlaceholder')}
        autoFocus
      />
      <ul className="flower-items catalog-list">
        {customFlowers.map(renderFlower)}
        {customFlowers.length > 0 && catalogFlowers.length > 0 && (
          <li key="__divider" className="flower-divider-inline" aria-hidden />
        )}
        {catalogFlowers.map(renderFlower)}
      </ul>
    </>
  );
}
