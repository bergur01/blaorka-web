/**
 * Orkuflæðis-animation fyrir hero á forsíðu: sól → sólarsella → rafgeymir → hús.
 * Hrein SVG + CSS (engin JS), svo hún rennur í server components og virðir
 * prefers-reduced-motion (globals.css stöðvar allar CSS-animations).
 */
export function EnergyFlow({ className = "" }: { className?: string }) {
  const cable1 = "M182 232 C 212 232, 216 230, 250 230";
  const cable2 = "M310 230 C 342 230, 344 262, 372 262";

  return (
    <svg
      viewBox="0 0 560 340"
      role="img"
      aria-label="Sólarorka hleður rafgeymi sem knýr húsið"
      className={`ef ${className}`}
      fill="none"
    >
      <style>{`
        .ef { overflow: visible; }
        .ef * { transform-box: fill-box; }

        /* Sól */
        .ef-rays { transform-origin: center; animation: ef-spin 40s linear infinite; }
        .ef-halo { transform-origin: center; animation: ef-halo 4s ease-in-out infinite; }
        .ef-sun  { transform-origin: center; animation: ef-halo 4s ease-in-out infinite reverse; }

        /* Geislar á selluna */
        .ef-beam { stroke-dasharray: 5 9; animation: ef-dash 1.4s linear infinite; }
        .ef-beam:nth-child(2) { animation-delay: -.4s; }
        .ef-beam:nth-child(3) { animation-delay: -.8s; }

        /* Kaplar */
        .ef-flow { stroke-dasharray: 7 11; animation: ef-dash 1.1s linear infinite; }

        /* Orkupunktar sem ferðast eftir köplunum */
        .ef-dot { animation: ef-travel 2.4s cubic-bezier(.45,0,.55,1) infinite; }
        .ef-dot-1 { offset-path: path("${cable1}"); }
        .ef-dot-2 { offset-path: path("${cable2}"); }
        .ef-d2 { animation-delay: -.8s; }
        .ef-d3 { animation-delay: -1.6s; }

        /* Rafgeymir fyllist – hver sella á sínum tíma í 9 s hring */
        .ef-cell { transform-origin: bottom; }
        .ef-cell-1 { animation: ef-cell-1 9s ease-out infinite; }
        .ef-cell-2 { animation: ef-cell-2 9s ease-out infinite; }
        .ef-cell-3 { animation: ef-cell-3 9s ease-out infinite; }
        .ef-cell-4 { animation: ef-cell-4 9s ease-out infinite; }
        .ef-ring { transform-origin: center; animation: ef-ring 3s ease-out infinite; }
        .ef-bolt { animation: ef-bolt 9s ease-in-out infinite; }

        /* Hús kviknar þegar rafgeymirinn er fullur */
        .ef-light { animation: ef-light 9s ease-in-out infinite; }
        .ef-lamp { transform-origin: center; animation: ef-light 9s ease-in-out infinite; }

        @keyframes ef-spin { to { transform: rotate(360deg); } }
        @keyframes ef-halo { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.12); opacity: .85; } }
        @keyframes ef-dash { to { stroke-dashoffset: -36; } }
        @keyframes ef-travel {
          0%   { offset-distance: 0%;   opacity: 0; }
          12%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes ef-cell-1 { 0%,6%  { transform: scaleY(0); } 14%,88% { transform: scaleY(1); } 96%,100% { transform: scaleY(0); } }
        @keyframes ef-cell-2 { 0%,16% { transform: scaleY(0); } 24%,88% { transform: scaleY(1); } 96%,100% { transform: scaleY(0); } }
        @keyframes ef-cell-3 { 0%,26% { transform: scaleY(0); } 34%,88% { transform: scaleY(1); } 96%,100% { transform: scaleY(0); } }
        @keyframes ef-cell-4 { 0%,36% { transform: scaleY(0); } 44%,88% { transform: scaleY(1); } 96%,100% { transform: scaleY(0); } }
        @keyframes ef-ring { 0% { transform: scale(.6); opacity: .6; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes ef-bolt { 0%,40% { opacity: .25; } 46%,86% { opacity: 1; } 94%,100% { opacity: .25; } }
        @keyframes ef-light { 0%,42% { opacity: 0; } 50%,86% { opacity: 1; } 94%,100% { opacity: 0; } }
      `}</style>

      <defs>
        <radialGradient id="ef-sun-halo">
          <stop offset="0" stopColor="#ffd66b" stopOpacity=".9" />
          <stop offset=".5" stopColor="#ffb54a" stopOpacity=".35" />
          <stop offset="1" stopColor="#ffb54a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ef-sun-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#ffb54a" />
        </linearGradient>
        <linearGradient id="ef-beam-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd66b" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffd66b" stopOpacity=".05" />
        </linearGradient>
        <linearGradient id="ef-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#123f6b" />
          <stop offset="1" stopColor="#0a2440" />
        </linearGradient>
        <linearGradient id="ef-cellfill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1288ca" />
          <stop offset="1" stopColor="#4bd8ec" />
        </linearGradient>
        <radialGradient id="ef-window-glow">
          <stop offset="0" stopColor="#ffd66b" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffd66b" stopOpacity="0" />
        </radialGradient>
        <filter id="ef-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="ef-panel-clip">
          <polygon points="30,215 170,185 190,245 50,275" />
        </clipPath>
      </defs>

      {/* Jörð */}
      <line x1="16" y1="290" x2="544" y2="290" stroke="#ffffff" strokeOpacity=".14" strokeWidth="1.5" />
      <ellipse cx="280" cy="292" rx="250" ry="10" fill="#20cae1" fillOpacity=".06" />

      {/* ---- Sól ---- */}
      <g>
        <circle className="ef-halo" cx="100" cy="80" r="58" fill="url(#ef-sun-halo)" />
        <g className="ef-rays" stroke="#ffd66b" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            const x1 = 100 + Math.cos(a) * 36;
            const y1 = 80 + Math.sin(a) * 36;
            const x2 = 100 + Math.cos(a) * (i % 2 ? 44 : 50);
            const y2 = 80 + Math.sin(a) * (i % 2 ? 44 : 50);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </g>
        <circle className="ef-sun" cx="100" cy="80" r="26" fill="url(#ef-sun-fill)" filter="url(#ef-glow)" />
      </g>

      {/* Geislar frá sól á selluna */}
      <g stroke="url(#ef-beam-grad)" strokeWidth="2" strokeLinecap="round">
        <line className="ef-beam" x1="108" y1="112" x2="82" y2="205" />
        <line className="ef-beam" x1="124" y1="110" x2="120" y2="197" />
        <line className="ef-beam" x1="140" y1="104" x2="158" y2="190" />
      </g>

      {/* ---- Sólarsella ---- */}
      <g>
        <line x1="72" y1="270" x2="72" y2="290" stroke="#ffffff" strokeOpacity=".35" strokeWidth="3" />
        <line x1="168" y1="250" x2="168" y2="290" stroke="#ffffff" strokeOpacity=".35" strokeWidth="3" />
        <polygon points="30,215 170,185 190,245 50,275" fill="url(#ef-panel)" stroke="#6dbbe7" strokeOpacity=".8" strokeWidth="2" strokeLinejoin="round" />
        <g clipPath="url(#ef-panel-clip)" stroke="#a3d3f0" strokeOpacity=".35" strokeWidth="1">
          <line x1="58" y1="209" x2="196" y2="179" />
          <line x1="72" y1="235" x2="210" y2="205" />
          <line x1="86" y1="261" x2="224" y2="231" />
          <line x1="60" y1="210" x2="80" y2="270" />
          <line x1="90" y1="203" x2="110" y2="263" />
          <line x1="120" y1="196" x2="140" y2="256" />
          <line x1="150" y1="189" x2="170" y2="249" />
        </g>
        {/* Glampi */}
        <polygon points="36,217 70,209 82,240 48,248" fill="#ffffff" fillOpacity=".08" />
      </g>

      {/* ---- Kaplar ---- */}
      <g strokeLinecap="round" fill="none">
        <path d={cable1} stroke="#ffffff" strokeOpacity=".16" strokeWidth="4" />
        <path d={cable2} stroke="#ffffff" strokeOpacity=".16" strokeWidth="4" />
        <path className="ef-flow" d={cable1} stroke="#20cae1" strokeOpacity=".9" strokeWidth="2" />
        <path className="ef-flow" d={cable2} stroke="#20cae1" strokeOpacity=".9" strokeWidth="2" />
      </g>
      <g fill="#7ee8f5" filter="url(#ef-glow)">
        <circle className="ef-dot ef-dot-1" r="3.5" />
        <circle className="ef-dot ef-dot-1 ef-d2" r="3.5" />
        <circle className="ef-dot ef-dot-1 ef-d3" r="3.5" />
        <circle className="ef-dot ef-dot-2" r="3.5" />
        <circle className="ef-dot ef-dot-2 ef-d2" r="3.5" />
        <circle className="ef-dot ef-dot-2 ef-d3" r="3.5" />
      </g>

      {/* ---- Rafgeymir ---- */}
      <g>
        <circle className="ef-ring" cx="280" cy="222" r="60" stroke="#20cae1" strokeWidth="1.5" />
        <rect x="270" y="150" width="20" height="12" rx="3" fill="#ffffff" fillOpacity=".5" />
        <rect x="250" y="160" width="60" height="120" rx="10" fill="#0b1d30" fillOpacity=".9" stroke="#ffffff" strokeOpacity=".65" strokeWidth="2.5" />
        <g fill="url(#ef-cellfill)">
          <rect className="ef-cell ef-cell-1" x="258" y="248" width="44" height="22" rx="4" />
          <rect className="ef-cell ef-cell-2" x="258" y="222" width="44" height="22" rx="4" />
          <rect className="ef-cell ef-cell-3" x="258" y="196" width="44" height="22" rx="4" />
          <rect className="ef-cell ef-cell-4" x="258" y="170" width="44" height="22" rx="4" />
        </g>
        {/* Elding */}
        <path
          className="ef-bolt"
          d="M283 200 L272 226 L281 226 L277 244 L290 216 L281 216 Z"
          fill="#ffffff"
          filter="url(#ef-glow)"
        />
      </g>

      {/* ---- Hús ---- */}
      <g>
        {/* Ljósglampi úr gluggum */}
        <ellipse className="ef-light" cx="445" cy="235" rx="110" ry="60" fill="url(#ef-window-glow)" />
        <rect x="372" y="195" width="146" height="95" fill="#0b1d30" fillOpacity=".9" stroke="#ffffff" strokeOpacity=".65" strokeWidth="2.5" />
        <polygon points="358,197 445,128 532,197" fill="#102a44" stroke="#ffffff" strokeOpacity=".7" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Sólarsella á þaki */}
        <polygon points="462,150 500,180 480,180 448,153" fill="#123f6b" stroke="#6dbbe7" strokeOpacity=".7" strokeWidth="1.5" />
        {/* Hurð */}
        <rect x="430" y="245" width="30" height="45" rx="2" fill="#071423" stroke="#ffffff" strokeOpacity=".4" strokeWidth="1.5" />
        {/* Gluggar – kvikna */}
        <rect x="388" y="215" width="28" height="24" rx="2" fill="#071423" stroke="#ffffff" strokeOpacity=".4" strokeWidth="1.5" />
        <rect x="474" y="215" width="28" height="24" rx="2" fill="#071423" stroke="#ffffff" strokeOpacity=".4" strokeWidth="1.5" />
        <g className="ef-light" fill="#ffd66b" filter="url(#ef-glow)">
          <rect x="390" y="217" width="24" height="20" rx="1.5" />
          <rect x="476" y="217" width="24" height="20" rx="1.5" />
          <rect x="437" y="258" width="16" height="8" rx="1" fillOpacity=".7" />
        </g>
        {/* Reykháfur */}
        <rect x="492" y="140" width="14" height="30" fill="#102a44" stroke="#ffffff" strokeOpacity=".5" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
