/** Accueil : logo, accroche, anecdote de Marc, choix du café (R-01, R-02) et mode « Premier meeting » (R-15). */
import { useState } from "react";
import { isMuted, setMuted } from "../audio";
import type { CafeLevel } from "../engine/config";
import { Avatar } from "./Avatar";
import { Deco } from "./Deco";
import { MicIcon } from "./Icons";
import { SoundButton } from "./Game";
import type { Lang } from "../content/lines";
import { ALL_STRINGS, useStrings } from "./i18n";
import { LANGS } from "./lang";

export function Home({
  cafe,
  onCafe,
  guided,
  onGuided,
  onStart,
  lang,
  onLang,
}: {
  cafe: CafeLevel;
  onCafe: (c: CafeLevel) => void;
  guided: boolean;
  onGuided: (guided: boolean) => void;
  onStart: () => void;
  lang: Lang;
  onLang: (lang: Lang) => void;
}) {
  const STRINGS = useStrings();
  const h = STRINGS.home;
  const [muted, setMutedState] = useState(isMuted);
  return (
    <div className="screen home" data-testid="home">
      <Deco items={["☕", "📎", "📈", "🗒️"]} />
      <div className="home-sound">
        <SoundButton muted={muted} onChange={(m) => (setMuted(m), setMutedState(m))} />
        <div className="lang-switch" role="group" aria-label={STRINGS.langLabel}>
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              data-testid={`lang-${l}`}
              aria-pressed={lang === l}
              aria-label={ALL_STRINGS[l].langName}
              title={ALL_STRINGS[l].langName}
              className={lang === l ? "on" : ""}
              onClick={() => onLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <h1 className="logo">
        <span className="small">{h.logoSmall}</span>
        <span className="big">{h.logoBig}</span>
        <span className="badge" aria-hidden="true">
          <MicIcon muted />
        </span>
      </h1>
      <p className="tagline">
        {h.taglineA}
        <br />
        <em>{h.taglineB}</em>
      </p>
      <div className="story">
        <div className="av">
          <Avatar who="ginette" mood="shocked" />
        </div>
        <div>
          <div className="who">{h.storyWho}</div>
          <div className="msg">{h.storyMsg}</div>
          <div className="meta">{h.storyMeta}</div>
        </div>
      </div>
      <div className="label" id="cafe-label">
        {h.cafeLabel}
      </div>
      <div className="coffee" role="radiogroup" aria-labelledby="cafe-label">
        {([1, 2, 3] as CafeLevel[]).map((c) => {
          const s = STRINGS.cafe[c];
          return (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cafe === c}
              data-testid={`cafe-${c}`}
              className={cafe === c ? "on" : ""}
              onClick={() => onCafe(c)}
            >
              <b>{s.cups}</b>
              {s.line1}
              <br />
              {s.line2}
            </button>
          );
        })}
      </div>
      <label className={`guide-toggle${guided ? " on" : ""}`} data-testid="guide-toggle">
        <input type="checkbox" checked={guided} onChange={(e) => onGuided(e.target.checked)} data-testid="guide" />
        <span className="switch" aria-hidden="true" />
        <span className="txt">
          <b>{h.guide}</b>
          {h.guideHint}
        </span>
      </label>
      <button type="button" className="btn start" data-testid="start" onClick={onStart}>
        {h.start}
      </button>
      <div className="fine">{h.fine}</div>
    </div>
  );
}
