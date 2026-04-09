import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import fr from './translations/fr.json';
import en from './translations/en.json';
import {
  SUPPORTED,
  resolveLang,
  saveLang,
  get,
  interpolate,
} from './i18n-utils';
import type { Lang } from '../types';

interface I18nContextValue {
  lang: Lang;
  t: (key: string, vars?: Record<string, string>) => string | string[];
  setLang: (lang: Lang) => void;
}

const translations: Record<Lang, Record<string, unknown>> = { fr, en };
const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [lang, setLangState] = useState<Lang>(resolveLang);

  const setLang = useCallback(
    (newLang: Lang) => {
      if (!SUPPORTED.includes(newLang) || newLang === lang) return;
      setLangState(newLang);
      saveLang(newLang);
    },
    [lang],
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string | string[] => {
      const val = get(translations[lang], key);
      if (val === undefined) return key;
      if (typeof val === 'string') return interpolate(val, vars) as string;
      return val as string[];
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook + provider is the standard React context pattern
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
