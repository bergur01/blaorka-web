import { ICELAND_PATH, ICELAND_PLACES, ICELAND_VIEWBOX } from "@/content/iceland-outline";

/**
 * Íslandskort með púlsandi staðsetningum og orkulínum frá Fosshálsi.
 * Hrein SVG + CSS. Útlínan "teiknast" við hleðslu, staðir birtast einn af öðrum.
 */
export function IcelandMap({ className = "" }: { className?: string }) {
  const home = ICELAND_PLACES.find((p) => p.id === "reykjavik")!;
  const others = ICELAND_PLACES.filter((p) => p.id !== "reykjavik");

  // Bogin lína frá Fosshálsi á hvern stað
  const curve = (x: number, y: number) => {
    const mx = (home.x + x) / 2;
    const my = (home.y + y) / 2;
    const dx = x - home.x;
    const dy = y - home.y;
    // Beygja þvert á stefnuna, hlutfallslega við lengd
    const len = Math.hypot(dx, dy) || 1;
    const k = Math.min(60, len * 0.22);
    const cx = mx - (dy / len) * k;
    const cy = my + (dx / len) * k;
    return `M${home.x} ${home.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x} ${y}`;
  };

  return (
    <svg
      viewBox={ICELAND_VIEWBOX}
      role="img"
      aria-label="Ísland – uppsetningar Bláorku um allt land"
      className={`im ${className}`}
      fill="none"
    >
      <style>{`
        .im { overflow: visible; }
        .im-outline { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: im-draw 2.8s cubic-bezier(.4,0,.2,1) .2s forwards; }
        .im-fill { opacity: 0; animation: im-fade 1.6s ease-out 1.6s forwards; }
        .im-link { stroke-dasharray: 4 10; opacity: 0; animation: im-flow 1.6s linear infinite, im-fade 1s ease-out forwards; animation-delay: var(--d); }
        .im-place { opacity: 0; transform-box: fill-box; transform-origin: center; animation: im-pop .7s cubic-bezier(.2,.9,.3,1.4) forwards; animation-delay: var(--d); }
        .im-ring { transform-box: fill-box; transform-origin: center; animation: im-ping 3.2s cubic-bezier(.2,.6,.4,1) infinite; animation-delay: var(--d); }
        .im-ring-2 { animation-delay: calc(var(--d) + 1.1s); }
        .im-home { opacity: 0; transform-box: fill-box; transform-origin: center; animation: im-pop .8s cubic-bezier(.2,.9,.3,1.4) 1.4s forwards; }
        .im-home-glow { transform-box: fill-box; transform-origin: center; animation: im-breathe 3s ease-in-out infinite; }
        @keyframes im-draw { to { stroke-dashoffset: 0; } }
        @keyframes im-fade { to { opacity: 1; } }
        @keyframes im-flow { to { stroke-dashoffset: -28; } }
        @keyframes im-pop { 0% { opacity: 0; transform: scale(.3); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes im-ping { 0% { transform: scale(.4); opacity: .8; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes im-breathe { 0%,100% { transform: scale(1); opacity: .5; } 50% { transform: scale(1.25); opacity: .9; } }
      `}</style>

      <defs>
        <radialGradient id="im-grad" cx="0.3" cy="0.75" r="0.9">
          <stop offset="0" stopColor="#1288ca" stopOpacity=".45" />
          <stop offset="0.6" stopColor="#1288ca" stopOpacity=".12" />
          <stop offset="1" stopColor="#20cae1" stopOpacity=".04" />
        </radialGradient>
        <pattern id="im-dots" width="13" height="13" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.1" fill="#ffffff" fillOpacity=".22" />
        </pattern>
        <clipPath id="im-clip">
          <path d={ICELAND_PATH} />
        </clipPath>
        <filter id="im-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Landið */}
      <g className="im-fill">
        <path d={ICELAND_PATH} fill="url(#im-grad)" />
        <rect width="600" height="420" fill="url(#im-dots)" clipPath="url(#im-clip)" />
      </g>
      <path
        className="im-outline"
        d={ICELAND_PATH}
        pathLength={1000}
        stroke="#6dbbe7"
        strokeOpacity=".9"
        strokeWidth="1.6"
        strokeLinejoin="round"
        filter="url(#im-glow)"
      />

      {/* Orkulínur frá Fosshálsi */}
      <g stroke="#20cae1" strokeOpacity=".7" strokeWidth="1.4" strokeLinecap="round">
        {others.map((p, i) => (
          <path
            key={p.id}
            className="im-link"
            d={curve(p.x, p.y)}
            style={{ "--d": `${1.9 + i * 0.18}s` } as React.CSSProperties}
          />
        ))}
      </g>

      {/* Staðir */}
      {others.map((p, i) => (
        <g key={p.id} style={{ "--d": `${2.1 + i * 0.18}s` } as React.CSSProperties}>
          <circle className="im-ring" cx={p.x} cy={p.y} r="9" stroke="#4bd8ec" strokeWidth="1.2" />
          <circle className="im-ring im-ring-2" cx={p.x} cy={p.y} r="9" stroke="#4bd8ec" strokeWidth="1.2" />
          <g className="im-place">
            <circle cx={p.x} cy={p.y} r="5.5" fill="#071423" stroke="#7ee8f5" strokeWidth="1.5" />
            <circle cx={p.x} cy={p.y} r="2.4" fill="#7ee8f5" filter="url(#im-glow)" />
          </g>
        </g>
      ))}

      {/* Bláorka – Fossháls */}
      <g>
        <circle className="im-home-glow" cx={home.x} cy={home.y} r="22" fill="#1288ca" fillOpacity=".35" filter="url(#im-glow)" />
        <g className="im-home">
          <circle cx={home.x} cy={home.y} r="11" fill="#1288ca" stroke="#ffffff" strokeWidth="2" />
          <path
            d={`M${home.x + 1.5} ${home.y - 6} L${home.x - 3.5} ${home.y + 1} L${home.x} ${home.y + 1} L${home.x - 1.5} ${home.y + 6} L${home.x + 3.5} ${home.y - 1} L${home.x} ${home.y - 1} Z`}
            fill="#ffffff"
          />
          <text
            x={home.x + 18}
            y={home.y + 4}
            fill="#ffffff"
            fillOpacity=".85"
            fontSize="11"
            fontWeight="600"
            fontFamily="var(--font-inter), system-ui, sans-serif"
            letterSpacing=".04em"
          >
            Bláorka · Fossháls
          </text>
        </g>
      </g>
    </svg>
  );
}
