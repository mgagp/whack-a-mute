/**
 * Tutoriel du premier meeting (R-17, #42) : trois étapes à l'arrêt, avec un geste pour avancer.
 * 1. Lire : le nuage et son contour (bouton « Compris »), puis une phrase correcte qu'on laisse passer.
 * 2. Couper : une phrase déplacée, figée, encerclée par le guide ; toucher la tuile fait avancer.
 * 3. À toi : une mini-réunion en direct, sans flèches. Une erreur arrête le temps et s'explique ; on réessaie.
 * Le moteur joue les scénarios de `engine/tutorial.ts` ; l'interface ne fait qu'arrêter le temps et choisir la carte.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { CONFIG, type ParticipantId } from "../engine/config";
import type { GameEvent, Line } from "../engine/state";
import { createTutorialGame, sceneLength } from "../engine/tutorial";
import type { Lang } from "../content/lines";
import { Avatar } from "./Avatar";
import { Game } from "./Game";
import { useStrings } from "./i18n";

type Phase =
  | "wait"
  | "think"
  | "watch"
  | "normal"
  | "mute"
  | "muted"
  | "intercepted"
  | "live"
  | "play"
  | "fail"
  | "done";

/** Phases où le temps est arrêté. */
const PAUSED: ReadonlySet<Phase> = new Set(["think", "mute", "intercepted", "live", "fail", "done"]);
const STEP: Record<Phase, 1 | 2 | 3> = {
  wait: 1,
  think: 1,
  watch: 1,
  normal: 1,
  mute: 2,
  muted: 2,
  intercepted: 2,
  live: 3,
  play: 3,
  fail: 3,
  done: 3,
};

interface Fail {
  participantId: ParticipantId;
  outcome: "blunder" | "wrongMute";
}

export function Tutorial(props: { lines: readonly Line[]; lang: Lang; speed: number; debug: boolean; onDone: () => void }) {
  const STRINGS = useStrings();
  const T = STRINGS.tuto;
  const [phase, setPhaseState] = useState<Phase>("wait");
  const phaseRef = useRef<Phase>("wait");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const [attempt, setAttempt] = useState(0);
  const [fail, setFail] = useState<Fail | null>(null);
  const okCount = useRef(0);

  const scene = STEP[phase] === 3 ? "live" : "demo";
  const { lines, lang } = props;
  const create = useMemo(() => () => createTutorialGame(scene, lines, lang), [scene, lines, lang]);

  const onEvents = useCallback((events: GameEvent[]) => {
    for (const e of events) {
      const p = phaseRef.current;
      if (e.type === "announced") {
        if (p === "wait") setPhase("think");
        else if (p === "normal") setPhase("mute");
      } else if (e.type === "micToggled") {
        if (p === "mute" && e.mic === "muted") setPhase("muted");
      } else if (e.type === "resolved") {
        if (p === "watch" && e.outcome === "normal") setPhase("normal");
        else if (p === "muted" && e.outcome === "intercepted") setPhase("intercepted");
        else if (p === "play") {
          if (e.outcome === "blunder" || e.outcome === "wrongMute") {
            setFail({ participantId: e.participantId, outcome: e.outcome });
            setPhase("fail");
          } else if (++okCount.current === sceneLength("live")) {
            setPhase("done");
          }
        }
      }
    }
  }, []);

  const startLive = () => {
    okCount.current = 0;
    setFail(null);
    setAttempt((a) => a + 1);
    setPhase("live");
  };

  const speedFactor = phase === "watch" || phase === "normal" ? CONFIG.tutorial.watchSpeed : phase === "muted" ? CONFIG.tutorial.fastForward : 1;

  let title: string;
  let body: string;
  let action: { label: string; onClick: () => void } | null = null;
  switch (phase) {
    case "wait":
      ({ title, body } = T.wait);
      break;
    case "think":
      ({ title, body } = T.think);
      action = { label: T.think.ok, onClick: () => setPhase("watch") };
      break;
    case "watch":
      ({ title, body } = T.watch);
      break;
    case "normal":
      ({ title, body } = T.normal);
      break;
    case "mute":
      ({ title, body } = T.mute);
      break;
    case "muted":
      ({ title, body } = T.muted);
      break;
    case "intercepted":
      ({ title, body } = T.intercepted);
      action = { label: T.intercepted.ok, onClick: startLive };
      break;
    case "live":
      ({ title, body } = T.live);
      action = { label: T.live.ok, onClick: () => setPhase("play") };
      break;
    case "play":
      ({ title, body } = T.play);
      break;
    case "fail": {
      const who = STRINGS.participants[fail?.participantId ?? "kevin"];
      if (fail?.outcome === "wrongMute") {
        title = T.wrongMute.title;
        body = T.wrongMute.body(who.name);
      } else {
        title = T.blunder.title;
        body = T.blunder.body(who.name, who.feminine);
      }
      action = { label: T.retry, onClick: startLive };
      break;
    }
    case "done":
      ({ title, body } = T.done);
      action = { label: T.done.ok, onClick: props.onDone };
      break;
  }

  const coach = (
    <section key={phase} className={`coach step-${STEP[phase]}`} data-testid="coach" data-phase={phase} aria-live="polite">
      <div className="coach-head">
        <Avatar who="josee" mood="happy" className="coach-avatar" />
        <span className="coach-who">
          {STRINGS.participants.josee.name} <em>{STRINGS.participants.josee.role}</em>
        </span>
        <span className="coach-step" data-testid="coach-step">
          {T.step(STEP[phase])}
        </span>
      </div>
      <h3>{title}</h3>
      <p>{body}</p>
      <div className="coach-actions">
        {action && (
          <button type="button" className="btn coach-ok" data-testid="coach-ok" onClick={action.onClick} autoFocus>
            {action.label}
          </button>
        )}
        {phase !== "done" && (
          <button type="button" className="link coach-skip" data-testid="tuto-skip" onClick={props.onDone}>
            {T.skip}
          </button>
        )}
      </div>
    </section>
  );

  return (
    <Game
      key={`${scene}-${attempt}`}
      lines={lines}
      cafe={CONFIG.tutorial.cafe}
      seed=""
      speed={props.speed * speedFactor}
      debug={props.debug}
      guided={false}
      onOver={() => {}}
      tutorial={{
        create,
        paused: PAUSED.has(phase),
        allowTap: phase === "mute" || phase === "play",
        label: T.label,
        coach,
        onEvents,
      }}
    />
  );
}
