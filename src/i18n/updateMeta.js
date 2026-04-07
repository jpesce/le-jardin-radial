import fr from "./translations/fr.json";
import en from "./translations/en.json";

const translations = { fr, en };

function setMeta(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function sanitize(str) {
  return str.replace(/[<>"'&]/g, "");
}

export function updateMeta(lang, owner) {
  const meta = translations[lang].meta;
  const safe = owner ? sanitize(owner) : "";
  const title = safe
    ? meta.title.replace("{owner}", safe)
    : meta.titleDefault;

  document.title = title;
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="description"]', "content", meta.description);
  setMeta('meta[property="og:description"]', "content", meta.description);
  setMeta('meta[name="twitter:description"]', "content", meta.description);

  const base = "https://jardin.pesce.cc";
  const url = lang === "fr" ? base : `${base}/${lang}`;
  setMeta('meta[property="og:url"]', "content", url);
}
