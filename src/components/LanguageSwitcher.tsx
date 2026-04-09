import { useI18n } from '../i18n/I18nContext';

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <div className="lang-switcher">
      <button
        className={'lang-btn' + (lang === 'fr' ? ' lang-btn--active' : '')}
        aria-current={lang === 'fr' ? 'true' : undefined}
        onClick={() => {
          setLang('fr');
        }}
      >
        fr
      </button>
      <span className="lang-divider">|</span>
      <button
        className={'lang-btn' + (lang === 'en' ? ' lang-btn--active' : '')}
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
