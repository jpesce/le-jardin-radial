import { useI18n } from '../i18n/I18nContext';
import { cn } from '../utils/cn';

const BTN_BASE =
  'p-0 font-[inherit] text-muted tracking-[0.05em] cursor-pointer bg-transparent border-none transition-colors duration-150 hover:text-text';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex gap-[0.4em] items-center mb-3 text-xs text-muted">
      <button
        className={cn(BTN_BASE, lang === 'fr' && 'font-bold text-text')}
        aria-current={lang === 'fr' ? 'true' : undefined}
        onClick={() => {
          setLang('fr');
        }}
      >
        fr
      </button>
      <span>|</span>
      <button
        className={cn(BTN_BASE, lang === 'en' && 'font-bold text-text')}
        aria-current={lang === 'en' ? 'true' : undefined}
        onClick={() => {
          setLang('en');
        }}
      >
        en
      </button>
    </div>
  );
}
