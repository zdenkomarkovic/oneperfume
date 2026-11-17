/** Namenski nacrtana ilustracija boce parfema (SVG) za hero. */
export function HeroBottle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 600" className={className} role="img" aria-label="Boca parfema One Perfume">
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3a2a22" />
          <stop offset="0.5" stopColor="#1a1311" />
          <stop offset="1" stopColor="#2c1e18" />
        </linearGradient>
        <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9b574" stopOpacity="0.95" />
          <stop offset="1" stopColor="#8a4b2d" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="cap" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bfb3a0" />
          <stop offset="0.35" stopColor="#fbf6ea" />
          <stop offset="0.7" stopColor="#d6cbb8" />
          <stop offset="1" stopColor="#9d917e" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e8dfcf" stopOpacity="0.35" />
          <stop offset="1" stopColor="#e8dfcf" stopOpacity="0" />
        </radialGradient>
        <clipPath id="body">
          <rect x="95" y="210" width="210" height="310" rx="34" />
        </clipPath>
      </defs>

      {/* odsjaj na podu */}
      <ellipse cx="200" cy="548" rx="150" ry="22" fill="url(#floor)" />

      {/* telo boce */}
      <rect x="95" y="210" width="210" height="310" rx="34" fill="url(#glass)" stroke="#e8dfcf" strokeOpacity="0.35" strokeWidth="1.5" />

      {/* tečnost */}
      <g clipPath="url(#body)">
        <path d="M95 300 Q 150 285 200 300 T 305 300 V 520 H 95 Z" fill="url(#liquid)" />
        <path d="M95 300 Q 150 285 200 300 T 305 300" fill="none" stroke="#fbf6ea" strokeOpacity="0.5" strokeWidth="1.5" />
        <circle cx="140" cy="440" r="3" fill="#fbf6ea" fillOpacity="0.35" />
        <circle cx="255" cy="400" r="2" fill="#fbf6ea" fillOpacity="0.3" />
        <circle cx="215" cy="470" r="2.5" fill="#fbf6ea" fillOpacity="0.3" />
      </g>

      {/* unutrašnji okvir */}
      <rect x="107" y="222" width="186" height="286" rx="26" fill="none" stroke="#e8dfcf" strokeOpacity="0.18" />

      {/* etiketa */}
      <rect x="140" y="355" width="120" height="86" fill="#f3eee6" />
      <rect x="146" y="361" width="108" height="74" fill="none" stroke="#0c0a09" strokeOpacity="0.5" strokeWidth="0.8" />
      <text x="200" y="395" textAnchor="middle" fontFamily="Georgia, serif" fontSize="22" letterSpacing="5" fill="#0c0a09">ONE</text>
      <text x="200" y="418" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" letterSpacing="4" fill="#0c0a09" fillOpacity="0.7">PERFUME</text>

      {/* odsjaj stakla */}
      <rect x="112" y="232" width="16" height="250" rx="8" fill="url(#shine)" />
      <rect x="276" y="250" width="6" height="150" rx="3" fill="url(#shine)" opacity="0.5" />

      {/* vrat */}
      <rect x="168" y="172" width="64" height="44" fill="#1a1311" stroke="#e8dfcf" strokeOpacity="0.35" />
      <rect x="160" y="196" width="80" height="14" rx="3" fill="url(#cap)" />

      {/* kapa */}
      <rect x="150" y="70" width="100" height="110" rx="12" fill="url(#cap)" />
      <rect x="150" y="70" width="100" height="110" rx="12" fill="none" stroke="#fff" strokeOpacity="0.4" />
      <rect x="160" y="82" width="9" height="86" rx="4.5" fill="#fff" fillOpacity="0.45" />
      <line x1="150" y1="150" x2="250" y2="150" stroke="#0c0a09" strokeOpacity="0.12" />
    </svg>
  );
}
