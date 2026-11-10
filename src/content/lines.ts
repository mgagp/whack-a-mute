/**
 * Chargement et validation de la banque de répliques (R-20).
 * On ajoute du contenu dans lines.<langue>.json sans toucher au code.
 */
import { z } from "zod";
import type { Line } from "../engine/state";
import frRaw from "./lines.fr.json";

const participantId = z.enum(["ginette", "kevin", "josee", "boss"]);

export const LineSchema = z.object({
  id: z.string().min(1),
  lang: z.string().min(2),
  type: z.enum(["correcte", "deplacee"]),
  text: z.string().min(1),
  signature: z.boolean().optional(),
  declencheur: participantId.optional(),
  note: z.string().optional(),
});

export const LineBankSchema = z
  .object({
    lang: z.string().min(2),
    version: z.string(),
    lines: z.array(LineSchema).min(1),
  })
  .superRefine((bank, ctx) => {
    const seen = new Set<string>();
    for (const l of bank.lines) {
      if (seen.has(l.id)) ctx.addIssue({ code: "custom", message: `Identifiant en double : ${l.id}` });
      seen.add(l.id);
      if (l.lang !== bank.lang)
        ctx.addIssue({ code: "custom", message: `${l.id} : langue ${l.lang} ≠ ${bank.lang}` });
    }
  });

export type LineBank = z.infer<typeof LineBankSchema>;

/** Valide une banque brute et renvoie les répliques utilisables par le moteur. Lève une erreur sinon. */
export function parseLineBank(raw: unknown): Line[] {
  const bank = LineBankSchema.parse(raw);
  return bank.lines.map(({ note: _note, ...line }) => line);
}

export const BANKS = { fr: frRaw } as const;
export type Lang = keyof typeof BANKS;

export function loadLines(lang: Lang = "fr"): Line[] {
  return parseLineBank(BANKS[lang]);
}
