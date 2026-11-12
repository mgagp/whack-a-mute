/** Tuile d'un participant : avatar, micro, bulle d'annonce et retour visuel des résultats (R-30). */
import { m as motion } from "motion/react";
import { memo } from "react";
import { CONFIG, type ParticipantId } from "../engine/config";
import type { Outcome, Participant } from "../engine/state";
import { turnProgress } from "../engine/step";
import { Avatar, type Mood } from "./Avatar";
import { Boom, MicIcon, ThoughtCloud } from "./Icons";
import { useStrings } from "./i18n";

const COLOR: Record<ParticipantId, string> = { ginette: "coral", kevin: "turq", josee: "sun", boss: "lime" };
const TIMER_LEN = 2 * Math.PI * 8;
const SPARKS = [
  { dx: -58, dy: -30, c: "var(--mute)" },
  { dx: 56, dy: -38, c: "var(--turq)" },
  { dx: -48, dy: 34, c: "var(--live)" },
  { dx: 60, dy: 28, c: "#fff" },
  { dx: 4, dy: -60, c: "var(--violet)" },
  { dx: -14, dy: 58, c: "var(--sun)" },
];

/**
 * Flèches du guide (R-15), autour de la tuile, chacune tournée vers le centre.
 * Le bas est laissé libre pour l'étiquette « Coupe-le ! ».
 */
const GUIDE_ARROWS = [
  { x: "6%", y: "6%", r: 45 },
  { x: "50%", y: "0%", r: 90 },
  { x: "94%", y: "6%", r: 135 },
  { x: "100%", y: "50%", r: 180 },
  { x: "94%", y: "94%", r: 225 },
  { x: "6%", y: "94%", r: 315 },
  { x: "0%", y: "50%", r: 0 },
];

/** Palier du compte à rebours : l'anneau et le guide changent de couleur ensemble. */
export type TimerLevel = "calm" | "warn" | "urgent";
export function timerLevel(progress: number): TimerLevel {
  return progress < CONFIG.ui.timerWarnAt ? "calm" : progress < CONFIG.ui.timerUrgentAt ? "warn" : "urgent";
}
const RING_COLOR: Record<TimerLevel, string> = { calm: "var(--turq)", warn: "var(--warn)", urgent: "var(--mute)" };

export type TileState = "idle" | "announcing" | Outcome;

export interface TileProps {
  p: Participant;
  t: number;
  /** Un autre participant vient de commettre un impair : on réagit (😬). */
  reacting: boolean;
  /** Vrai pendant le rebond d'arrivée. */
  justJoined: boolean;
  debug: boolean;
  onTap: (id: ParticipantId) => void;
}

export const Tile = memo(function Tile({ p, t, reacting, justJoined, debug, onTap }: TileProps) {
  const STRINGS = useStrings();
  const s = STRINGS.participants[p.id];
  const result = p.lastResult && t < p.restUntil ? p.lastResult : null;
  const state: TileState = p.turn ? "announcing" : result ? result.outcome : "idle";
  const mic = p.turn ? p.turn.mic : result && (result.outcome === "intercepted" || result.outcome === "wrongMute") ? "muted" : state === "idle" ? "idle" : "open";

  let mood: Mood = "neutral";
  if (state === "announcing") mood = p.turn!.mic === "muted" ? "neutral" : "smirk";
  else if (state === "normal") mood = "talk";
  else if (state === "blunder") mood = "talk";
  else if (state === "intercepted") mood = "oops";
  else if (state === "wrongMute") mood = "shocked";
  else if (reacting) mood = "shocked";

  const progress = p.turn ? turnProgress(p.turn, t) : 0;
  const level = timerLevel(progress);
  // Guide (R-15) : phrase déplacée annoncée pendant le premier meeting, tant que le micro est ouvert.
  const guiding = !!p.turn?.guided && p.turn.mic === "open";
  const speaking = state === "normal" || state === "blunder";
  const micLabel = mic === "muted" ? STRINGS.game.micMuted : mic === "open" ? STRINGS.game.micOpen : STRINGS.game.micIdle;

  return (
    <motion.button
      type="button"
      className={`tile ${COLOR[p.id]} state-${state}${speaking ? " speaking" : ""}`}
      data-testid={`tile-${p.id}`}
      data-state={state}
      data-self={result?.selfMuted ? "true" : undefined}
      data-mic={mic}
      data-type={debug && p.turn ? p.turn.line.type : undefined}
      data-guide={guiding ? level : undefined}
      aria-label={STRINGS.game.tileLabel(s.name, micLabel)}
      onPointerDown={(e) => {
        e.preventDefault();
        onTap(p.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap(p.id);
        }
      }}
      initial={justJoined ? { scale: 0.2, rotate: -8, opacity: 0 } : false}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 16 }}
    >
      {state === "announcing" && p.turn && (
        <div className="bubble think" key={p.turn.line.id} style={{ ["--p" as string]: progress }}>
          <ThoughtCloud className="cloud" />
          <div className="tag">
            <svg className="timer" viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="10" cy="10" r="8" className="timer-track" />
              <circle
                cx="10"
                cy="10"
                r="8"
                className="prog"
                style={{
                  strokeDasharray: TIMER_LEN,
                  strokeDashoffset: TIMER_LEN * progress,
                  stroke: RING_COLOR[level],
                }}
              />
            </svg>
            {STRINGS.game.willSay}
          </div>
          <q>{p.turn.line.text}</q>
        </div>
      )}

      {guiding && p.turn && (
        <span className={`guide-band lvl-${level}`} key={`g-${p.turn.line.id}`} data-testid={`guide-${p.id}`} aria-hidden="true">
          {GUIDE_ARROWS.map((a, i) => (
            <span key={i} className="guide-arrow" style={{ left: a.x, top: a.y, rotate: `${a.r}deg` }}>
              <svg viewBox="0 0 28 24">
                <path d="M2 2 L26 12 L2 22 L9 12 Z" />
              </svg>
            </span>
          ))}
        </span>
      )}
      {guiding && p.turn && (
        // Hors de la bande : l'étiquette passe au-dessus du nom, alors que les flèches passent dessous.
        <span className={`guide-tag lvl-${level}`} key={`gt-${p.turn.line.id}`} aria-hidden="true">
          {s.feminine ? STRINGS.game.guideTapF : STRINGS.game.guideTap}
        </span>
      )}

      {result && (state === "normal" || state === "blunder") && (
        <div className={`bubble said ${state}`} key={`r-${result.line.id}`}>
          <div className="tag">{STRINGS.game.said}</div>
          <q>{result.line.text}</q>
        </div>
      )}

      {result && state === "intercepted" && (
        <div className="bubble hushed" key={`r-${result.line.id}`}>
          <div className="tag">{result.selfMuted ? STRINGS.game.selfMutedTag : s.feminine ? STRINGS.game.cutF : STRINGS.game.cutM}</div>
          <q>{result.line.text}</q>
          <span className="note">{STRINGS.game.nobodyHeard}</span>
        </div>
      )}

      {result && state === "wrongMute" && (
        <div className="bubble hushed wrong" key={`r-${result.line.id}`}>
          <div className="tag">{STRINGS.game.wrongMuteTag}</div>
          <span className="say">{STRINGS.game.wrongMuteSay}</span>
        </div>
      )}

      <span className="avatar-wrap">
        <Avatar who={p.id} mood={mood} className="avatar" />
        {reacting && !p.turn && <span className="reaction">{STRINGS.game.oops}</span>}
      </span>

      <span className={`mic ${mic}`} key={`mic-${mic}`}>
        <MicIcon muted={mic === "muted"} className="icon-mic" />
      </span>
      <span className="name">
        {s.name} <em>{s.role}</em>
      </span>

      {result && state === "intercepted" && (
        <span className="fx" key={`fx-${result.line.id}`}>
          <span className={result.selfMuted ? "stamp self" : "stamp"}>{result.selfMuted ? STRINGS.game.stampSelf : STRINGS.game.stamp}</span>
          {SPARKS.map((k, i) => (
            <span key={i} className="spark" style={{ ["--dx" as string]: `${k.dx}px`, ["--dy" as string]: `${k.dy}px`, background: k.c }} />
          ))}
          {/* « SCHLAC ! » seulement quand le joueur a coupé lui-même (#29). */}
          {!result.selfMuted && <Boom text={STRINGS.game.boom} className="boom" />}
        </span>
      )}
    </motion.button>
  );
});
