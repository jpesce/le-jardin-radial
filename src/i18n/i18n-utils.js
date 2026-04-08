export const SUPPORTED = ['fr', 'en'];
export const DEFAULT_LANG = 'fr';

export function resolveLang(pathname = window.location.pathname) {
  const seg = pathname.split('/')[1];
  return SUPPORTED.includes(seg) ? seg : DEFAULT_LANG;
}

export function get(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj);
}

export function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
