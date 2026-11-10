/** Écran de fin : harmonie, titre, équipe, statistiques, rejouer et partager (R-03, R-12, R-50). */
import { useEffect, useState } from "react";
import { CONFIG, type CafeLevel } from "../engine/config";
import type { GameState } from "../engine/state";
import { endTitleKey } from "../engine/step";
import { Avatar, type Mood } from "./Avatar";
import { STRINGS } from "./strings.fr";

const CONFETTI_COLORS = ["var(--sun)", "var(--turq)", "var(--coral)", "var(--lime)", "var(--mute)", "var(--violet)"];
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  duration: `${4 + ((i * 7) % 40) / 10}s`,
  delay: `${-((i * 13) % 80) / 10}s`,
}));

export function End({
  game,
  cafe,
  onReplay,
  onChangeCafe,
}: {
  game: GameState;
  cafe: CafeLevel;
  onReplay: () => void;
  onChangeCafe: () => void;
}) {
  const e = STRINGS.end;
  const key = endTitleKey(game.harmony);
  const good = game.harmony >= CONFIG.endTitleThresholds[1].min;
  const cut = game.endReason === "harmonie";
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), CONFIG.ui.toastMs);
    return () => clearTimeout(id);
  }, [copied]);

  const mood: Mood = good ? "happy" : cut ? "shocked" : "oops";
  const deg = (game.harmony / 100) * 360;

  const share = async () => {
    const text = e.shareText(game.harmony, STRINGS.cafe[cafe].cups, game.stats.intercepted, game.stats.deplacees);
    const url = location.origin + location.pathname;
    const touch = matchMedia("(pointer: coarse)").matches;
    if (touch && navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch {
        // Partage annulé : on se rabat sur la copie.
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      // Presse-papiers refusé : rien d'autre à faire.
    }
    setCopied(true);
  };

  return (
    <div className="screen end" data-testid="end">
      {game.harmony >= CONFIG.endTitleThresholds[2].min && (
        <div className="deco confetti-box" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <span key={i} className="confetti" style={{ left: c.left, background: c.color, animationDuration: c.duration, animationDelay: c.delay }} />
          ))}
        </div>
      )}
      <h2>{cut ? e.titleCut : e.titleTime}</h2>
      <div className="sub">
        {cut ? e.cutSub : `${STRINGS.meetingName} · ${STRINGS.cafe[cafe].short} ${STRINGS.cafe[cafe].cups}`}
      </div>
      <div className="donut" style={{ ["--deg" as string]: `${deg}deg` }}>
        <div data-testid="final-harmony">
          {game.harmony} %<small>{e.harmony}</small>
        </div>
      </div>
      <div className="ribbon" data-testid="end-title">
        {e.titles[key]}
      </div>
      <div className="crew" aria-hidden="true">
        {game.participants.map((p) => (
          <span key={p.id} className={`crew-${p.id}`}>
            <Avatar who={p.id} mood={p.id === "kevin" && good ? "smirk" : mood} />
          </span>
        ))}
      </div>
      <div className="stats">
        <div className="stat">
          <b data-testid="stat-intercepted">
            {game.stats.intercepted}/{game.stats.deplacees}
          </b>
          {e.statIntercepted}
        </div>
        <div className="stat">
          <b>{game.stats.wrongMutes}</b>
          {e.statWrong(game.stats.wrongMutes)}
        </div>
        <div className="stat">
          <b>{game.stats.blunders}</b>
          {e.statBlunders(game.stats.blunders)}
        </div>
      </div>
      <div className="actions">
        <button type="button" className="btn" data-testid="replay" onClick={onReplay}>
          {e.replay}
        </button>
        <button type="button" className="btn turq" data-testid="share" onClick={share}>
          {copied ? e.copied : e.share}
        </button>
        <button type="button" className="link" data-testid="change-cafe" onClick={onChangeCafe}>
          {e.changeCafe}
        </button>
      </div>
    </div>
  );
}
