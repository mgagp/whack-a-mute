/**
 * Bruitages TEMPORAIRES générés par Web Audio (Q-6 encore ouverte).
 * Chaque recette est rendue une fois hors ligne, puis encodée en WAV pour Howler.
 * Pour les remplacer par de vrais fichiers, voir SOUND_FILES dans ./index.ts.
 */

export type SoundName =
  | "whack" // clic qui met sur mute : « SCHLAC »
  | "unmute" // clic qui réouvre le micro
  | "intercepted" // interception réussie
  | "blunder" // malaise : criquets et toux
  | "wrongMute" // coupé à tort : « boop » déçu
  | "said" // phrase correcte dite normalement
  | "announce" // une bulle « va dire… » apparaît
  | "join" // carillon de connexion
  | "fanfare"; // fin de partie

type Recipe = { duration: number; build: (ctx: OfflineAudioContext) => void };

function tone(ctx: BaseAudioContext, type: OscillatorType, f0: number, f1: number, t0: number, dur: number, gain: number) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

function noise(ctx: BaseAudioContext, t0: number, dur: number, gain: number, filter: BiquadFilterType, freq: number, q = 1) {
  const len = Math.ceil(dur * ctx.sampleRate);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t0);
}

const RECIPES: Record<SoundName, Recipe> = {
  whack: {
    duration: 0.35,
    build: (c) => {
      noise(c, 0, 0.22, 0.9, "bandpass", 1800, 0.8); // « SCHL »
      tone(c, "square", 220, 60, 0, 0.18, 0.5); // impact
      noise(c, 0.02, 0.3, 0.35, "highpass", 4000); // « AC »
    },
  },
  unmute: {
    duration: 0.15,
    build: (c) => tone(c, "triangle", 500, 900, 0, 0.1, 0.4),
  },
  intercepted: {
    duration: 0.6,
    build: (c) => {
      noise(c, 0, 0.35, 0.25, "highpass", 3000); // « chhh »
      [880, 1175, 1568].forEach((f, i) => tone(c, "sine", f, f, 0.12 + i * 0.07, 0.25, 0.35));
    },
  },
  blunder: {
    duration: 1.3,
    build: (c) => {
      // Criquets : petites rafales aiguës, puis une toux gênée.
      for (let i = 0; i < 6; i++) {
        const t = i * 0.13 + (i >= 3 ? 0.25 : 0);
        tone(c, "sine", 4400, 4300, t, 0.05, 0.18);
        tone(c, "sine", 4400, 4300, t + 0.06, 0.04, 0.14);
      }
      noise(c, 0.95, 0.18, 0.6, "bandpass", 500, 1.5);
      noise(c, 1.12, 0.14, 0.4, "bandpass", 450, 1.5);
    },
  },
  wrongMute: {
    duration: 0.55,
    build: (c) => {
      tone(c, "sine", 520, 380, 0, 0.18, 0.5); // « boo »
      tone(c, "sine", 380, 200, 0.2, 0.32, 0.5); // « oop »
    },
  },
  said: {
    duration: 0.2,
    build: (c) => tone(c, "triangle", 660, 740, 0, 0.12, 0.18),
  },
  announce: {
    duration: 0.12,
    build: (c) => tone(c, "sine", 1200, 1500, 0, 0.07, 0.12),
  },
  join: {
    duration: 0.7,
    build: (c) => {
      tone(c, "sine", 784, 784, 0, 0.3, 0.3);
      tone(c, "sine", 1046, 1046, 0.14, 0.45, 0.3);
    },
  },
  fanfare: {
    duration: 1.4,
    build: (c) => {
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, i) => tone(c, "square", f, f, i * 0.12, 0.16, 0.18));
      tone(c, "square", 1046, 1046, 0.5, 0.7, 0.2);
      tone(c, "triangle", 523, 523, 0.5, 0.8, 0.25);
    },
  },
};

const SAMPLE_RATE = 22_050;

/** Rend une recette en fichier WAV (Blob). */
export async function renderSound(name: SoundName): Promise<Blob> {
  const r = RECIPES[name];
  const ctx = new OfflineAudioContext(1, Math.ceil(r.duration * SAMPLE_RATE), SAMPLE_RATE);
  r.build(ctx);
  const buf = await ctx.startRendering();
  return encodeWav(buf.getChannelData(0), SAMPLE_RATE);
}

export const SOUND_NAMES = Object.keys(RECIPES) as SoundName[];

function encodeWav(samples: Float32Array, rate: number): Blob {
  const view = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const str = (o: number, s: string) => [...s].forEach((ch, i) => view.setUint8(o + i, ch.charCodeAt(0)));
  str(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  str(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((v, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 0x7fff, true));
  return new Blob([view], { type: "audio/wav" });
}
