import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import fr from './translations/fr.json';
import en from './translations/en.json';
import {
  SUPPORTED,
  DEFAULT_LANG,
  resolveLang,
  get,
  interpolate,
} from './i18n-utils.js';

const translations = { fr, en };
const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(resolveLang);

  const setLang = useCallback(
    (newLang) => {
      if (!SUPPORTED.includes(newLang) || newLang === lang) return;
      setLangState(newLang);
      const path = newLang === DEFAULT_LANG ? '/' : `/${newLang}`;
      window.history.pushState(null, '', path);
    },
    [lang],
  );

  // Sync on browser back/forward
  useEffect(() => {
    const handler = () => setLangState(resolveLang());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Update <html lang>
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const val = get(translations[lang], key);
      if (val === undefined) return key;
      if (typeof val === 'string') return interpolate(val, vars);
      return val; // arrays, objects
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook + provider is the standard React context pattern
export function useI18n() {
  return useContext(I18nContext);
}
