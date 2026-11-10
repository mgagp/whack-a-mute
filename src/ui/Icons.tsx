/** Icônes SVG reprises de la maquette v1 (micro, marteau, onomatopée). */

export function MicIcon({ muted, className }: { muted?: boolean; className?: string }) {
  const stroke = muted ? "#fff" : "#1B1033";
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v3" />
      {muted && (
        <>
          <path d="M4 4l16 16" stroke="#1B1033" strokeWidth="5" />
          <path d="M4 4l16 16" />
        </>
      )}
    </svg>
  );
}

export function Mallet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden="true">
      <rect x="38" y="30" width="10" height="46" rx="4" transform="rotate(-40 43 53)" fill="#C98A4B" stroke="#1B1033" strokeWidth="3" />
      <rect x="4" y="10" width="46" height="28" rx="8" transform="rotate(-40 27 24)" fill="#FF3D7F" stroke="#1B1033" strokeWidth="3.5" />
      <g transform="rotate(-40 27 24)">
        <rect x="22" y="15" width="10" height="18" rx="2" fill="#fff" stroke="#1B1033" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function Boom({ text, className }: { text: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 124 80" aria-hidden="true">
      <polygon
        points="62,2 72,20 92,6 90,28 120,24 100,42 122,58 94,58 100,78 76,64 62,80 52,62 26,76 30,56 2,58 22,42 4,24 32,28 30,6 52,20"
        fill="#fff"
        stroke="#1B1033"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <text x="62" y="49" textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize="21" fill="#FF3D7F" stroke="#1B1033" strokeWidth="1.2" paintOrder="stroke">
        {text}
      </text>
    </svg>
  );
}
