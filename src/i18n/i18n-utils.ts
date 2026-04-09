import type { Lang } from '../types';

export const SUPPORTED: Lang[] = ['fr', 'en'];
export const DEFAULT_LANG: Lang = 'fr';
export const LANG_STORAGE_KEY = 'jardin-radial-lang';

function detectBrowserLang(): Lang {
  try {
    const nav = navigator.language.toLowerCase() || '';
    if (nav.startsWith('fr')) return 'fr';
    if (nav.startsWith('en')) return 'en';
  } catch {
    // No navigator (test environment)
  }
  return DEFAULT_LANG;
}

export function resolveLangFromPath(
  pathname: string,
  storedLang: string | null,
): Lang {
  const seg = pathname.split('/')[1];

  if (SUPPORTED.includes(seg as Lang)) return seg as Lang;

  if (storedLang && SUPPORTED.includes(storedLang as Lang))
    return storedLang as Lang;

  return detectBrowserLang();
}

export function resolveLang(): Lang {
  const pathname = window.location.pathname;
  const storedLang = localStorage.getItem(LANG_STORAGE_KEY);
  const lang = resolveLangFromPath(pathname, storedLang);

  const seg = pathname.split('/')[1];
  if (SUPPORTED.includes(seg as Lang)) {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    window.history.replaceState(null, '', '/');
  }

  return lang;
}

export function saveLang(lang: Lang): void {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

export function get(obj: Record<string, unknown>, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (o, k) =>
        o && typeof o === 'object'
          ? (o as Record<string, unknown>)[k]
          : undefined,
      obj,
    );
}

export function interpolate(
  str: unknown,
  vars?: Record<string, string>,
): unknown {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}
