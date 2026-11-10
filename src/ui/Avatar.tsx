/**
 * Avatars SVG des personnages fictifs, repris de la maquette v1 (R-36).
 * Chaque personnage a plusieurs expressions : neutre, va parler, parle, gêné, choqué, content.
 */
import { memo } from "react";
import type { ParticipantId } from "../engine/config";

export type Mood = "neutral" | "smirk" | "talk" | "oops" | "shocked" | "happy";

const INK = "#1B1033";
const BLUSH = "#FF7FA8";

const PEOPLE: Record<ParticipantId, { skin: string; shirt: string }> = {
  ginette: { skin: "#F1C9A5", shirt: "#6A4C93" },
  kevin: { skin: "#C68B59", shirt: "#FFD23F" },
  josee: { skin: "#8D5524", shirt: "#FF6B6B" },
  boss: { skin: "#FFD9B8", shirt: "#2F3E66" },
};

function eyes(mood: Mood) {
  switch (mood) {
    case "smirk":
      return `<circle cx="41" cy="49" r="3.6" fill="${INK}"/><path d="M55 49 Q59 46 63 49" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case "shocked":
    case "oops":
      return `<circle cx="41" cy="48" r="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="59" cy="48" r="6" fill="#fff" stroke="${INK}" stroke-width="2.5"/><circle cx="41" cy="49" r="2.6" fill="${INK}"/><circle cx="59" cy="49" r="2.6" fill="${INK}"/>`;
    case "happy":
      return `<path d="M37 50 Q41 45 45 50 M55 50 Q59 45 63 50" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    default:
      return `<circle cx="41" cy="49" r="3.6" fill="${INK}"/><circle cx="59" cy="49" r="3.6" fill="${INK}"/>`;
  }
}

function mouth(mood: Mood) {
  switch (mood) {
    case "smirk":
      return `<path d="M41 62 Q52 68 61 57" stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
    case "shocked":
      return `<path d="M42 65 Q46 61 50 65 Q54 69 58 65" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="58" rx="4.5" ry="2.6" fill="${BLUSH}" opacity=".75"/><ellipse cx="66" cy="58" rx="4.5" ry="2.6" fill="${BLUSH}" opacity=".75"/>`;
    case "oops":
      return `<ellipse cx="50" cy="65" rx="4.5" ry="5.5" fill="${INK}"/><ellipse cx="34" cy="58" rx="4.5" ry="2.6" fill="${BLUSH}" opacity=".8"/><ellipse cx="66" cy="58" rx="4.5" ry="2.6" fill="${BLUSH}" opacity=".8"/>`;
    case "happy":
      return `<path d="M40 59 Q50 73 60 59 Z" fill="${INK}"/>`;
    case "talk":
      return `<path class="av-talk" d="M41 59 Q50 75 59 59 Z" fill="#7A1F3D" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    default:
      return `<path d="M43 63 L57 63" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
  }
}

function avatarInner(who: ParticipantId, mood: Mood) {
  const p = PEOPLE[who];
  let behind = "";
  let front = "";
  let body = `<path d="M12 106 Q50 70 88 106 Z" fill="${p.shirt}" stroke="${INK}" stroke-width="4"/>`;
  if (who === "ginette") {
    behind = [[28, 38], [38, 26], [52, 22], [66, 27], [75, 40], [24, 52], [77, 54]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="#B39DDB" stroke="${INK}" stroke-width="3.5"/>`)
      .join("");
    front = `<circle cx="41" cy="49" r="8.5" fill="rgba(255,255,255,.25)" stroke="${INK}" stroke-width="3"/><circle cx="59" cy="49" r="8.5" fill="rgba(255,255,255,.25)" stroke="${INK}" stroke-width="3"/><path d="M49.5 49 h1" stroke="${INK}" stroke-width="3"/>`;
  }
  if (who === "kevin") {
    front = `<path d="M23 46 L26 22 L35 31 L41 14 L50 28 L58 13 L64 30 L73 20 L77 46 Q50 33 23 46 Z" fill="#2B1B12" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  }
  if (who === "josee") {
    behind = `<circle cx="50" cy="19" r="11" fill="#3A1A10" stroke="${INK}" stroke-width="3.5"/>`;
    front = `<path d="M23 52 Q21 22 50 22 Q79 22 77 52 Q71 34 50 33 Q30 34 23 52 Z" fill="#3A1A10" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  }
  if (who === "boss") {
    body += `<path d="M40 80 L50 90 L60 80 L56 76 L44 76 Z" fill="#fff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M47 86 L53 86 L56 104 L50 108 L44 104 Z" fill="#FF3D7F" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    front = `<path d="M24 50 Q22 38 30 36 M76 50 Q78 38 70 36" stroke="#8C8C9E" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M35 40 L46 42 M54 42 L65 40" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/><path d="M40 58 Q50 54 60 58" stroke="#6B5A4E" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  return `${behind}${body}<circle cx="50" cy="50" r="27" fill="${p.skin}" stroke="${INK}" stroke-width="4"/>${eyes(mood)}${mouth(mood)}${front}`;
}

export const Avatar = memo(function Avatar({
  who,
  mood,
  className,
}: {
  who: ParticipantId;
  mood: Mood;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      aria-hidden="true"
      data-mood={mood}
      dangerouslySetInnerHTML={{ __html: avatarInner(who, mood) }}
    />
  );
});
