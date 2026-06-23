import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, , lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const cleanPath = path.replace(base, "");
    
    // remove leading slash for manipulation
    const strippedPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
    
    // if target lang is default, return path without lang prefix
    if (l === defaultLang) {
      // Need to strip any existing lang prefix if we are on a translated page
      const parts = strippedPath.split('/');
      if (parts[0] in ui) {
        parts.shift();
      }
      return `${base}/${parts.join('/')}`;
    }
    
    // if target lang is not default
    const parts = strippedPath.split('/');
    if (parts[0] in ui) {
      parts[0] = l; // replace existing lang
      return `${base}/${parts.join('/')}`;
    }
    
    // prepend lang
    return `${base}/${l}/${strippedPath}`.replace(/\/+$/, '');
  }
}
