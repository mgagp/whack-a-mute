/**
 * Chargement et validation de la banque de répliques (R-20).
 * On ajoute du contenu dans lines.<langue>.json sans toucher au code.
 */
import * as z from "zod/mini";
import type { Line } from "../engine/state";
import frRaw from "./lines.fr.json";

const participantId = z.enum(["ginette", "kevin", "josee", "boss"]);

export const LineSchema = z.object({
  id: z.string().check(z.minLength(1)),
  lang: z.string().check(z.minLength(2)),
  type: z.enum(["correcte", "deplacee"]),
  text: z.string().check(z.minLength(1)),
  signature: z.optional(z.boolean()),
  declencheur: z.optional(participantId),
  pasDitePar: z.optional(z.array(participantId)),
  note: z.optional(z.string()),
});

export const LineBankSchema = z.object({
  lang: z.string().check(z.minLength(2)),
  version: z.string(),
  lines: z.array(LineSchema).check(z.minLength(1)),
});

export type LineBank = z.infer<typeof LineBankSchema>;

/** Valide une banque brute et renvoie les répliques utilisables par le moteur. Lève une erreur sinon. */
export function parseLineBank(raw: unknown): Line[] {
  const bank = LineBankSchema.parse(raw);
  const seen = new Set<string>();
  for (const l of bank.lines) {
    if (seen.has(l.id)) throw new Error(`Réplique en double : ${l.id}`);
    if (l.lang !== bank.lang) throw new Error(`${l.id} : langue ${l.lang} ≠ ${bank.lang}`);
    seen.add(l.id);
  }
  return bank.lines.map(({ note: _note, ...line }) => line);
}

export const BANKS = { fr: frRaw } as const;
export type Lang = keyof typeof BANKS;

export function loadLines(lang: Lang = "fr"): Line[] {
  return parseLineBank(BANKS[lang]);
}
