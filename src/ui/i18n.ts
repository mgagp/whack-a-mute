/** Fournit les textes de la langue choisie à toute l'interface (R-60). */
import { createContext, useContext } from "react";
import type { Lang } from "../content/lines";
import { STRINGS_EN } from "./strings.en";
import { STRINGS, type Strings } from "./strings.fr";

export const ALL_STRINGS: Record<Lang, Strings> = { fr: STRINGS, en: STRINGS_EN };

const StringsContext = createContext<Strings>(STRINGS);

export const StringsProvider = StringsContext.Provider;

export function useStrings(): Strings {
  return useContext(StringsContext);
}
