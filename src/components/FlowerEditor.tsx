import { useState, type SyntheticEvent } from 'react';
import { CircleAlert } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import Button from './Button';
import MonthGrid from './MonthGrid';
import { parseMonths } from '../data/months';
import type {
  EnrichedFlower,
  FlowerState,
  MonthsConfig,
  CustomFlowerData,
} from '../types';

const DEFAULT_MONTHS: FlowerState[] = new Array<FlowerState>(12).fill(
  'dormant',
);

function compactMonths(states: FlowerState[]): MonthsConfig {
  const result: MonthsConfig = {};
  let i = 0;
  while (i < 12) {
    const state = states[i] ?? 'dormant';
    let end = i;
    while (end + 1 < 12 && states[end + 1] === state) end++;
    const key = i === end ? `${i + 1}` : `${i + 1}-${end + 1}`;
    result[key] = state;
    i = end + 1;
  }
  return result;
}

interface FlowerEditorProps {
  flower: EnrichedFlower | null | undefined;
  onSave: (data: CustomFlowerData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export default function FlowerEditor({
  flower,
  onSave,
  onCancel,
  onDelete,
}: FlowerEditorProps) {
  const { t } = useI18n();

  const [nameEn, setNameEn] = useState(flower?.names.en ?? '');
  const [nameFr, setNameFr] = useState(flower?.names.fr ?? '');
  const [scientificName, setScientificName] = useState(
    flower?.scientificName ?? '',
  );
  const [bloomColor, setBloomColor] = useState(
    flower?.colors.blooming ?? '#E84393',
  );
  const [monthStates, setMonthStates] = useState<FlowerState[]>(
    flower?.monthStates ??
      (flower?.months ? parseMonths(flower.months) : [...DEFAULT_MONTHS]),
  );
  const [attempted, setAttempted] = useState(false);

  const missingNameEn = nameEn.trim().length === 0;
  const missingNameFr = nameFr.trim().length === 0;
  const invalidColor = !/^#[0-9a-fA-F]{6}$/.test(bloomColor);
  const noBlooming = !monthStates.includes('blooming');
  const isValid =
    !missingNameEn && !missingNameFr && !invalidColor && !noBlooming;

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!isValid) return;
    onSave({
      names: { en: nameEn.trim(), fr: nameFr.trim() },
      scientificName: scientificName.trim(),
      colors: { blooming: bloomColor },
      months: compactMonths(monthStates),
    });
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <button
        className="self-start p-0 font-[inherit] text-xs text-muted lowercase tracking-[0.03em] cursor-pointer bg-transparent border-none hover:text-text"
        onClick={onCancel}
        type="button"
      >
        ← {t('cancel')}
      </button>

      <label className="flex flex-col gap-1 text-xs text-muted lowercase tracking-[0.03em]">
        {t('flowerNameEn')}
        <input
          type="text"
          className="w-full m-0 px-[0.6rem] py-[0.4rem] font-[inherit] text-xs text-text outline-none bg-bg-input border border-border rounded-md transition-[border-color] duration-150 focus:bg-bg focus:border-border-hover"
          value={nameEn}
          onChange={(e) => {
            setNameEn(e.target.value);
          }}
          autoFocus
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted lowercase tracking-[0.03em]">
        {t('flowerNameFr')}
        <input
          type="text"
          className="w-full m-0 px-[0.6rem] py-[0.4rem] font-[inherit] text-xs text-text outline-none bg-bg-input border border-border rounded-md transition-[border-color] duration-150 focus:bg-bg focus:border-border-hover"
          value={nameFr}
          onChange={(e) => {
            setNameFr(e.target.value);
          }}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted lowercase tracking-[0.03em]">
        {t('scientificName')}
        <input
          type="text"
          className="w-full m-0 px-[0.6rem] py-[0.4rem] font-[inherit] text-xs text-text outline-none bg-bg-input border border-border rounded-md transition-[border-color] duration-150 focus:bg-bg focus:border-border-hover"
          value={scientificName}
          onChange={(e) => {
            setScientificName(e.target.value);
          }}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted lowercase tracking-[0.03em]">
        {t('bloomColor')}
        <div className="flex gap-2 items-center">
          <input
            type="color"
            className="shrink-0 w-8 h-8 p-0 overflow-hidden appearance-none cursor-pointer bg-transparent border-none rounded-md [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full"
            value={bloomColor}
            onChange={(e) => {
              setBloomColor(e.target.value);
            }}
          />
          <input
            type="text"
            className="flex-1 m-0 px-[0.6rem] py-[0.4rem] font-[inherit] text-xs text-text outline-none bg-bg-input border border-border rounded-md transition-[border-color] duration-150 focus:bg-bg focus:border-border-hover"
            value={bloomColor}
            onChange={(e) => {
              setBloomColor(e.target.value);
            }}
            maxLength={7}
          />
        </div>
      </label>

      <div className="flex flex-col gap-1 text-xs text-muted lowercase tracking-[0.03em]">
        {t('monthSchedule')}
        <MonthGrid
          value={monthStates}
          onChange={setMonthStates}
          bloomColor={bloomColor}
        />
      </div>

      <div className="flex gap-2 pt-2 [&>*]:flex-1">
        <Button variant="outline" size="md" onClick={onCancel} type="button">
          {t('cancel')}
        </Button>
        <Button variant="solid" size="md" type="submit">
          {t('save')}
        </Button>
      </div>
      {attempted && !isValid && (
        <p className="flex gap-[0.3rem] items-center justify-center text-2xs text-warning">
          <CircleAlert size={12} />
          {missingNameEn || missingNameFr
            ? t('validationName')
            : invalidColor
              ? t('validationColor')
              : noBlooming
                ? t('validationBlooming')
                : ''}
        </p>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          color="danger"
          className="self-center pt-2"
          onClick={onDelete}
          type="button"
        >
          {t('deleteFlower')}
        </Button>
      )}
    </form>
  );
}
