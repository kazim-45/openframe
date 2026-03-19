'use client'

// SVG shot composition templates
const TEMPLATES = {
  ECU: {
    label: 'Extreme Close-Up',
    abbr:  'ECU',
    svg: (
      <svg viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="160" height="90" fill="#111"/>
        {/* Face filling almost entire frame */}
        <ellipse cx="80" cy="45" rx="55" ry="50" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
        <ellipse cx="80" cy="38" rx="35" ry="28" fill="#333"/>
        {/* Eyes */}
        <ellipse cx="65" cy="36" rx="8" ry="5" fill="#555"/>
        <ellipse cx="95" cy="36" rx="8" ry="5" fill="#555"/>
        {/* Cut-off at top/bottom */}
        <rect y="0" width="160" height="8" fill="#111"/>
        <rect y="82" width="160" height="8" fill="#111"/>
      </svg>
    ),
  },
  CU: {
    label: 'Close-Up',
    abbr:  'CU',
    svg: (
      <svg viewBox="0 0 160 90" fill="none">
        <rect width="160" height="90" fill="#111"/>
        <ellipse cx="80" cy="40" rx="32" ry="36" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
        <ellipse cx="80" cy="35" rx="20" ry="16" fill="#333"/>
        <rect x="48" y="62" width="64" height="40" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
      </svg>
    ),
  },
  MCU: {
    label: 'Medium Close-Up',
    abbr:  'MCU',
    svg: (
      <svg viewBox="0 0 160 90" fill="none">
        <rect width="160" height="90" fill="#111"/>
        <ellipse cx="80" cy="28" rx="22" ry="24" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
        <rect x="55" y="48" width="50" height="65" rx="4" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
      </svg>
    ),
  },
  MS: {
    label: 'Medium Shot',
    abbr:  'MS',
    svg: (
      <svg viewBox="0 0 160 90" fill="none">
        <rect width="160" height="90" fill="#111"/>
        {/* Ground line */}
        <line x1="0" y1="80" x2="160" y2="80" stroke="#333" strokeWidth="1"/>
        <ellipse cx="80" cy="22" rx="18" ry="19" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
        <rect x="60" y="40" width="40" height="55" rx="3" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
      </svg>
    ),
  },
  WS: {
    label: 'Wide Shot',
    abbr:  'WS',
    svg: (
      <svg viewBox="0 0 160 90" fill="none">
        <rect width="160" height="90" fill="#111"/>
        {/* Background */}
        <rect x="0" y="55" width="160" height="35" fill="#1a1a1a"/>
        <line x1="0" y1="55" x2="160" y2="55" stroke="#333" strokeWidth="1"/>
        {/* Horizon buildings */}
        <rect x="10" y="30" width="20" height="25" fill="#222"/>
        <rect x="130" y="38" width="22" height="17" fill="#222"/>
        {/* Small figure */}
        <ellipse cx="80" cy="49" rx="5" ry="5" fill="#444" stroke="#555" strokeWidth="1"/>
        <rect x="76" y="53" width="8" height="12" rx="1" fill="#444" stroke="#555" strokeWidth="1"/>
      </svg>
    ),
  },
  EWS: {
    label: 'Extreme Wide Shot',
    abbr:  'EWS',
    svg: (
      <svg viewBox="0 0 160 90" fill="none">
        <rect width="160" height="90" fill="#111"/>
        {/* Sky */}
        <rect y="0" width="160" height="50" fill="#151515"/>
        {/* Ground */}
        <rect y="50" width="160" height="40" fill="#1a1a1a"/>
        {/* Mountains */}
        <polygon points="0,50 40,20 80,50" fill="#1e1e1e"/>
        <polygon points="60,50 110,15 160,50" fill="#222"/>
        {/* Tiny figure */}
        <rect x="78" y="46" width="4" height="6" fill="#555"/>
      </svg>
    ),
  },
  OTS: {
    label: 'Over-the-Shoulder',
    abbr:  'OTS',
    svg: (
      <svg viewBox="0 0 160 90" fill="none">
        <rect width="160" height="90" fill="#111"/>
        {/* Foreground shoulder (bottom-left) */}
        <path d="M0 90 Q30 60 60 50 L70 90Z" fill="#2a2a2a" stroke="#444" strokeWidth="1"/>
        <ellipse cx="42" cy="48" rx="20" ry="22" fill="#2a2a2a" stroke="#444" strokeWidth="1"/>
        {/* Face in background (center-right) */}
        <ellipse cx="110" cy="38" rx="22" ry="24" fill="#333" stroke="#555" strokeWidth="1"/>
        <ellipse cx="110" cy="32" rx="14" ry="12" fill="#3a3a3a"/>
      </svg>
    ),
  },
  POV: {
    label: 'Point of View',
    abbr:  'POV',
    svg: (
      <svg viewBox="0 0 160 90" fill="none">
        <rect width="160" height="90" fill="#111"/>
        {/* Vignette circle */}
        <ellipse cx="80" cy="45" rx="75" ry="42" fill="none" stroke="#222" strokeWidth="20"/>
        {/* Subject */}
        <ellipse cx="80" cy="35" rx="22" ry="24" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
        <rect x="58" y="56" width="44" height="50" rx="3" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
      </svg>
    ),
  },
  AERIAL: {
    label: 'Aerial / Bird\'s Eye',
    abbr:  'AERIAL',
    svg: (
      <svg viewBox="0 0 160 90" fill="none">
        <rect width="160" height="90" fill="#111"/>
        {/* Top-down ground */}
        <rect y="0" width="160" height="90" fill="#161616"/>
        {/* Road */}
        <rect x="68" y="0" width="24" height="90" fill="#1e1e1e"/>
        <line x1="80" y1="0" x2="80" y2="90" stroke="#333" strokeDasharray="8,6" strokeWidth="1"/>
        {/* Figure from above */}
        <ellipse cx="80" cy="45" rx="6" ry="4" fill="#444" stroke="#555" strokeWidth="1"/>
        <ellipse cx="80" cy="38" rx="4" ry="4" fill="#444" stroke="#555" strokeWidth="1"/>
      </svg>
    ),
  },
  TWO_SHOT: {
    label: 'Two Shot',
    abbr:  '2-SHOT',
    svg: (
      <svg viewBox="0 0 160 90" fill="none">
        <rect width="160" height="90" fill="#111"/>
        <line x1="0" y1="75" x2="160" y2="75" stroke="#333" strokeWidth="1"/>
        {/* Left figure */}
        <ellipse cx="52" cy="28" rx="16" ry="18" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
        <rect x="36" y="45" width="32" height="40" rx="3" fill="#2a2a2a" stroke="#555" strokeWidth="1"/>
        {/* Right figure */}
        <ellipse cx="108" cy="28" rx="16" ry="18" fill="#333" stroke="#555" strokeWidth="1"/>
        <rect x="92" y="45" width="32" height="40" rx="3" fill="#333" stroke="#555" strokeWidth="1"/>
      </svg>
    ),
  },
}

export function ShotTemplateGrid({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {Object.entries(TEMPLATES).map(([key, t]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`flex flex-col gap-1 p-1 rounded border transition-all ${
            selected === key
              ? 'border-accent bg-accent-glow'
              : 'border-border hover:border-accent-dim'
          }`}
        >
          <div className="w-full rounded overflow-hidden">{t.svg}</div>
          <span className={`text-center text-[10px] font-sans font-medium ${
            selected === key ? 'text-accent' : 'text-muted'
          }`}>
            {t.abbr}
          </span>
        </button>
      ))}
    </div>
  )
}

export function ShotTemplateSVG({ templateKey }) {
  if (!templateKey || !TEMPLATES[templateKey]) return null
  return (
    <div className="w-full h-full">{TEMPLATES[templateKey].svg}</div>
  )
}

export { TEMPLATES }
