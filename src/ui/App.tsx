/** Parcours : Accueil → (Tutoriel) → Réunion → Fin → Rejouer / Changer le niveau de café. */
import { domAnimation, LazyMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { loadSounds } from "../audio";
import { loadLines, loadTutoLines, type Lang } from "../content/lines";
import { CONFIG, type CafeLevel } from "../engine/config";
import type { GameState } from "../engine/state";
import { End } from "./End";
import { Game } from "./Game";
import { initialGuided, initialTuto, readGuideDone, readTutoDone, storeGuideDone, storeTutoDone } from "./guide";
import { Home } from "./Home";
import { ALL_STRINGS, StringsProvider } from "./i18n";
import { pageLang, readStoredLang, resolveLang, storeLang } from "./lang";
import { readParams } from "./params";
import { dailySeed } from "./share";
import { countEvent } from "./stats";
import { Tutorial } from "./Tutorial";

// Validation des banques au démarrage (R-20) : une erreur bloque tout de suite, en développement comme en test.
const LINES = { fr: loadLines("fr"), en: loadLines("en") } satisfies Record<Lang, unknown>;
const TUTO_LINES = { fr: loadTutoLines("fr"), en: loadTutoLines("en") } satisfies Record<Lang, unknown>;

/** `day` : date du stand-up du jour, ou null avec `?seed=` (partie de debug, hors stand-up du jour). */
type Screen = { name: "home" } | { name: "tutorial" } | { name: "game"; round: number; day: Date | null; guided: boolean } | { name: "end"; game: GameState; day: Date | null };

export function App() {
  const params = useMemo(() => readParams(location.search), []);
  const [cafe, setCafe] = useState<CafeLevel>(params.cafe ?? CONFIG.defaultCafe);
  const [guided, setGuided] = useState(() => initialGuided(params.guide, readGuideDone()));
  // Tutoriel (R-17) : avant la première partie guidée ; réactiver le premier meeting le propose de nouveau.
  const [tuto, setTuto] = useState(() => initialTuto(params.tuto, readTutoDone()));
  const onGuided = (on: boolean) => {
    setGuided(on);
    if (on) setTuto(true);
  };
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
    if (guided && tuto) {
      setScreen({ name: "tutorial" });
      return;
    }
    launch();
  };

  const tutorialDone = () => {
    storeTutoDone();
    setTuto(false);
    launch();
  };

  const launch = () => {
    countEvent("partie", lang);
    const next = round + 1;
    setRound(next);
    // Par défaut, le stand-up du jour (#19) : même réunion pour tous ce jour-là, et « Rejouer » la reprend.
    setScreen({ name: "game", round: next, day: params.seed === null ? new Date() : null, guided });
  };

  const seed = screen.name === "game" ? (screen.day ? dailySeed(screen.day) : (params.seed ?? "")) : "";

  return (
    <LazyMotion features={domAnimation} strict>
    <StringsProvider value={strings}>
    <main className="app">
      {screen.name === "home" && (
        <Home cafe={cafe} onCafe={setCafe} guided={guided} onGuided={onGuided} onStart={start} lang={lang} onLang={setLang} />
      )}
      {screen.name === "tutorial" && (
        <Tutorial lines={TUTO_LINES[lang]} lang={lang} speed={params.speed} debug={params.debug} onDone={tutorialDone} />
      )}
      {screen.name === "game" && (
        <Game
          key={screen.round}
          lines={LINES[lang]}
          cafe={cafe}
          seed={seed}
          speed={params.speed}
          participants={params.participants}
          debug={params.debug}
          guided={screen.guided}
          onOver={(game) => {
            // Premier meeting terminé (R-15) : les parties suivantes se jouent sans guide.
            if (screen.guided) {
              storeGuideDone();
              setGuided(false);
            }
            setScreen({ name: "end", game, day: screen.day });
          }}
        />
      )}
      {screen.name === "end" && (
        <End
          game={screen.game}
          day={screen.day}
          cafe={cafe}
          lang={lang}
          onReplay={start}
          onChangeCafe={() => setScreen({ name: "home" })}
          onPlayCafe={(c) => {
            // R-16 : le niveau proposé devient le niveau choisi, et la partie repart tout de suite.
            setCafe(c);
            start();
          }}
        />
      )}
    </main>
    </StringsProvider>
    </LazyMotion>
  );
}
