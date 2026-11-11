/**
 * Textes de l'interface, en français québécois léger (Q-2, Q-8).
 * Toute chaîne visible passe par ici : une traduction n'aura qu'à fournir un fichier équivalent.
 */
import type { CafeLevel, EndTitleKey, ParticipantId } from "../engine/config";

export const STRINGS = {
  lang: "fr",
  appName: "SynergiQ",
  meetingName: "Stand-up quotidien",
  home: {
    logoSmall: "WHACK-A-",
    logoBig: "MUTE",
    taglineA: "Sauve la réunion d'équipe…",
    taglineB: "un mute à la fois.",
    storyWho: "Un collègue, en pleine réunion",
    storyMsg: "« Marc… t'es pas sur mute. » 😬",
    storyMeta:
      "Inspiré d'une histoire vraie. Ton mandat : lire ce que tes collègues s'apprêtent à dire et les couper juste à temps.",
    cafeLabel: "Ton niveau de café",
    start: "Rejoindre la réunion →",
    fine: "Partie de 90 secondes · son conseillé 🔊",
  },
  cafe: {
    1: { cups: "☕", line1: "Lundi 9 h,", line2: "pas de café", short: "pas de café" },
    2: { cups: "☕☕", line1: "Après le", line2: "1er café", short: "après le 1er café" },
    3: { cups: "☕☕☕", line1: "4e", line2: "espresso", short: "4e espresso" },
  } satisfies Record<CafeLevel, { cups: string; line1: string; line2: string; short: string }>,
  participants: {
    ginette: { name: "Ginette", role: "compta", feminine: true },
    kevin: { name: "Kevin", role: "stagiaire", feminine: false },
    josee: { name: "Josée", role: "scrum master", feminine: true },
    boss: { name: "Le boss", role: "gestion", feminine: false },
  } satisfies Record<ParticipantId, { name: string; role: string; feminine: boolean }>,
  game: {
    harmony: "Harmonie d'équipe",
    willSay: "Va dire…",
    said: "🎙️ Dit",
    cutF: "🔇 Coupée à temps",
    cutM: "🔇 Coupé à temps",
    nobodyHeard: "…personne n'a rien entendu 🤫",
    wrongMuteTag: "🔇 Coupé à tort",
    wrongMuteSay: "Euh… tu m'as coupé ?",
    stamp: "MUTE !",
    boom: "SCHLAC !",
    oops: "😬",
    waiting: "En attente…",
    joined: (name: string) => `👋 ${name} a rejoint la réunion`,
    toast: {
      intercepted: (d: number) => `🔇 Intercepté ! +${d} harmonie`,
      blunder: (d: number) => `😬 Malaise ! −${Math.abs(d)} harmonie`,
      wrongMute: (d: number) => `🙃 Coupé à tort ! −${Math.abs(d)} harmonie`,
    },
    chipIntercepted: (n: number) => `🔇 ${n} intercepté${n > 1 ? "s" : ""}`,
    chipBlunders: (n: number) => `😬 ${n} malaise${n > 1 ? "s" : ""}`,
    soundOn: "Couper le son",
    soundOff: "Rétablir le son",
    tileLabel: (name: string, mic: string) => `${name}, micro ${mic}`,
    micOpen: "ouvert",
    micMuted: "sur mute",
    micIdle: "inactif",
  },
  end: {
    titleTime: "Réunion terminée !",
    titleCut: "Réunion écourtée !",
    cutSub: "La réunion a été écourtée par l'organisateur.",
    harmony: "HARMONIE",
    statIntercepted: "commentaires interceptés",
    statWrong: (n: number) => (n > 1 ? "collègues coupés à tort" : "collègue coupé à tort"),
    statBlunders: (n: number) => (n > 1 ? "malaises généraux" : "malaise général"),
    replay: "Rejouer ↻",
    share: "Partager mon score",
    copied: "Copié ! Colle-le où tu veux 📋",
    changeCafe: "Changer de café ☕",
    titles: {
      champion: "Champion·ne de la synergie",
      modele: "Collègue modèle (ou presque)",
      unUn: "« On se reparle en 1:1 »",
      rh: "Invitation surprise des RH",
      ecourtee: "Réunion écourtée par l'organisateur",
    } satisfies Record<EndTitleKey, string>,
    shareText: (harmony: number, cups: string, intercepted: number, total: number) =>
      `J'ai gardé ${harmony} % d'harmonie au stand-up ${cups} (${intercepted}/${total} commentaires interceptés) — whack-a-mute`,
  },
} as const;

export type Strings = typeof STRINGS;
