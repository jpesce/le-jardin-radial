import { useI18n } from '../i18n/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';

/** App footer — language switcher, description, and credits. Absolute on desktop, stacked flow on mobile. */
export default function Footer() {
  const { t } = useI18n();

  return (
    <div className="sm:contents max-sm:mt-auto max-sm:w-full">
      {/* Description + language — bottom-left on desktop, flow on mobile */}
      <div className="absolute bottom-8 left-8 z-50 w-[max(200px,20vw)] max-sm:static max-sm:w-full max-sm:mt-10">
        <LanguageSwitcher />
        <p className="text-xs font-normal leading-[1.6] text-fg">
          <strong className="font-bold">{t('descriptionBrand')}</strong>{' '}
          {t('descriptionBody')}
        </p>
      </div>

      {/* Credits — bottom-right on desktop, below description on mobile */}
      <p className="absolute right-8 bottom-8 z-50 w-[360px] text-xs font-normal leading-[1.6] text-fg text-left max-sm:static max-sm:w-full max-sm:mt-4">
        {t('credits')}
      </p>
    </div>
  );
}
