/**
 * Lecture des bruitages avec Howler (R-31), et bouton de son mémorisé.
 * L'interface appelle seulement soundForEvent() et setMuted().
 */
import { Howl, Howler } from "howler";
import type { GameEvent } from "../engine/state";
import { renderSound, SOUND_NAMES, type SoundName } from "./synth";

/**
 * Pour remplacer un bruitage généré par un vrai fichier : déposer le fichier dans public/sounds/
 * et l'indiquer ici, par exemple `whack: "sounds/schlac.mp3"`.
 */
const SOUND_FILES: Partial<Record<SoundName, string>> = {};

const STORAGE_KEY = "whack-a-mute:son-coupe";
const howls = new Map<SoundName, Howl>();
let loading: Promise<void> | null = null;

export function loadSounds(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    if (typeof OfflineAudioContext === "undefined") return;
    await Promise.all(
      SOUND_NAMES.map(async (name) => {
        try {
          const file = SOUND_FILES[name];
          const src = file ?? URL.createObjectURL(await renderSound(name));
          howls.set(name, new Howl({ src: [src], format: file ? undefined : ["wav"], preload: true }));
        } catch {
          // Pas de son disponible : le jeu reste jouable en silence.
        }
      }),
    );
  })();
  Howler.mute(isMuted());
  return loading;
}

export function play(name: SoundName) {
  howls.get(name)?.play();
}

export function isMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // Stockage indisponible : le choix vaut pour la session seulement.
  }
  Howler.mute(muted);
}

/** Un bruitage distinct par événement et par résultat (R-31). */
export function soundForEvent(e: GameEvent): SoundName | null {
  switch (e.type) {
    case "micToggled":
      return e.mic === "muted" ? "whack" : "unmute";
    case "announced":
      return "announce";
    case "participantJoined":
      return e.t > 0 ? "join" : null;
    case "resolved":
      return e.outcome === "intercepted"
        ? "intercepted"
        : e.outcome === "blunder"
          ? "blunder"
          : e.outcome === "wrongMute"
            ? "wrongMute"
            : "said";
    case "gameOver":
      return "fanfare";
  }
}
