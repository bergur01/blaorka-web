/**
 * Fjarskiptastaður: mastur á fjalli sendir út púlsandi merki, sólarsella og
 * rafgeymaskápur við rætur þess. Hrein SVG + CSS. Notað á Fréttir-síðunni.
 */
export function BroadcastMast({ className = "" }: { className?: string }) {
  const cable = "M158 232 C 190 232, 196 236, 226 236";
  return (
    <svg
      viewBox="0 0 560 300"
      role="img"
      aria-label="Fjarskiptamastur knúið sólarorku sendir út merki"
      className={`bm ${className}`}
      fill="none"
    >
      <style>{`
        .bm { overflow: visible; }
        .bm-ring { transform-box: fill-box; transform-origin: center; animation: bm-ring 3.6s cubic-bezier(.2,.6,.4,1) infinite; }
        .bm-ring-2 { animation-delay: 1.2s; }
        .bm-ring-3 { animation-delay: 2.4s; }
        .bm-tip { transform-box: fill-box; transform-origin: center; animation: bm-tip 1.2s ease-in-out infinite; }
        .bm-arc { stroke-dasharray: 6 8; animation: bm-arc 1.8s linear infinite; }
        .bm-arc-l { animation-direction: reverse; }
        .bm-flow { stroke-dasharray: 6 10; animation: bm-flow 1.2s linear infinite; }
        .bm-dot { offset-path: path("${cable}"); animation: bm-travel 2.4s linear infinite; }
        .bm-dot-2 { animation-delay: -1.2s; }
        .bm-led { animation: bm-led 2s steps(1) infinite; }
        .bm-cloud { animation: bm-cloud 26s linear infinite; }
        .bm-cloud-2 { animation-duration: 38s; animation-delay: -14s; }
        @keyframes bm-ring { 0% { transform: scale(.15); opacity: .9; } 100% { transform: scale(1); opacity: 0; } }
        @keyframes bm-tip { 0%,100% { opacity: .5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        @keyframes bm-arc { to { stroke-dashoffset: -28; } }
        @keyframes bm-flow { to { stroke-dashoffset: -32; } }
        @keyframes bm-travel { 0% { offset-distance: 0%; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
        @keyframes bm-led { 0%,49% { opacity: 1; } 50%,100% { opacity: .25; } }
        @keyframes bm-cloud { from { transform: translateX(-140px); } to { transform: translateX(600px); } }
      `}</style>

      <defs>
        <linearGradient id="bm-mtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a3a59" />
          <stop offset="1" stopColor="#0b1d30" />
        </linearGradient>
        <linearGradient id="bm-mtn-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#102a44" />
          <stop offset="1" stopColor="#071423" />
        </linearGradient>
        <linearGradient id="bm-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#123f6b" />
          <stop offset="1" stopColor="#0a2440" />
        </linearGradient>
        <radialGradient id="bm-glow">
          <stop offset="0" stopColor="#4bd8ec" stopOpacity=".7" />
          <stop offset="1" stopColor="#4bd8ec" stopOpacity="0" />
        </radialGradient>
        <filter id="bm-blur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ský */}
      <g fill="#ffffff" fillOpacity=".07">
        <g className="bm-cloud">
          <ellipse cx="0" cy="70" rx="46" ry="12" />
          <ellipse cx="22" cy="62" rx="30" ry="14" />
        </g>
        <g className="bm-cloud bm-cloud-2">
          <ellipse cx="0" cy="120" rx="36" ry="9" />
          <ellipse cx="18" cy="114" rx="22" ry="11" />
        </g>
      </g>

      {/* Fjöll */}
      <polygon points="0,290 120,200 210,250 330,150 430,230 560,190 560,290" fill="url(#bm-mtn-2)" />
      <polygon points="120,290 250,232 380,280 470,220 560,262 560,290" fill="url(#bm-mtn)" />
      <line x1="0" y1="290" x2="560" y2="290" stroke="#ffffff" strokeOpacity=".15" strokeWidth="1.5" />

      {/* Merki frá toppi mastursins */}
      <g>
        <circle className="bm-ring" cx="390" cy="60" r="110" stroke="#4bd8ec" strokeWidth="1.4" />
        <circle className="bm-ring bm-ring-2" cx="390" cy="60" r="110" stroke="#4bd8ec" strokeWidth="1.4" />
        <circle className="bm-ring bm-ring-3" cx="390" cy="60" r="110" stroke="#4bd8ec" strokeWidth="1.4" />
        <g stroke="#7ee8f5" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round">
          <path className="bm-arc" d="M418 40 A 40 40 0 0 1 418 80" />
          <path className="bm-arc" d="M434 26 A 60 60 0 0 1 434 94" />
          <path className="bm-arc bm-arc-l" d="M362 40 A 40 40 0 0 0 362 80" />
          <path className="bm-arc bm-arc-l" d="M346 26 A 60 60 0 0 0 346 94" />
        </g>
        <circle cx="390" cy="60" r="26" fill="url(#bm-glow)" />
        <circle className="bm-tip" cx="390" cy="60" r="4" fill="#7ee8f5" filter="url(#bm-blur)" />
      </g>

      {/* Mastur */}
      <g stroke="#ffffff" strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="390" y1="64" x2="390" y2="90" />
        <path d="M376 250 L390 90 L404 250" />
        <path d="M379 220 h22 M381 190 h18 M383 160 h14 M385 130 h10" strokeOpacity=".4" />
        <path d="M379 220 L401 190 M381 190 L399 160 M383 160 L397 130 M379 220 L399 250 M401 220 L377 250" strokeOpacity=".3" strokeWidth="1.2" />
        <line x1="366" y1="250" x2="414" y2="250" />
        <rect x="396" y="112" width="10" height="16" rx="2" fill="#0b1d30" strokeOpacity=".6" />
        <rect x="374" y="140" width="10" height="16" rx="2" fill="#0b1d30" strokeOpacity=".6" />
      </g>
      <circle className="bm-led" cx="390" cy="80" r="2.5" fill="#ff5a5a" filter="url(#bm-blur)" />

      {/* Sólarsella + rafgeymaskápur */}
      <g>
        <line x1="78" y1="266" x2="78" y2="290" stroke="#ffffff" strokeOpacity=".35" strokeWidth="3" />
        <line x1="146" y1="252" x2="146" y2="290" stroke="#ffffff" strokeOpacity=".35" strokeWidth="3" />
        <polygon points="46,222 150,204 162,244 58,262" fill="url(#bm-panel)" stroke="#6dbbe7" strokeOpacity=".8" strokeWidth="2" strokeLinejoin="round" />
        <g stroke="#a3d3f0" strokeOpacity=".35" strokeWidth="1">
          <line x1="52" y1="242" x2="156" y2="224" />
          <line x1="80" y1="216" x2="92" y2="256" />
          <line x1="114" y1="210" x2="126" y2="250" />
        </g>
        <path d={cable} stroke="#ffffff" strokeOpacity=".16" strokeWidth="4" strokeLinecap="round" />
        <path className="bm-flow" d={cable} stroke="#20cae1" strokeOpacity=".9" strokeWidth="2" strokeLinecap="round" />
        <g fill="#7ee8f5" filter="url(#bm-blur)">
          <circle className="bm-dot" r="3" />
          <circle className="bm-dot bm-dot-2" r="3" />
        </g>
        <rect x="226" y="214" width="56" height="76" rx="6" fill="#0b1d30" stroke="#ffffff" strokeOpacity=".6" strokeWidth="2" />
        <rect x="234" y="224" width="40" height="8" rx="2" fill="#1288ca" />
        <rect x="234" y="238" width="40" height="8" rx="2" fill="#1288ca" fillOpacity=".8" />
        <rect x="234" y="252" width="40" height="8" rx="2" fill="#1288ca" fillOpacity=".6" />
        <circle cx="270" cy="276" r="2.5" fill="#4bd8ec" className="bm-led" />
        <line x1="282" y1="252" x2="390" y2="252" stroke="#ffffff" strokeOpacity=".2" strokeWidth="2" strokeDasharray="2 6" />
      </g>
    </svg>
  );
}
