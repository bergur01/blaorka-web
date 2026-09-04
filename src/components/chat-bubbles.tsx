/**
 * Stutt samtal sem skrifast í rauntíma: viðskiptavinur lýsir verkefninu,
 * Bláorka svarar. 14 s hringur, hrein SVG + CSS. Notað á Hafa samband.
 */
export function ChatBubbles({ className = "" }: { className?: string }) {
  const font = "var(--font-inter), system-ui, sans-serif";
  // Ein sameiginleg 14 s tímalína (prósentur): allar bólur hverfa saman við OUT %
  const OUT = 92;
  const msg = (name: string, at: number) =>
    `@keyframes ${name} { 0%,${at}% { opacity: 0; transform: scale(.7) translateY(8px); } ${at + 2.5}% { opacity: 1; transform: none; } ${OUT}% { opacity: 1; transform: none; } ${OUT + 3}%,100% { opacity: 0; transform: none; } }`;
  const typing = (name: string, from: number, to: number) =>
    `@keyframes ${name} { 0%,${from}% { opacity: 0; } ${from + 0.5}% { opacity: 1; } ${to}%,100% { opacity: 0; } }`;
  return (
    <svg
      viewBox="0 0 560 320"
      role="img"
      aria-label="Samtal: viðskiptavinur spyr um sólarorku fyrir sumarhús og Bláorka svarar"
      className={`cb ${className}`}
      fill="none"
    >
      <style>{`
        .cb { overflow: visible; }
        .cb-msg { opacity: 0; transform-box: fill-box; animation-duration: 14s; animation-timing-function: cubic-bezier(.2,.9,.3,1.2); animation-iteration-count: infinite; }
        .cb-l { transform-origin: left bottom; }
        .cb-r { transform-origin: right bottom; }
        .cb-typing { opacity: 0; animation-duration: 14s; animation-timing-function: steps(1); animation-iteration-count: infinite; }
        .cb-typing circle { animation: cb-bounce 1s ease-in-out infinite; }
        .cb-typing circle:nth-child(2) { animation-delay: .15s; }
        .cb-typing circle:nth-child(3) { animation-delay: .3s; }
        .cb-bolt { transform-box: fill-box; transform-origin: center; animation: cb-bolt 14s ease-in-out infinite; }
        .cb-m1 { animation-name: cb-m1; } .cb-m2 { animation-name: cb-m2; } .cb-m3 { animation-name: cb-m3; } .cb-m4 { animation-name: cb-m4; }
        .cb-t1 { animation-name: cb-t1; } .cb-t2 { animation-name: cb-t2; }
        ${msg("cb-m1", 4)}
        ${msg("cb-m2", 28)}
        ${msg("cb-m3", 46)}
        ${msg("cb-m4", 70)}
        ${typing("cb-t1", 16, 28)}
        ${typing("cb-t2", 57, 70)}
        @keyframes cb-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes cb-bolt { 0%,73% { transform: scale(0) rotate(-20deg); opacity: 0; } 77% { transform: scale(1.3) rotate(5deg); opacity: 1; } 80%,${OUT}% { transform: scale(1) rotate(0); opacity: 1; } ${OUT + 3}%,100% { opacity: 0; } }
      `}</style>

      <defs>
        <filter id="cb-shadow" x="-10%" y="-10%" width="120%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity=".35" />
        </filter>
        <filter id="cb-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 1 – viðskiptavinur */}
      <g className="cb-msg cb-r cb-m1">
        <rect x="190" y="18" width="350" height="58" rx="18" fill="#ffffff" fillOpacity=".95" filter="url(#cb-shadow)" />
        <path d="M530 76 L544 84 L536 68 Z" fill="#ffffff" fillOpacity=".95" />
        <text x="214" y="42" fill="#071423" fontSize="14" fontFamily={font}>
          Hæ! Ég er með sumarhús án rafmagns –
        </text>
        <text x="214" y="62" fill="#071423" fontSize="14" fontFamily={font}>
          hvað þarf ég stórt sólarkerfi?
        </text>
      </g>

      {/* typing – Bláorka */}
      <g className="cb-typing cb-t1">
        <rect x="20" y="96" width="70" height="36" rx="18" fill="#1288ca" />
        <g fill="#ffffff">
          <circle cx="42" cy="114" r="4" />
          <circle cx="55" cy="114" r="4" />
          <circle cx="68" cy="114" r="4" />
        </g>
      </g>

      {/* 2 – Bláorka */}
      <g className="cb-msg cb-l cb-m2">
        <rect x="20" y="96" width="330" height="58" rx="18" fill="#1288ca" filter="url(#cb-shadow)" />
        <path d="M30 154 L16 162 L24 146 Z" fill="#1288ca" />
        <text x="44" y="120" fill="#ffffff" fontSize="14" fontFamily={font}>
          Sæl/l! Hvað notarðu helst – ljós,
        </text>
        <text x="44" y="140" fill="#ffffff" fontSize="14" fontFamily={font}>
          ísskáp, dælu, hleðslu?
        </text>
      </g>

      {/* 3 – viðskiptavinur */}
      <g className="cb-msg cb-r cb-m3">
        <rect x="220" y="174" width="320" height="40" rx="18" fill="#ffffff" fillOpacity=".95" filter="url(#cb-shadow)" />
        <path d="M530 214 L544 222 L536 206 Z" fill="#ffffff" fillOpacity=".95" />
        <text x="244" y="199" fill="#071423" fontSize="14" fontFamily={font}>
          Ísskáp, ljós og að hlaða símana – helgar.
        </text>
      </g>

      {/* typing – Bláorka */}
      <g className="cb-typing cb-t2">
        <rect x="20" y="234" width="70" height="36" rx="18" fill="#1288ca" />
        <g fill="#ffffff">
          <circle cx="42" cy="252" r="4" />
          <circle cx="55" cy="252" r="4" />
          <circle cx="68" cy="252" r="4" />
        </g>
      </g>

      {/* 4 – Bláorka */}
      <g className="cb-msg cb-l cb-m4">
        <rect x="20" y="234" width="380" height="58" rx="18" fill="#1288ca" filter="url(#cb-shadow)" />
        <path d="M30 292 L16 300 L24 284 Z" fill="#1288ca" />
        <text x="44" y="258" fill="#ffffff" fontSize="14" fontFamily={font}>
          Frábært – 2 sellur og 5 kWh rafgeymir duga.
        </text>
        <text x="44" y="278" fill="#ffffff" fontSize="14" fontFamily={font}>
          Sendum þér tillögu og verð í dag.
        </text>
      </g>

      {/* Elding sem staðfestir */}
      <g transform="translate(440 262)">
        <g className="cb-bolt">
          <circle r="18" fill="#20cae1" fillOpacity=".25" />
          <path d="M3 -12 L-6 2 L0 2 L-3 12 L7 -3 L1 -3 Z" fill="#7ee8f5" filter="url(#cb-glow)" />
        </g>
      </g>
    </svg>
  );
}
