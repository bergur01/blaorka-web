/**
 * Sólargangur yfir daginn: sólin fer eftir boga, framleiðsluferillinn teiknast
 * undir henni og rafgeymirinn til hægri fyllist. 12 s hringur, hrein SVG + CSS.
 * Notað á Reiknivélar-síðunni.
 */
export function SolarDay({ className = "" }: { className?: string }) {
  // Bogi sólar (frá "06" vinstra megin upp í hádegi og niður í "22")
  const arc = "M60 230 Q 270 -40 480 230";
  // Framleiðsluferill (bjölluferill) – sömu x-mörk og boginn
  const curve =
    "M60 230 C 110 230, 140 228, 170 195 C 200 160, 225 80, 270 78 C 315 80, 340 160, 370 195 C 400 228, 430 230, 480 230";
  const area = `${curve} L480 230 L60 230 Z`;

  const hours = ["06", "10", "14", "18", "22"];

  return (
    <svg
      viewBox="0 0 560 320"
      role="img"
      aria-label="Sólargangur og framleiðsla sólarsella yfir einn dag"
      className={`sd ${className}`}
      fill="none"
    >
      <style>{`
        .sd { overflow: visible; }
        .sd-sun { offset-path: path("${arc}"); animation: sd-travel 12s cubic-bezier(.45,0,.55,1) infinite; }
        .sd-sun-core { transform-box: fill-box; transform-origin: center; animation: sd-breathe 3s ease-in-out infinite; }
        .sd-reveal { animation: sd-reveal 12s cubic-bezier(.45,0,.55,1) infinite; }
        .sd-fill { transform-box: fill-box; transform-origin: bottom; animation: sd-fill 12s cubic-bezier(.45,0,.55,1) infinite; }
        .sd-sky { animation: sd-sky 12s ease-in-out infinite; }
        .sd-bolt { animation: sd-bolt 12s ease-in-out infinite; }
        @keyframes sd-travel { 0% { offset-distance: 0%; opacity: 0; } 4% { opacity: 1; } 94% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
        @keyframes sd-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.12); } }
        @keyframes sd-reveal { 0% { width: 0; } 100% { width: 420px; } }
        @keyframes sd-fill { 0%,8% { transform: scaleY(.06); } 92%,100% { transform: scaleY(1); } }
        @keyframes sd-sky { 0%,100% { opacity: .15; } 50% { opacity: .55; } }
        @keyframes sd-bolt { 0%,60% { opacity: .2; } 70%,100% { opacity: 1; } }
      `}</style>

      <defs>
        <linearGradient id="sd-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#20cae1" stopOpacity=".55" />
          <stop offset="1" stopColor="#1288ca" stopOpacity=".02" />
        </linearGradient>
        <linearGradient id="sd-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1288ca" />
          <stop offset=".5" stopColor="#7ee8f5" />
          <stop offset="1" stopColor="#1288ca" />
        </linearGradient>
        <radialGradient id="sd-sunglow">
          <stop offset="0" stopColor="#ffd66b" stopOpacity=".9" />
          <stop offset=".5" stopColor="#ffb54a" stopOpacity=".3" />
          <stop offset="1" stopColor="#ffb54a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sd-sunfill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#ffb54a" />
        </linearGradient>
        <linearGradient id="sd-batt" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1288ca" />
          <stop offset="1" stopColor="#4bd8ec" />
        </linearGradient>
        <radialGradient id="sd-skyglow" cx=".5" cy="1" r=".8">
          <stop offset="0" stopColor="#ffb54a" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffb54a" stopOpacity="0" />
        </radialGradient>
        <filter id="sd-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="sd-clip">
          <rect className="sd-reveal" x="60" y="0" width="0" height="240" />
        </clipPath>
      </defs>

      {/* Dagsbirta bak við ferilinn */}
      <rect className="sd-sky" x="60" y="40" width="420" height="190" fill="url(#sd-skyglow)" />

      {/* Rúðunet + tímaás */}
      <g stroke="#ffffff" strokeOpacity=".08">
        <line x1="60" y1="130" x2="480" y2="130" />
        <line x1="60" y1="180" x2="480" y2="180" />
      </g>
      <line x1="60" y1="230" x2="480" y2="230" stroke="#ffffff" strokeOpacity=".3" />
      {hours.map((h, i) => {
        const x = 60 + (i * 420) / (hours.length - 1);
        return (
          <g key={h}>
            <line x1={x} y1="230" x2={x} y2="236" stroke="#ffffff" strokeOpacity=".35" />
            <text x={x} y="254" textAnchor="middle" fill="#ffffff" fillOpacity=".5" fontSize="11" fontFamily="var(--font-inter), system-ui, sans-serif">
              {h}
            </text>
          </g>
        );
      })}

      {/* Bogi sólar */}
      <path d={arc} stroke="#ffd66b" strokeOpacity=".25" strokeWidth="1.2" strokeDasharray="3 7" />

      {/* Framleiðsluferill – afhjúpast með sólinni */}
      <g clipPath="url(#sd-clip)">
        <path d={area} fill="url(#sd-area)" />
        <path d={curve} stroke="url(#sd-line)" strokeWidth="2.5" strokeLinecap="round" filter="url(#sd-glow)" />
      </g>

      {/* Sól */}
      <g className="sd-sun">
        <circle r="34" fill="url(#sd-sunglow)" />
        <circle className="sd-sun-core" r="13" fill="url(#sd-sunfill)" filter="url(#sd-glow)" />
      </g>

      {/* Merkingar */}
      <text x="60" y="26" fill="#7ee8f5" fontSize="11" fontWeight="600" letterSpacing=".14em" fontFamily="var(--font-inter), system-ui, sans-serif">
        FRAMLEIÐSLA · kW
      </text>
      <text x="60" y="290" fill="#ffffff" fillOpacity=".45" fontSize="11" fontFamily="var(--font-inter), system-ui, sans-serif">
        Dæmigerður sumardagur á Íslandi
      </text>

      {/* Rafgeymir sem safnar deginum */}
      <g>
        <rect x="514" y="62" width="14" height="8" rx="2" fill="#ffffff" fillOpacity=".5" />
        <rect x="502" y="70" width="38" height="160" rx="8" fill="#0b1d30" fillOpacity=".9" stroke="#ffffff" strokeOpacity=".6" strokeWidth="2" />
        <rect className="sd-fill" x="508" y="76" width="26" height="148" rx="4" fill="url(#sd-batt)" />
        <path className="sd-bolt" d="M524 128 L514 152 L522 152 L518 168 L530 142 L522 142 Z" fill="#ffffff" filter="url(#sd-glow)" />
        <text x="521" y="254" textAnchor="middle" fill="#ffffff" fillOpacity=".5" fontSize="11" fontFamily="var(--font-inter), system-ui, sans-serif">
          kWh
        </text>
      </g>
    </svg>
  );
}
