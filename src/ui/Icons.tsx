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

/** Logo GitHub (octicon « mark-github »), pour le lien vers le code source (R-53). */
export function GitHubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
      />
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

/**
 * Contour festonné de la bulle-pensée (#10) : convention de bande dessinée pour « ce qu'il s'apprête à dire ».
 * Étiré à la taille de la bulle ; le trait garde son épaisseur grâce à `non-scaling-stroke`.
 */
export function ThoughtCloud({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M16 14A20.8 20.8 0 0 1 50.7 14A20.8 20.8 0 0 1 85.3 14A20.8 20.8 0 0 1 120 14A20.8 20.8 0 0 1 154.7 14A20.8 20.8 0 0 1 189.3 14A20.8 20.8 0 0 1 224 14A21.6 21.6 0 0 1 224 50A21.6 21.6 0 0 1 224 86A20.8 20.8 0 0 1 189.3 86A20.8 20.8 0 0 1 154.7 86A20.8 20.8 0 0 1 120 86A20.8 20.8 0 0 1 85.3 86A20.8 20.8 0 0 1 50.7 86A20.8 20.8 0 0 1 16 86A21.6 21.6 0 0 1 16 50A21.6 21.6 0 0 1 16 14Z" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
