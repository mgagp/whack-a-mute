/**
 * Choix de la langue (R-60). Ordre de priorité :
 * 1. `?lang=` dans l'adresse ;
 * 2. la page elle-même : `/en/` est le lien anglais, celui qu'on partage ;
 * 3. le choix mémorisé du joueur ;
 * 4. la langue de l'appareil : français si elle commence par « fr », anglais sinon.
 */
import type { Lang } from "../content/lines";

const STORAGE_KEY = "whack-a-mute:langue";
export const LANGS: readonly Lang[] = ["fr", "en"];

export function isLang(x: unknown): x is Lang {
  return x === "fr" || x === "en";
}

export interface LangSources {
  param: string | null;
  pageLang: string | undefined;
  stored: string | null;
  deviceLangs: readonly string[];
}

export function resolveLang({ param, pageLang, stored, deviceLangs }: LangSources): Lang {
  if (isLang(param)) return param;
  if (isLang(pageLang)) return pageLang;
  if (isLang(stored)) return stored;
  const first = deviceLangs[0]?.toLowerCase() ?? "";
  return first.startsWith("fr") ? "fr" : "en";
}

export function readStoredLang(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeLang(lang: Lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Stockage indisponible : le choix vaut pour la session seulement.
  }
}

/** Langue imposée par la page (`<html data-page-lang="en">` dans en/index.html), sinon rien. */
export function pageLang(): string | undefined {
  return document.documentElement.dataset.pageLang;
}

/**
 * Adresse à partager : la page anglaise (`…/en/`) a son propre aperçu de lien en anglais.
 * `pathname` est celui de la page courante, avec ou sans `en/` à la fin.
 */
export function shareUrl(origin: string, pathname: string, lang: Lang): string {
  const root = pathname.replace(/index\.html$/, "").replace(/en\/$/, "");
  return origin + root + (lang === "en" ? "en/" : "");
}
