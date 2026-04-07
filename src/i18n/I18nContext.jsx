import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import fr from "./translations/fr.json";
import en from "./translations/en.json";

const translations = { fr, en };
export const SUPPORTED = ["fr", "en"];
export const DEFAULT_LANG = "fr";

export function resolveLang(pathname = window.location.pathname) {
  const seg = pathname.split("/")[1];
  return SUPPORTED.includes(seg) ? seg : DEFAULT_LANG;
}

export function get(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}

export function interpolate(str, vars) {
  if (!vars || typeof str !== "string") return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(resolveLang);

  const setLang = useCallback((newLang) => {
    if (!SUPPORTED.includes(newLang) || newLang === lang) return;
    setLangState(newLang);
    const path = newLang === DEFAULT_LANG ? "/" : `/${newLang}`;
    window.history.pushState(null, "", path);
  }, [lang]);

  // Sync on browser back/forward
  useEffect(() => {
    const handler = () => setLangState(resolveLang());
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  // Update <html lang>
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const val = get(translations[lang], key);
      if (val === undefined) return key;
      if (typeof val === "string") return interpolate(val, vars);
      return val; // arrays, objects
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
