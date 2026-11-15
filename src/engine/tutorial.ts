/**
 * Tutoriel du premier meeting (R-17, #42) : deux scénarios imposés, joués par le même moteur.
 * - `demo` (étapes 1 et 2) : Ginette, seule, dit une phrase correcte puis s'apprête à dire une phrase déplacée.
 * - `live` (étape 3) : Kevin rejoint Ginette ; elle dit une phrase correcte, puis lui une phrase déplacée.
 * Les répliques sont celles marquées `tuto` dans lines.<langue>.json (identifiants `<langue>-t-0n`).
 */
import { CONFIG, type ParticipantId } from "./config";
import type { Line, ScriptedTurn } from "./state";
import { createGame, step } from "./step";

export type TutorialScene = "demo" | "live";

const SCENES: Record<TutorialScene, { arrivals: { id: ParticipantId; atMs: number }[]; script: [ParticipantId, string][] }> = {
  demo: {
    arrivals: [{ id: "ginette", atMs: 0 }],
    script: [
      ["ginette", "t-01"],
      ["ginette", "t-02"],
    ],
  },
  live: {
    arrivals: [
      { id: "ginette", atMs: 0 },
      { id: "kevin", atMs: 400 },
    ],
    script: [
      ["ginette", "t-03"],
      ["kevin", "t-04"],
    ],
  },
};

/** Nombre de prises de parole d'une scène : l'étape est réussie quand elles se sont toutes bien passées. */
export function sceneLength(scene: TutorialScene): number {
  return SCENES[scene].script.length;
}

/** Partie d'une scène du tutoriel. Le guide (flèches) n'accompagne que la démonstration. */
export function createTutorialGame(scene: TutorialScene, lines: readonly Line[], lang: string) {
  const { arrivals, script } = SCENES[scene];
  const turns: ScriptedTurn[] = script.map(([participantId, key]) => ({ participantId, lineId: `${lang}-${key}` }));
  const game = createGame({
    lines,
    cafe: CONFIG.tutorial.cafe,
    seed: `tuto-${scene}`,
    durationMs: CONFIG.tutorial.durationMs,
    arrivals,
    script: turns,
    guided: scene === "demo",
    guideMs: CONFIG.tutorial.durationMs,
  });
  // Les participants présents dès le départ sont déjà là, même si le tutoriel démarre à l'arrêt.
  return step(game, 0).state;
}
