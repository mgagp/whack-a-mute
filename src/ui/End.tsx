/** Écran de fin : harmonie, titre, équipe, statistiques, rejouer et partager (R-03, R-12, R-50). */
import { useEffect, useState } from "react";
import { CONFIG, type CafeLevel } from "../engine/config";
import type { GameState } from "../engine/state";
import { endTitleKey, suggestedCafe } from "../engine/step";
import { Avatar, type Mood } from "./Avatar";
import type { Lang } from "../content/lines";
import { useStrings } from "./i18n";
import type { DailyResult, PlayKind } from "./daily";
import { shareUrl } from "./lang";
import { shareText } from "./share";
import { countEvent } from "./stats";

const CONFETTI_COLORS = ["var(--sun)", "var(--turq)", "var(--coral)", "var(--lime)", "var(--mute)", "var(--violet)"];
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  duration: `${4 + ((i * 7) % 40) / 10}s`,
  delay: `${-((i * 13) % 80) / 10}s`,
}));

export function End({
  game,
  kind,
  day,
  official,
  cafe,
  lang,
  onReplay,
  onChangeCafe,
  onPlayCafe,
}: {
  game: GameState;
  /** Stand-up du jour, partie libre (#49) ou partie de debug (`?seed=`). */
  kind: PlayKind;
  day: Date;
  /** Pendant une partie libre : le stand-up du jour déjà joué, le seul qu'on partage (#49). */
  official: DailyResult | null;
  cafe: CafeLevel;
  lang: Lang;
  onReplay: () => void;
  onChangeCafe: () => void;
  /** Rejoue tout de suite au niveau proposé (R-16). */
  onPlayCafe: (c: CafeLevel) => void;
}) {
  const STRINGS = useStrings();
  const e = STRINGS.end;
  const key = endTitleKey(game.harmony);
  const good = game.harmony >= CONFIG.endTitleThresholds[1].min;
  const cut = game.endReason === "harmonie";
  const suggestion = suggestedCafe(game.harmony, cafe);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), CONFIG.ui.toastMs);
    return () => clearTimeout(id);
  }, [copied]);

  const meeting =
    kind === "daily"
      ? e.dailyMeeting(day.toLocaleDateString(STRINGS.dateLocale, { day: "numeric", month: "long" }))
      : kind === "free"
        ? e.freeMeeting
        : STRINGS.meetingName;
  // Seul le premier essai du jour compte pour le partage (#49) : une partie libre partage le stand-up du jour.
  const shared: DailyResult = official ?? {
    harmony: game.harmony,
    intercepted: game.stats.intercepted,
    deplacees: game.stats.deplacees,
    outcomes: game.outcomes,
  };
  const mood: Mood = good ? "happy" : cut ? "shocked" : "oops";
  const deg = (game.harmony / 100) * 360;

  const share = async () => {
    countEvent("partage", lang);
    const headline = e.shareText(shared.harmony, STRINGS.cafe[cafe].cups, shared.intercepted, shared.deplacees, kind !== "debug");
    const text = shareText(headline, shared.outcomes);
    // La page anglaise a son propre aperçu de lien : on partage l'adresse de la langue jouée.
    const url = shareUrl(location.origin, location.pathname, lang);
    const touch = matchMedia("(pointer: coarse)").matches;
    if (touch && navigator.share) {
      try {
        await navigator.share({ text, url });
        return;
      } catch (err) {
        // Annulé par le joueur : on ne fait rien. Sinon (partage refusé), on se rabat sur la copie.
        if (err instanceof DOMException && err.name === "AbortError") return;
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
    <div className="screen end" data-testid="end" data-kind={kind}>
      {game.harmony >= CONFIG.endTitleThresholds[2].min && (
        <div className="deco confetti-box" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <span key={i} className="confetti" style={{ left: c.left, background: c.color, animationDuration: c.duration, animationDelay: c.delay }} />
          ))}
        </div>
      )}
      <h2>{cut ? e.titleCut : e.titleTime}</h2>
      <div className="sub">
        {cut ? e.cutSub : `${meeting} · ${STRINGS.cafe[cafe].short} ${STRINGS.cafe[cafe].cups}`}
      </div>
      <div className="donut" style={{ ["--deg" as string]: `${deg}deg` }}>
        <div data-testid="final-harmony">
          {STRINGS.percent(game.harmony)}<small>{e.harmony}</small>
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
      {official && (
        <p className="official" data-testid="official">
          {e.officialScore(STRINGS.percent(official.harmony))}
        </p>
      )}
      <div className="actions">
        <button type="button" className="btn" data-testid="replay" onClick={onReplay}>
          {e.replay}
        </button>
        <button type="button" className="btn turq" data-testid="share" onClick={share}>
          {copied ? e.copied : official ? e.shareDaily : e.share}
        </button>
        {suggestion === null ? (
          <button type="button" className="link" data-testid="change-cafe" onClick={onChangeCafe}>
            {e.changeCafe}
          </button>
        ) : (
          <button
            type="button"
            className={`btn suggest ${suggestion < cafe ? "less" : "more"}`}
            data-testid="suggest-cafe"
            data-cafe={suggestion}
            onClick={() => onPlayCafe(suggestion)}
          >
            {(suggestion < cafe ? e.suggestLess : e.suggestMore)(STRINGS.cafe[suggestion].short)}{" "}
            <span className="cups">{STRINGS.cafe[suggestion].cups}</span>
          </button>
        )}
      </div>
    </div>
  );
}
