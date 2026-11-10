/**
 * Générateur aléatoire à graine (R-41) : mulberry32.
 * L'état tient dans un entier, stocké dans l'état du jeu : step() reste pur et reproductible.
 */

export interface RngResult {
  value: number; // dans [0, 1)
  state: number;
}

export function nextRandom(state: number): RngResult {
  const s = (state + 0x6d2b79f5) | 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, state: s };
}

/** Transforme une graine texte ou nombre en état initial. */
export function seedFrom(seed: string | number): number {
  const text = String(seed);
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h | 0;
}

/** Petit utilitaire qui fait avancer un état local de façon mutable, pour un seul appel de step(). */
export class Rng {
  constructor(public state: number) {}
  next(): number {
    const r = nextRandom(this.state);
    this.state = r.state;
    return r.value;
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)]!;
  }
}
