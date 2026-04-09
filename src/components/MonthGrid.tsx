import { useI18n } from '../i18n/I18nContext';
import { DEFAULT_STATE_COLORS } from '../data/colors';
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
  bloomColor = '#E84393',
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
    <div className="month-grid">
      {value.map((state, i) => {
        const bg =
          state === 'blooming' ? bloomColor : DEFAULT_STATE_COLORS[state];
        const textColor = isLight(bg)
          ? 'rgba(0,0,0,0.6)'
          : 'rgba(255,255,255,0.9)';

        return (
          <button
            key={i}
            className="month-cell"
            style={{ background: bg, color: textColor }}
            onClick={() => {
              cycle(i);
            }}
            title={months[i]}
            type="button"
          >
            <span className="month-cell-label">{months[i]}</span>
            <span className="month-cell-state">{t('states.' + state)}</span>
          </button>
        );
      })}
    </div>
  );
}
