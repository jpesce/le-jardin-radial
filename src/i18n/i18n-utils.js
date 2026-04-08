export const SUPPORTED = ['fr', 'en'];
export const DEFAULT_LANG = 'fr';
export const LANG_STORAGE_KEY = 'jardin-radial-lang';

function detectBrowserLang() {
  try {
    const nav = navigator.language?.toLowerCase() || '';
    if (nav.startsWith('fr')) return 'fr';
    if (nav.startsWith('en')) return 'en';
  } catch {
    // No navigator (test environment)
  }
  return DEFAULT_LANG;
}

export function resolveLangFromPath(pathname, storedLang) {
  const seg = pathname.split('/')[1];

  // /en or /fr → return the explicit language
  if (SUPPORTED.includes(seg)) return seg;

  // /share/... or / → check stored preference → browser → default
  if (storedLang && SUPPORTED.includes(storedLang)) return storedLang;

  return detectBrowserLang();
}

export function resolveLang() {
  const pathname = window.location.pathname;
  const storedLang = localStorage.getItem(LANG_STORAGE_KEY);
  const lang = resolveLangFromPath(pathname, storedLang);

  // If URL had /en or /fr, persist and clean URL
  const seg = pathname.split('/')[1];
  if (SUPPORTED.includes(seg)) {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    window.history.replaceState(null, '', '/');
  }

  return lang;
}

export function saveLang(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

export function get(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

export function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
