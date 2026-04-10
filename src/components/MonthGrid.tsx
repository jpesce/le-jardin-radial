import { useI18n } from '../i18n/I18nContext';
import { DEFAULT_BLOOM_COLOR, DEFAULT_STATE_COLORS } from '../data/colors';
import { isLight } from './logo-colors';
import type { FlowerState } from '../types';

const STATES: FlowerState[] = ['dormant', 'sprouting', 'blooming', 'foliage'];

interface MonthGridProps {
  value: FlowerState[];
  onChange: (value: FlowerState[]) => void;
  bloomColor?: string;
}

export default function MonthGrid({
  value,
  onChange,
  bloomColor = DEFAULT_BLOOM_COLOR,
}: MonthGridProps) {
  const { t } = useI18n();
  const months = t('months') as string[];

  const cycle = (idx: number) => {
    const next = [...value];
    const current = STATES.indexOf(next[idx] ?? 'dormant');
    next[idx] = STATES[(current + 1) % STATES.length] ?? 'dormant';
    onChange(next);
  };

  return (
    <div className="relative grid grid-cols-3 mt-1 overflow-hidden rounded-md after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:border after:border-[rgb(0_0_0/10%)] after:rounded-md">
      {value.map((state, i) => {
        const bg =
          state === 'blooming' ? bloomColor : DEFAULT_STATE_COLORS[state];
        const textColor = isLight(bg)
          ? 'rgba(0,0,0,0.6)'
          : 'rgba(255,255,255,0.9)';

        return (
          <button
            key={i}
            className="flex flex-col gap-0.5 items-center justify-center py-[0.4rem] cursor-pointer border-0 border-r border-b border-solid border-r-[rgb(0_0_0/10%)] border-b-[rgb(0_0_0/10%)] rounded-none transition-opacity duration-150 hover:opacity-80 [&:nth-child(3n)]:border-r-0 [&:nth-last-child(-n+3)]:border-b-0"
            style={{ background: bg, color: textColor }}
            onClick={() => {
              cycle(i);
            }}
            title={months[i]}
            type="button"
          >
            <span className="font-[inherit] text-2xs font-bold lowercase tracking-[0.05em] pointer-events-none opacity-90">
              {months[i]}
            </span>
            <span className="font-[inherit] text-[9.5px] lowercase tracking-[0.03em] pointer-events-none opacity-55">
              {t('states.' + state)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
