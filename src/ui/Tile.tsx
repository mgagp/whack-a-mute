/** Tuile d'un participant : avatar, micro, bulle d'annonce et retour visuel des résultats (R-30). */
import { m as motion } from "motion/react";
import { memo } from "react";
import type { ParticipantId } from "../engine/config";
import type { Outcome, Participant } from "../engine/state";
import { turnProgress } from "../engine/step";
import { Avatar, type Mood } from "./Avatar";
import { Boom, MicIcon } from "./Icons";
import { STRINGS } from "./strings.fr";

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
  const speaking = state === "normal" || state === "blunder";
  const micLabel = mic === "muted" ? STRINGS.game.micMuted : mic === "open" ? STRINGS.game.micOpen : STRINGS.game.micIdle;

  return (
    <motion.button
      type="button"
      className={`tile ${COLOR[p.id]} state-${state}${speaking ? " speaking" : ""}`}
      data-testid={`tile-${p.id}`}
      data-state={state}
      data-mic={mic}
      data-type={debug && p.turn ? p.turn.line.type : undefined}
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
        <div className="bubble" key={p.turn.line.id} style={{ ["--p" as string]: progress }}>
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
                  stroke: progress < 0.55 ? "var(--turq)" : progress < 0.8 ? "var(--warn)" : "var(--mute)",
                }}
              />
            </svg>
            {STRINGS.game.willSay}
          </div>
          <q>{p.turn.line.text}</q>
        </div>
      )}

      {result && (state === "normal" || state === "blunder") && (
        <div className={`bubble said ${state}`} key={`r-${result.line.id}`}>
          <div className="tag">{STRINGS.game.said}</div>
          <q>{result.line.text}</q>
        </div>
      )}

      {result && state === "intercepted" && (
        <div className="bubble hushed" key={`r-${result.line.id}`}>
          <div className="tag">{s.feminine ? STRINGS.game.cutF : STRINGS.game.cutM}</div>
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
          <span className="stamp">{STRINGS.game.stamp}</span>
          {SPARKS.map((k, i) => (
            <span key={i} className="spark" style={{ ["--dx" as string]: `${k.dx}px`, ["--dy" as string]: `${k.dy}px`, background: k.c }} />
          ))}
          <Boom text={STRINGS.game.boom} className="boom" />
        </span>
      )}
    </motion.button>
  );
});
