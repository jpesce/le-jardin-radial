import { useI18n } from '../i18n/I18nContext.jsx';
import { DEFAULT_STATE_COLORS } from '../data/colors.js';

const STATES = ['dormant', 'sprouting', 'blooming', 'foliage'];

function isLight(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}

export default function MonthGrid({ value, onChange, bloomColor = '#E84393' }) {
  const { t } = useI18n();
  const months = t('months');

  const cycle = (idx) => {
    const next = [...value];
    const current = STATES.indexOf(next[idx]);
    next[idx] = STATES[(current + 1) % STATES.length];
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
            onClick={() => cycle(i)}
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
