/**
 * Boucle d'animation : fait avancer le moteur à chaque image et relaie ses événements.
 * L'interface ne recalcule aucune règle : elle lit l'état et réagit aux événements.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG, type CafeLevel, type ParticipantId } from "../engine/config";
import type { GameEvent, GameState, Line } from "../engine/state";
import { createGame, step } from "../engine/step";

export interface GameView {
  game: GameState;
  /** Événements récents, pour les effets visuels (triés du plus ancien au plus récent). */
  recent: GameEvent[];
}

/** On garde les événements assez longtemps pour le plus long effet visuel. */
const RECENT_WINDOW_MS = Math.max(
  CONFIG.ui.toastMs,
  CONFIG.ui.blunderOverlayMs,
  CONFIG.ui.reactionMs,
  CONFIG.ui.joinBounceMs,
  CONFIG.resultDisplayMs,
);

export function useGame(opts: {
  lines: readonly Line[];
  cafe: CafeLevel;
  seed: string;
  speed: number;
  participants?: number;
  guided: boolean;
  onEvents: (events: GameEvent[]) => void;
}) {
  const [view, setView] = useState<GameView>(() => ({
    game: createGame({ lines: opts.lines, cafe: opts.cafe, seed: opts.seed, participants: opts.participants, guided: opts.guided }),
    recent: [],
  }));
  const viewRef = useRef(view);
  const onEventsRef = useRef(opts.onEvents);
  onEventsRef.current = opts.onEvents;

  const commit = useCallback((game: GameState, events: GameEvent[]) => {
    const recent = [...viewRef.current.recent, ...events].filter((e) => game.t - e.t <= RECENT_WINDOW_MS);
    const next = { game, recent };
    viewRef.current = next;
    setView(next);
    if (events.length) onEventsRef.current(events);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(now - last, CONFIG.maxFrameMs) * opts.speed;
      last = now;
      const r = step(viewRef.current.game, dt);
      commit(r.state, r.events);
      if (!r.state.over) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [commit, opts.speed]);

  /** Le clic est appliqué tout de suite (pas de délai d'une image) : retour en moins de 100 ms (R-30). */
  const tap = useCallback(
    (participantId: ParticipantId) => {
      const r = step(viewRef.current.game, 0, [{ type: "tap", participantId }]);
      commit(r.state, r.events);
    },
    [commit],
  );

  return { view, tap };
}
