/** Arrière-plan animé discret qui parodie le bureau (R-39). */
const SPOTS = [
  { top: "9%", left: "6%", delay: "0s" },
  { top: "30%", right: "4%", delay: "-3s" },
  { top: "62%", left: "4%", delay: "-5s" },
  { bottom: "7%", right: "8%", delay: "-2s" },
  { top: "46%", left: "48%", delay: "-4s" },
  { top: "14%", right: "30%", delay: "-6s" },
];

export function Deco({ items }: { items: string[] }) {
  return (
    <div className="deco" aria-hidden="true">
      {SPOTS.map(({ delay, ...pos }, i) => (
        <span key={i} style={{ ...pos, animationDelay: delay }}>
          {items[i % items.length]}
        </span>
      ))}
    </div>
  );
}
