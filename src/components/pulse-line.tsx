/**
 * „Við lifum á rafmagni“: hjartalínurit þar sem hver sláttur er elding.
 * Línan teiknar sig í sífellu með glóandi punkti fremst. Notað á Um okkur.
 */
export function PulseLine({ className = "" }: { className?: string }) {
  // Ein bylgja: flatt → elding → flatt (140 px breið). Fjórar í röð.
  const beat = (x: number) =>
    `L${x + 30} 120 L${x + 44} 120 L${x + 58} 62 L${x + 70} 168 L${x + 82} 96 L${x + 92} 120 L${x + 140} 120`;
  const path = `M0 120 ${beat(0)} ${beat(140)} ${beat(280)} ${beat(420)}`;

  return (
    <svg
      viewBox="0 0 560 240"
      role="img"
      aria-label="Hjartalínurit þar sem hver sláttur er elding"
      className={`pl ${className}`}
      fill="none"
    >
      <style>{`
        .pl { overflow: visible; }
        .pl-trace { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: pl-draw 6s linear infinite; }
        .pl-fade { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: pl-draw 6s linear infinite; opacity: .25; }
        .pl-head { offset-path: path("${path}"); animation: pl-head 6s linear infinite; }
        .pl-heart { transform-box: fill-box; transform-origin: center; animation: pl-heart 1.5s ease-in-out infinite; }
        .pl-glow { transform-box: fill-box; transform-origin: center; animation: pl-glow 1.5s ease-in-out infinite; }
        @keyframes pl-draw { 0% { stroke-dashoffset: 1000; } 85% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 0; } }
        @keyframes pl-head { 0% { offset-distance: 0%; opacity: 1; } 85% { offset-distance: 100%; opacity: 1; } 86%,100% { opacity: 0; } }
        @keyframes pl-heart { 0%,100% { transform: scale(1); } 18% { transform: scale(1.12); } 36% { transform: scale(1); } }
        @keyframes pl-glow { 0%,100% { transform: scale(.9); opacity: .35; } 18% { transform: scale(1.3); opacity: .8; } }
      `}</style>

      <defs>
        <linearGradient id="pl-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1288ca" />
          <stop offset=".5" stopColor="#4bd8ec" />
          <stop offset="1" stopColor="#7ee8f5" />
        </linearGradient>
        <radialGradient id="pl-heartglow">
          <stop offset="0" stopColor="#20cae1" stopOpacity=".7" />
          <stop offset="1" stopColor="#20cae1" stopOpacity="0" />
        </radialGradient>
        <filter id="pl-blur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="pl-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" stroke="#ffffff" strokeOpacity=".06" />
        </pattern>
      </defs>

      {/* Rúðunet eins og á hjartalínuritspappír */}
      <rect x="0" y="30" width="560" height="180" fill="url(#pl-grid)" />
      <line x1="0" y1="120" x2="560" y2="120" stroke="#ffffff" strokeOpacity=".1" />

      {/* Línan – dauf heild + teiknuð lína með glóandi haus */}
      <path className="pl-fade" d={path} pathLength={1000} stroke="#4bd8ec" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path className="pl-trace" d={path} pathLength={1000} stroke="url(#pl-grad)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" filter="url(#pl-blur)" />
      <circle className="pl-head" r="4.5" fill="#ffffff" filter="url(#pl-blur)" />

      {/* Hjarta með eldingu */}
      <g transform="translate(500 44)">
        <circle className="pl-glow" r="34" fill="url(#pl-heartglow)" />
        <g className="pl-heart">
          <path
            d="M0 22 C -4 18 -22 6 -22 -6 C -22 -15 -15 -20 -9 -20 C -4 -20 -1 -17 0 -14 C 1 -17 4 -20 9 -20 C 15 -20 22 -15 22 -6 C 22 6 4 18 0 22 Z"
            fill="#1288ca"
            stroke="#7ee8f5"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M3 -12 L-6 2 L0 2 L-3 12 L7 -3 L1 -3 Z" fill="#ffffff" />
        </g>
      </g>

      <text x="0" y="228" fill="#7ee8f5" fontSize="11" fontWeight="600" letterSpacing=".14em" fontFamily="var(--font-inter), system-ui, sans-serif">
        VIÐ LIFUM Á RAFMAGNI
      </text>
      <text x="560" y="228" textAnchor="end" fill="#ffffff" fillOpacity=".45" fontSize="11" fontFamily="var(--font-inter), system-ui, sans-serif">
        síðan 2016
      </text>
    </svg>
  );
}
