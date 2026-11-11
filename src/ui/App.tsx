/** Parcours : Accueil → Réunion → Fin → Rejouer / Changer le niveau de café. */
import { domAnimation, LazyMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { loadSounds } from "../audio";
import { loadLines, type Lang } from "../content/lines";
import { CONFIG, type CafeLevel } from "../engine/config";
import type { GameState } from "../engine/state";
import { End } from "./End";
import { Game } from "./Game";
import { Home } from "./Home";
import { ALL_STRINGS, StringsProvider } from "./i18n";
import { pageLang, readStoredLang, resolveLang, storeLang } from "./lang";
import { readParams } from "./params";
import { dailySeed } from "./share";
import { countEvent } from "./stats";

// Validation des banques au démarrage (R-20) : une erreur bloque tout de suite, en développement comme en test.
const LINES = { fr: loadLines("fr"), en: loadLines("en") } satisfies Record<Lang, unknown>;

/** `day` : date du stand-up du jour, ou null avec `?seed=` (partie de debug, hors stand-up du jour). */
type Screen = { name: "home" } | { name: "game"; round: number; day: Date | null } | { name: "end"; game: GameState; day: Date | null };

export function App() {
  const params = useMemo(() => readParams(location.search), []);
  const [cafe, setCafe] = useState<CafeLevel>(params.cafe ?? CONFIG.defaultCafe);
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [round, setRound] = useState(0);
  const [lang, setLangState] = useState<Lang>(() =>
    resolveLang({ param: params.lang, pageLang: pageLang(), stored: readStoredLang(), deviceLangs: navigator.languages ?? [navigator.language] }),
  );
  const strings = ALL_STRINGS[lang];
  const setLang = (next: Lang) => {
    storeLang(next);
    setLangState(next);
  };
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = strings.pageTitle;
  }, [lang, strings]);

  const start = () => {
    void loadSounds();
    countEvent("partie", lang);
    const next = round + 1;
    setRound(next);
    // Par défaut, le stand-up du jour (#19) : même réunion pour tous ce jour-là, et « Rejouer » la reprend.
    setScreen({ name: "game", round: next, day: params.seed === null ? new Date() : null });
  };

  const seed = screen.name === "game" ? (screen.day ? dailySeed(screen.day) : (params.seed ?? "")) : "";

  return (
    <LazyMotion features={domAnimation} strict>
    <StringsProvider value={strings}>
    <main className="app">
      {screen.name === "home" && <Home cafe={cafe} onCafe={setCafe} onStart={start} lang={lang} onLang={setLang} />}
      {screen.name === "game" && (
        <Game
          key={screen.round}
          lines={LINES[lang]}
          cafe={cafe}
          seed={seed}
          speed={params.speed}
          participants={params.participants}
          debug={params.debug}
          onOver={(game) => setScreen({ name: "end", game, day: screen.day })}
        />
      )}
      {screen.name === "end" && (
        <End game={screen.game} day={screen.day} cafe={cafe} lang={lang} onReplay={start} onChangeCafe={() => setScreen({ name: "home" })} />
      )}
    </main>
    </StringsProvider>
    </LazyMotion>
  );
}
