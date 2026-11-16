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
import { dailyResultOf, freeSeed, playKind, readDaily, storeDaily, type DailyResult, type PlayKind } from "./daily";
import { dailySeed } from "./share";
import { countEvent } from "./stats";
import { Tutorial } from "./Tutorial";

// Validation des banques au démarrage (R-20) : une erreur bloque tout de suite, en développement comme en test.
const LINES = { fr: loadLines("fr"), en: loadLines("en") } satisfies Record<Lang, unknown>;
const TUTO_LINES = { fr: loadTutoLines("fr"), en: loadTutoLines("en") } satisfies Record<Lang, unknown>;

/**
 * `kind` : stand-up du jour, partie libre (le stand-up du jour est déjà joué, #49) ou partie de debug (`?seed=`).
 * `day` : date de la partie ; `official` : le stand-up du jour déjà joué, pendant une partie libre.
 */
type Played = { kind: PlayKind; day: Date; official: DailyResult | null };
type Screen =
  | { name: "home" }
  | { name: "tutorial" }
  | ({ name: "game"; round: number; seed: string; guided: boolean } & Played)
  | ({ name: "end"; game: GameState } & Played);

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
    // Par défaut, le stand-up du jour (#19) : même réunion pour tous ce jour-là.
    // Une fois terminé, les essais suivants sont des parties libres sur une réunion au hasard (#49).
    const day = new Date();
    const official = params.seed === null ? readDaily(day, cafe, lang) : null;
    const kind = playKind(params.seed, official);
    const seed = kind === "debug" ? params.seed! : kind === "daily" ? dailySeed(day) : freeSeed();
    setScreen({ name: "game", round: next, seed, guided, kind, day, official });
  };

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
          seed={screen.seed}
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
            // Le premier stand-up du jour terminé est celui qui compte pour le partage (#49).
            if (screen.kind === "daily") storeDaily(screen.day, cafe, lang, dailyResultOf(game));
            setScreen({ name: "end", game, kind: screen.kind, day: screen.day, official: screen.official });
          }}
        />
      )}
      {screen.name === "end" && (
        <End
          game={screen.game}
          kind={screen.kind}
          day={screen.day}
          official={screen.official}
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
