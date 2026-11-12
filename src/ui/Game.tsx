/** Écran de la réunion : barre du haut, jauge d'harmonie, grille de 1 à 4 tuiles, notifications. */
import { m as motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { soundForEvent, play, isMuted, setMuted } from "../audio";
import { CONFIG, type CafeLevel, type ParticipantId } from "../engine/config";
import type { GameEvent, GameState, Line } from "../engine/state";
import { endTitleKey, meetingMinutes } from "../engine/step";
import { Deco } from "./Deco";
import { Mallet } from "./Icons";
import { useStrings } from "./i18n";
import { Tile } from "./Tile";
import { useGame } from "./useGame";

export const MOOD_FACE = { champion: "😄", modele: "🙂", unUn: "😐", rh: "😬", ecourtee: "😵" } as const;

function clock(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface Flash {
  id: number;
  x: number;
  y: number;
}

export function Game(props: {
  lines: readonly Line[];
  cafe: CafeLevel;
  seed: string;
  speed: number;
  participants?: number;
  debug: boolean;
  guided: boolean;
  onOver: (game: GameState) => void;
}) {
  const STRINGS = useStrings();
  const [muted, setMutedState] = useState(isMuted);
  const overSent = useRef(false);

  const onEvents = useCallback((events: GameEvent[]) => {
    for (const e of events) {
      const sound = soundForEvent(e);
      if (sound) play(sound);
    }
  }, []);

  const { view, tap } = useGame({ ...props, onEvents });
  const { game, recent } = view;

  useEffect(() => {
    if (!game.over || overSent.current) return;
    overSent.current = true;
    const id = setTimeout(() => props.onOver(game), CONFIG.ui.endScreenDelayMs / props.speed);
    return () => clearTimeout(id);
  }, [game, props]);

  // Effet marteau à l'endroit touché (R-32).
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const flashSeq = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => {
    const id = ++flashSeq.current;
    setFlashes((f) => [...f, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => setFlashes((f) => f.filter((x) => x.id !== id)), CONFIG.ui.tapFlashMs);
  };

  const age = (e: GameEvent) => game.t - e.t;
  const lastBlunder = [...recent].reverse().find(
    (e): e is Extract<GameEvent, { type: "resolved" }> => e.type === "resolved" && e.outcome === "blunder",
  );
  const blunderActive = lastBlunder && age(lastBlunder) < CONFIG.ui.blunderOverlayMs ? lastBlunder : null;
  const reactingTo: ParticipantId | null = lastBlunder && age(lastBlunder) < CONFIG.ui.reactionMs ? lastBlunder.participantId : null;

  const toastEvent = [...recent].reverse().find(
    (e) =>
      (e.type === "resolved" && e.outcome !== "normal") || (e.type === "participantJoined" && e.t > 0) || e.type === "guideEnded",
  );
  const toast = toastEvent && age(toastEvent) < CONFIG.ui.toastMs ? toastEvent : null;

  const joinedRecently = (id: ParticipantId) => {
    const p = game.participants.find((x) => x.id === id)!;
    return p.joinedAt > 0 && game.t - p.joinedAt < CONFIG.ui.joinBounceMs;
  };

  const n = game.participants.length;
  const titleKey = endTitleKey(game.harmony);

  return (
    <div className={`screen game${blunderActive ? " shake" : ""}`} data-testid="game" onPointerDownCapture={onPointerDown}>
      <Deco items={["☕", "📎", "📈", "🗒️"]} />
      <header className="topbar">
        <div className="brand">
          <i aria-hidden="true" />
          {STRINGS.appName}
        </div>
        <div className="meeting">
          {STRINGS.meetingName} · {STRINGS.cafe[props.cafe].cups}
          <br />
          <span className="clock" data-testid="clock">
            {clock(meetingMinutes(game))}
          </span>{" "}
          / {clock(CONFIG.meetingClock.startMinutes + CONFIG.meetingClock.durationMinutes)}
        </div>
      </header>

      <motion.div
        className={`harmony mood-${titleKey}`}
        key={game.harmony}
        initial={{ x: 0 }}
        animate={{ x: [0, -5, 5, -3, 0], rotate: [0, -1, 1, 0, 0] }}
        transition={{ duration: 0.32 }}
      >
        <div className="face" aria-hidden="true">
          {MOOD_FACE[titleKey]}
        </div>
        <div className="bar" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={game.harmony} aria-label={STRINGS.game.harmony}>
          <div className="fill" style={{ width: `${game.harmony}%` }} />
          <span data-testid="harmony">
            {STRINGS.game.harmony} · {STRINGS.percent(game.harmony)}
          </span>
        </div>
      </motion.div>

      <div className={`grid n${n}`}>
        {game.participants.map((p) => (
          <Tile
            key={p.id}
            p={p}
            t={game.t}
            reacting={reactingTo !== null && reactingTo !== p.id}
            justJoined={joinedRecently(p.id)}
            debug={props.debug}
            onTap={tap}
          />
        ))}
        {blunderActive && (
          <div className="blunder-overlay" key={blunderActive.id} aria-live="polite">
            <q>{blunderActive.line.text}</q>
            <span className="crickets" aria-hidden="true">
              🦗
            </span>
          </div>
        )}
      </div>

      <div className="toast-slot" aria-live="polite">
        {toast && (
          <div
            className={`toast ${toast.type === "resolved" ? toast.outcome : toast.type === "guideEnded" ? "guide-ended" : "joined"}`}
            key={toast.id}
            data-testid="toast"
          >
            {toast.type === "guideEnded"
              ? STRINGS.game.guideEnded
              : toast.type === "participantJoined"
              ? STRINGS.game.joined(STRINGS.participants[toast.participantId].name)
              : toast.type === "resolved" && toast.outcome !== "normal"
                ? STRINGS.game.toast[toast.selfMuted ? "selfMuted" : toast.outcome](toast.harmonyDelta)
                : null}
          </div>
        )}
      </div>

      <footer className="bottombar">
        <div className="chip" data-testid="chip-intercepted">
          {STRINGS.game.chipIntercepted(game.stats.intercepted)}
        </div>
        <div className="chip">{STRINGS.game.chipBlunders(game.stats.blunders)}</div>
        <SoundButton muted={muted} onChange={(m) => (setMuted(m), setMutedState(m))} />
      </footer>

      {flashes.map((f) => (
        <span key={f.id} className="tap-flash" style={{ left: f.x, top: f.y }} aria-hidden="true">
          <Mallet className="tap-mallet" />
        </span>
      ))}
    </div>
  );
}

export function SoundButton({ muted, onChange }: { muted: boolean; onChange: (muted: boolean) => void }) {
  const STRINGS = useStrings();
  return (
    <button
      type="button"
      className="sound"
      data-testid="sound"
      aria-pressed={muted}
      aria-label={muted ? STRINGS.game.soundOff : STRINGS.game.soundOn}
      title={muted ? STRINGS.game.soundOff : STRINGS.game.soundOn}
      onClick={() => onChange(!muted)}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
