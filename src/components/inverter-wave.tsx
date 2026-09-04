/**
 * Jafnstraumur → áriðill → riðstraumur: flöt DC-lína rennur inn í áriðil,
 * 230 V sínusbylgja rúllar út hinum megin og kveikir á perunni.
 * Hrein SVG + CSS. Notað á Fróðleiks-síðunni.
 */
export function InverterWave({ className = "" }: { className?: string }) {
  // Sínusbylgja: ein sveifla er 60 px breið, teiknum 6 sveiflur (360 px) og
  // rennum henni um 60 px – lítur út eins og óendanleg bylgja.
  const wave = (() => {
    let d = "M0 0";
    for (let i = 0; i < 6; i++) {
      const x = i * 60;
      d += ` C ${x + 15} -32, ${x + 15} -32, ${x + 30} 0 C ${x + 45} 32, ${x + 45} 32, ${x + 60} 0`;
    }
    return d;
  })();

  return (
    <svg
      viewBox="0 0 560 260"
      role="img"
      aria-label="Áriðill breytir jafnstraumi úr rafgeymi í 230 volta riðstraum"
      className={`iw ${className}`}
      fill="none"
    >
      <style>{`
        .iw { overflow: visible; }
        .iw-dc { stroke-dasharray: 10 8; animation: iw-dash 1s linear infinite; }
        .iw-wave { animation: iw-roll 1.4s linear infinite; }
        .iw-box { animation: iw-box 3s ease-in-out infinite; }
        .iw-bulb { animation: iw-bulb 3s ease-in-out infinite; }
        .iw-bulb-glow { transform-box: fill-box; transform-origin: center; animation: iw-glow 3s ease-in-out infinite; }
        .iw-dot { animation: iw-travel 2.2s linear infinite; offset-path: path("M104 130 L212 130"); }
        .iw-dot-2 { animation-delay: -1.1s; }
        @keyframes iw-dash { to { stroke-dashoffset: -18; } }
        @keyframes iw-roll { from { transform: translateX(0); } to { transform: translateX(-60px); } }
        @keyframes iw-box { 0%,100% { stroke-opacity: .5; } 50% { stroke-opacity: 1; } }
        @keyframes iw-bulb { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        @keyframes iw-glow { 0%,100% { transform: scale(.9); opacity: .35; } 50% { transform: scale(1.15); opacity: .75; } }
        @keyframes iw-travel { 0% { offset-distance: 0%; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
      `}</style>

      <defs>
        <linearGradient id="iw-cell" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1288ca" />
          <stop offset="1" stopColor="#4bd8ec" />
        </linearGradient>
        <linearGradient id="iw-wavegrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4bd8ec" />
          <stop offset="1" stopColor="#7ee8f5" />
        </linearGradient>
        <radialGradient id="iw-bulbglow">
          <stop offset="0" stopColor="#ffd66b" stopOpacity=".8" />
          <stop offset="1" stopColor="#ffd66b" stopOpacity="0" />
        </radialGradient>
        <filter id="iw-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="iw-clip">
          <rect x="348" y="80" width="150" height="100" />
        </clipPath>
      </defs>

      {/* Rafgeymir (DC) */}
      <g>
        <rect x="52" y="86" width="16" height="8" rx="2" fill="#ffffff" fillOpacity=".5" />
        <rect x="38" y="94" width="44" height="72" rx="8" fill="#0b1d30" fillOpacity=".9" stroke="#ffffff" strokeOpacity=".6" strokeWidth="2" />
        <rect x="45" y="101" width="30" height="58" rx="4" fill="url(#iw-cell)" />
        <text x="60" y="196" textAnchor="middle" fill="#ffffff" fillOpacity=".55" fontSize="11" fontFamily="var(--font-inter), system-ui, sans-serif">
          12 / 24 / 48 V
        </text>
        <text x="60" y="212" textAnchor="middle" fill="#7ee8f5" fontSize="11" fontWeight="600" letterSpacing=".12em" fontFamily="var(--font-inter), system-ui, sans-serif">
          DC
        </text>
      </g>

      {/* DC lína */}
      <line x1="84" y1="130" x2="212" y2="130" stroke="#ffffff" strokeOpacity=".15" strokeWidth="4" strokeLinecap="round" />
      <line className="iw-dc" x1="84" y1="130" x2="212" y2="130" stroke="#20cae1" strokeOpacity=".9" strokeWidth="2" strokeLinecap="round" />
      <g fill="#7ee8f5" filter="url(#iw-glow)">
        <circle className="iw-dot" r="3.5" />
        <circle className="iw-dot iw-dot-2" r="3.5" />
      </g>

      {/* Áriðill */}
      <g>
        <rect className="iw-box" x="214" y="78" width="120" height="104" rx="16" fill="#0b1d30" fillOpacity=".9" stroke="#4bd8ec" strokeWidth="2" filter="url(#iw-glow)" />
        <path d="M236 116 h22 M236 144 h22" stroke="#ffffff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
        <path d="M262 130 h10" stroke="#ffffff" strokeOpacity=".4" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M278 130 c 5 -14 10 -14 15 0 s 10 14 15 0" stroke="#ffffff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
        <text x="274" y="212" textAnchor="middle" fill="#ffffff" fillOpacity=".55" fontSize="11" fontFamily="var(--font-inter), system-ui, sans-serif">
          Áriðill
        </text>
      </g>

      {/* AC bylgja */}
      <line x1="336" y1="130" x2="498" y2="130" stroke="#ffffff" strokeOpacity=".12" strokeWidth="1" />
      <g clipPath="url(#iw-clip)">
        <g transform="translate(348 130)">
          <path className="iw-wave" d={wave} stroke="url(#iw-wavegrad)" strokeWidth="2.5" strokeLinecap="round" filter="url(#iw-glow)" />
        </g>
      </g>
      <text x="420" y="196" textAnchor="middle" fill="#ffffff" fillOpacity=".55" fontSize="11" fontFamily="var(--font-inter), system-ui, sans-serif">
        230 V · 50 Hz
      </text>
      <text x="420" y="212" textAnchor="middle" fill="#7ee8f5" fontSize="11" fontWeight="600" letterSpacing=".12em" fontFamily="var(--font-inter), system-ui, sans-serif">
        AC
      </text>

      {/* Pera */}
      <g>
        <circle className="iw-bulb-glow" cx="524" cy="118" r="34" fill="url(#iw-bulbglow)" />
        <g className="iw-bulb">
          <path d="M524 94 a18 18 0 0 1 10 33 v6 h-20 v-6 a18 18 0 0 1 10 -33 z" fill="#ffd66b" fillOpacity=".9" stroke="#fff3c4" strokeWidth="1.5" filter="url(#iw-glow)" />
          <rect x="516" y="135" width="16" height="6" rx="1.5" fill="#ffffff" fillOpacity=".55" />
          <rect x="518" y="143" width="12" height="4" rx="1.5" fill="#ffffff" fillOpacity=".4" />
        </g>
      </g>
    </svg>
  );
}
