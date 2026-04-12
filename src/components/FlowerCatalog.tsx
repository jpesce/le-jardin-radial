import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import FlowerRow from './FlowerRow';
import type { EnrichedFlower } from '../types';

interface FlowerCatalogProps {
  flowers: EnrichedFlower[];
  onToggle: (id: string) => void;
  onBack: () => void;
  onEditFlower?: ((id: string) => void) | null;
}

export default function FlowerCatalog({
  flowers,
  onToggle,
  onBack,
  onEditFlower,
}: FlowerCatalogProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return flowers.filter((f) => f.displayName.toLowerCase().includes(q));
  }, [flowers, search]);

  const customFlowers = filtered.filter((f) => f.isCustom);
  const catalogFlowers = filtered.filter((f) => !f.isCustom);

  const renderFlower = (flower: EnrichedFlower) => (
    <li key={flower.id} className="group relative">
      <label className="flex flex-1 gap-[0.5rem] items-center py-[0.25rem] text-xs text-subtle cursor-pointer pl-0">
        <FlowerRow
          flower={flower}
          checked={!!flower.inGarden}
          onToggle={() => {
            onToggle(flower.id);
          }}
          onEdit={
            onEditFlower
              ? () => {
                  onEditFlower(flower.id);
                }
              : null
          }
        />
      </label>
    </li>
  );

  return (
    <>
      <button
        className="group/back self-start flex gap-[0.35rem] items-center p-0 font-[inherit] text-xs text-muted lowercase tracking-[0.03em] cursor-pointer bg-transparent border-none hover:text-fg"
        onClick={onBack}
      >
        <ArrowLeft
          className="shrink-0 transition-transform duration-150 ease-out group-hover/back:-translate-x-[3px]"
          size={11}
        />
        {t('backButton')}
      </button>
      <div className="flex flex-col pb-[0.4rem]">
        <h3 className="pt-2 text-xs font-bold text-muted uppercase tracking-[0.05em]">
          {t('catalogTitle')}
        </h3>
        <p className="mt-[0.15rem] text-2xs text-faint lowercase tracking-[0.03em]">
          {t('catalogHint')}
        </p>
      </div>
      <input
        type="text"
        className="w-full mt-0 px-[0.6rem] py-[0.4rem] font-[inherit] text-xs text-fg outline-none bg-surface-input border border-border rounded-md transition-[border-color] duration-150 focus:bg-surface focus:border-border-hover"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
        }}
        placeholder={t('searchPlaceholder') as string}
        autoFocus
      />
      <ul className="flex flex-col mt-3 list-none">
        {customFlowers.map(renderFlower)}
        {customFlowers.length > 0 && catalogFlowers.length > 0 && (
          <li
            key="__divider"
            className="h-px my-[0.4rem] bg-divider"
            aria-hidden
          />
        )}
        {catalogFlowers.map(renderFlower)}
      </ul>
    </>
  );
}
