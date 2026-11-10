/** Parcours : Accueil → Réunion → Fin → Rejouer / Changer de café. */
import { domAnimation, LazyMotion } from "motion/react";
import { useMemo, useState } from "react";
import { loadSounds } from "../audio";
import { loadLines } from "../content/lines";
import { CONFIG, type CafeLevel } from "../engine/config";
import type { GameState } from "../engine/state";
import { End } from "./End";
import { Game } from "./Game";
import { Home } from "./Home";
import { readParams } from "./params";

// Validation de la banque au démarrage (R-20) : une erreur bloque tout de suite, en développement comme en test.
const LINES = loadLines("fr");

type Screen = { name: "home" } | { name: "game"; round: number } | { name: "end"; game: GameState };

export function App() {
  const params = useMemo(() => readParams(location.search), []);
  const [cafe, setCafe] = useState<CafeLevel>(params.cafe ?? CONFIG.defaultCafe);
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [round, setRound] = useState(0);

  const start = () => {
    void loadSounds();
    const next = round + 1;
    setRound(next);
    setScreen({ name: "game", round: next });
  };

  // Avec ?seed=, chaque partie est reproductible ; sinon, une graine au hasard.
  const seed = useMemo(
    () => (params.seed !== null ? params.seed : `${Date.now()}-${round}`),
    [params.seed, round],
  );

  return (
    <LazyMotion features={domAnimation} strict>
    <main className="app">
      {screen.name === "home" && <Home cafe={cafe} onCafe={setCafe} onStart={start} />}
      {screen.name === "game" && (
        <Game
          key={screen.round}
          lines={LINES}
          cafe={cafe}
          seed={seed}
          speed={params.speed}
          participants={params.participants}
          debug={params.debug}
          onOver={(game) => setScreen({ name: "end", game })}
        />
      )}
      {screen.name === "end" && (
        <End game={screen.game} cafe={cafe} onReplay={start} onChangeCafe={() => setScreen({ name: "home" })} />
      )}
    </main>
    </LazyMotion>
  );
}
