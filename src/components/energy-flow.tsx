"use client";

import { useEffect, useState } from "react";

/**
 * Orkukerfi í rauntíma fyrir hero á forsíðu.
 *
 * Sól + sólarsella og vindmylla framleiða, rafgeymirinn í miðjunni safnar,
 * húsið og rafbíllinn nota. Öll hreyfing (geislar, spaðar, orkupunktar) er
 * hrein CSS; tölurnar (kW, %, kWh) eru reiknaðar í JS á 200 ms fresti úr
 * mjúkum bylgjuföllum svo þær tikki lifandi en séu alltaf sennilegar.
 */

const CABLES = {
  panel: "M172 150 C 222 150, 232 198, 268 198",
  wind: "M470 180 C 424 180, 384 198, 332 198",
  house: "M284 292 C 284 342, 232 382, 192 382",
  car: "M316 292 C 316 342, 368 394, 414 394",
};

type Stats = {
  solar: number;
  wind: number;
  house: number;
  battery: number;
  carPct: number;
  carCharging: boolean;
  today: number;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Sólargeislar – reiknaðir einu sinni og námundaðir svo SSR og client skili sama HTML
const RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const r2 = i % 2 ? 37 : 42;
  const f = (v: number) => Number(v.toFixed(2));
  return {
    x1: f(62 + Math.cos(a) * 30),
    y1: f(58 + Math.sin(a) * 30),
    x2: f(62 + Math.cos(a) * r2),
    y2: f(58 + Math.sin(a) * r2),
  };
});

function compute(t: number): Stats {
  const solar = clamp(3.6 + 1.0 * Math.sin(t / 2.3) + 0.35 * Math.sin(t / 0.7), 0.4, 5.0);
  const wind = clamp(1.2 + 0.7 * Math.sin(t / 3.1 + 1) + 0.25 * Math.sin(t / 0.9), 0.1, 2.4);
  const house = clamp(1.7 + 0.5 * Math.sin(t / 4 + 2) + 0.2 * Math.sin(t / 1.1), 0.6, 3.0);
  const battery = 60 + 34 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 40));
  const phase = t % 30; // 24 s hleðsla, 6 s "fullhlaðið"
  const carCharging = phase < 24;
  const carPct = carCharging ? 22 + (78 * phase) / 24 : 100;
  const today = 14.2 + t * 0.02;
  return { solar, wind, house, battery, carPct, carCharging, today };
}

const kw = (v: number) => `${v.toFixed(1).replace(".", ",")} kW`;
const pct = (v: number) => `${Math.round(v)} %`;

function Readout({
  x,
  y,
  w,
  label,
  value,
  accent = false,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={w}
        height="26"
        rx="13"
        fill={accent ? "#1288ca" : "#071423"}
        fillOpacity={accent ? 0.95 : 0.85}
        stroke={accent ? "#4bd8ec" : "#ffffff"}
        strokeOpacity={accent ? 0.7 : 0.18}
      />
      <text
        x="12"
        y="17"
        fill="#ffffff"
        fillOpacity=".6"
        fontSize="10"
        fontFamily="var(--font-inter), system-ui, sans-serif"
        letterSpacing=".06em"
      >
        {label.toUpperCase()}
      </text>
      <text
        x={w - 12}
        y="17.5"
        textAnchor="end"
        fill={accent ? "#ffffff" : "#7ee8f5"}
        fontSize="13"
        fontWeight="700"
        fontFamily="var(--font-inter), system-ui, sans-serif"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </text>
    </g>
  );
}

export function EnergyFlow({ className = "" }: { className?: string }) {
  const [s, setS] = useState<Stats>(() => compute(0));

  useEffect(() => {
    const t0 = performance.now();
    const id = window.setInterval(() => setS(compute((performance.now() - t0) / 1000)), 200);
    return () => window.clearInterval(id);
  }, []);

  // Rafgeymir: innra svæði y 180–288 (108 px)
  const fillH = 108 * (s.battery / 100);
  const carColor = s.carCharging ? "#4bd8ec" : "#7ee8f5";

  return (
    <svg
      viewBox="0 0 600 440"
      role="img"
      aria-label="Sól og vindur hlaða rafgeymi sem knýr hús og rafbíl – framleiðslutölur í rauntíma"
      className={`ef ${className}`}
      fill="none"
    >
      <style>{`
        .ef { overflow: visible; }
        .ef-rays { transform-box: fill-box; transform-origin: center; animation: ef-spin 40s linear infinite; }
        .ef-halo { transform-box: fill-box; transform-origin: center; animation: ef-halo 4s ease-in-out infinite; }
        .ef-beam { stroke-dasharray: 5 9; animation: ef-dash 1.4s linear infinite; }
        .ef-beam:nth-child(2) { animation-delay: -.4s; }
        .ef-beam:nth-child(3) { animation-delay: -.8s; }
        .ef-blades { transform-box: fill-box; transform-origin: center; animation: ef-spin 2.8s linear infinite; }
        .ef-flow { stroke-dasharray: 7 11; animation: ef-dash 1.1s linear infinite; }
        .ef-dot { animation: ef-travel 2.4s cubic-bezier(.45,0,.55,1) infinite; }
        .ef-dot-panel { offset-path: path("${CABLES.panel}"); }
        .ef-dot-wind { offset-path: path("${CABLES.wind}"); }
        .ef-dot-house { offset-path: path("${CABLES.house}"); }
        .ef-dot-car { offset-path: path("${CABLES.car}"); }
        .ef-d2 { animation-delay: -.8s; }
        .ef-d3 { animation-delay: -1.6s; }
        .ef-ring { transform-box: fill-box; transform-origin: center; animation: ef-ring 3s ease-out infinite; }
        .ef-bolt { animation: ef-bolt 1.6s ease-in-out infinite; }
        .ef-light { animation: ef-light 5s ease-in-out infinite; }
        .ef-carglow { transform-box: fill-box; transform-origin: center; animation: ef-halo 2s ease-in-out infinite; }
        .ef-fill { transition: height .6s ease, y .6s ease; }
        @keyframes ef-spin { to { transform: rotate(360deg); } }
        @keyframes ef-halo { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.12); opacity: .85; } }
        @keyframes ef-dash { to { stroke-dashoffset: -36; } }
        @keyframes ef-travel { 0% { offset-distance: 0%; opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
        @keyframes ef-ring { 0% { transform: scale(.6); opacity: .6; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes ef-bolt { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        @keyframes ef-light { 0%,100% { opacity: .75; } 50% { opacity: 1; } }
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
        <linearGradient id="ef-car" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a3a59" />
          <stop offset="1" stopColor="#0b1d30" />
        </linearGradient>
        <radialGradient id="ef-window-glow">
          <stop offset="0" stopColor="#ffd66b" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffd66b" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ef-car-glow">
          <stop offset="0" stopColor="#4bd8ec" stopOpacity=".45" />
          <stop offset="1" stopColor="#4bd8ec" stopOpacity="0" />
        </radialGradient>
        <filter id="ef-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="ef-panel-clip">
          <polygon points="30,125 170,105 172,165 32,185" />
        </clipPath>
      </defs>

      {/* Titill + dagsframleiðsla */}
      <text x="300" y="30" textAnchor="middle" fill="#7ee8f5" fontSize="10" fontWeight="600" letterSpacing=".16em" fontFamily="var(--font-inter), system-ui, sans-serif">
        ORKUKERFI Í RAUNTÍMA
      </text>
      <Readout x={222} y={40} w={156} label="Í dag" value={`${s.today.toFixed(1).replace(".", ",")} kWh`} />

      {/* Jörð */}
      <line x1="16" y1="432" x2="584" y2="432" stroke="#ffffff" strokeOpacity=".14" strokeWidth="1.5" />

      {/* ---- Sól ---- */}
      <g>
        <circle className="ef-halo" cx="62" cy="58" r="48" fill="url(#ef-sun-halo)" />
        <g className="ef-rays" stroke="#ffd66b" strokeOpacity=".7" strokeWidth="2.5" strokeLinecap="round">
          {RAYS.map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
          ))}
        </g>
        <circle cx="62" cy="58" r="21" fill="url(#ef-sun-fill)" filter="url(#ef-glow)" />
      </g>
      <g stroke="url(#ef-beam-grad)" strokeWidth="2" strokeLinecap="round">
        <line className="ef-beam" x1="72" y1="84" x2="62" y2="122" />
        <line className="ef-beam" x1="88" y1="80" x2="98" y2="118" />
        <line className="ef-beam" x1="102" y1="72" x2="134" y2="112" />
      </g>

      {/* ---- Sólarsella ---- */}
      <g>
        <line x1="60" y1="182" x2="60" y2="200" stroke="#ffffff" strokeOpacity=".35" strokeWidth="3" />
        <line x1="150" y1="168" x2="150" y2="200" stroke="#ffffff" strokeOpacity=".35" strokeWidth="3" />
        <polygon points="30,125 170,105 172,165 32,185" fill="url(#ef-panel)" stroke="#6dbbe7" strokeOpacity=".8" strokeWidth="2" strokeLinejoin="round" />
        <g clipPath="url(#ef-panel-clip)" stroke="#a3d3f0" strokeOpacity=".35" strokeWidth="1">
          <line x1="31" y1="145" x2="171" y2="125" />
          <line x1="31" y1="165" x2="171" y2="145" />
          <line x1="65" y1="100" x2="67" y2="190" />
          <line x1="100" y1="100" x2="102" y2="190" />
          <line x1="135" y1="100" x2="137" y2="190" />
        </g>
      </g>
      <Readout x={40} y={204} w={120} label="Sól" value={kw(s.solar)} />

      {/* ---- Vindmylla ---- */}
      <g>
        <path d="M466 180 L470 78 L474 180 Z" fill="#ffffff" fillOpacity=".85" />
        <line x1="452" y1="182" x2="488" y2="182" stroke="#ffffff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
        <rect x="462" y="72" width="22" height="12" rx="4" fill="#ffffff" fillOpacity=".9" />
        <g className="ef-blades" fill="#ffffff" fillOpacity=".95">
          {[0, 120, 240].map((a) => (
            <path key={a} transform={`rotate(${a} 470 78)`} d="M470 78 C 461 62, 462 36, 469 12 C 471 10, 473 12, 473 16 C 476 40, 476 62, 470 78 Z" />
          ))}
          <circle cx="470" cy="78" r="6" fill="#0b1d30" stroke="#ffffff" strokeWidth="2.5" />
        </g>
      </g>
      <Readout x={470} y={120} w={118} label="Vindur" value={kw(s.wind)} />

      {/* ---- Kaplar ---- */}
      <g strokeLinecap="round" fill="none">
        {Object.values(CABLES).map((d) => (
          <path key={d} d={d} stroke="#ffffff" strokeOpacity=".16" strokeWidth="4" />
        ))}
        {Object.values(CABLES).map((d) => (
          <path key={d} className="ef-flow" d={d} stroke="#20cae1" strokeOpacity=".9" strokeWidth="2" />
        ))}
      </g>
      <g fill="#7ee8f5" filter="url(#ef-glow)">
        {(["panel", "wind", "house", "car"] as const).map((k) => (
          <g key={k}>
            <circle className={`ef-dot ef-dot-${k}`} r="3.5" />
            <circle className={`ef-dot ef-dot-${k} ef-d2`} r="3.5" />
            <circle className={`ef-dot ef-dot-${k} ef-d3`} r="3.5" />
          </g>
        ))}
      </g>

      {/* ---- Rafgeymir ---- */}
      <g>
        <circle className="ef-ring" cx="300" cy="234" r="66" stroke="#20cae1" strokeWidth="1.5" />
        <rect x="290" y="160" width="20" height="12" rx="3" fill="#ffffff" fillOpacity=".5" />
        <rect x="270" y="170" width="60" height="126" rx="10" fill="#0b1d30" fillOpacity=".92" stroke="#ffffff" strokeOpacity=".65" strokeWidth="2.5" />
        <rect className="ef-fill" x="277" y={288 - fillH} width="46" height={fillH} rx="5" fill="url(#ef-cellfill)" />
        {/* Sellu-skil */}
        <g stroke="#0b1d30" strokeWidth="3">
          <line x1="277" y1="207" x2="323" y2="207" />
          <line x1="277" y1="234" x2="323" y2="234" />
          <line x1="277" y1="261" x2="323" y2="261" />
        </g>
        <path className="ef-bolt" d="M304 208 L292 236 L301 236 L297 258 L311 226 L302 226 Z" fill="#ffffff" filter="url(#ef-glow)" />
        <text
          x="300"
          y="316"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="16"
          fontWeight="700"
          fontFamily="var(--font-sora), var(--font-inter), system-ui, sans-serif"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {pct(s.battery)}
        </text>
        <text x="300" y="330" textAnchor="middle" fill="#ffffff" fillOpacity=".5" fontSize="9" letterSpacing=".12em" fontFamily="var(--font-inter), system-ui, sans-serif">
          RAFGEYMIR
        </text>
      </g>

      {/* ---- Hús ---- */}
      <g>
        <ellipse className="ef-light" cx="116" cy="380" rx="100" ry="50" fill="url(#ef-window-glow)" />
        <rect x="44" y="330" width="144" height="102" fill="#0b1d30" fillOpacity=".92" stroke="#ffffff" strokeOpacity=".65" strokeWidth="2.5" />
        <polygon points="30,332 116,262 202,332" fill="#102a44" stroke="#ffffff" strokeOpacity=".7" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="134,284 172,314 152,314 120,287" fill="#123f6b" stroke="#6dbbe7" strokeOpacity=".7" strokeWidth="1.5" />
        <rect x="102" y="386" width="28" height="46" rx="2" fill="#071423" stroke="#ffffff" strokeOpacity=".4" strokeWidth="1.5" />
        <rect x="58" y="350" width="26" height="22" rx="2" fill="#071423" stroke="#ffffff" strokeOpacity=".4" strokeWidth="1.5" />
        <rect x="148" y="350" width="26" height="22" rx="2" fill="#071423" stroke="#ffffff" strokeOpacity=".4" strokeWidth="1.5" />
        <g className="ef-light" fill="#ffd66b" filter="url(#ef-glow)">
          <rect x="60" y="352" width="22" height="18" rx="1.5" />
          <rect x="150" y="352" width="22" height="18" rx="1.5" />
          <rect x="108" y="396" width="16" height="8" rx="1" fillOpacity=".7" />
        </g>
        <rect x="160" y="272" width="12" height="26" fill="#102a44" stroke="#ffffff" strokeOpacity=".5" strokeWidth="1.5" />
      </g>
      <Readout x={16} y={296} w={118} label="Hús" value={kw(s.house)} />

      {/* ---- Rafbíll ---- */}
      <g>
        <ellipse className="ef-carglow" cx="490" cy="404" rx="90" ry="34" fill="url(#ef-car-glow)" />
        {/* yfirbygging */}
        <path
          d="M418 414 L418 396 Q 420 386 432 384 L452 382 L472 360 Q 476 356 484 356 L536 356 Q 544 356 548 362 L564 384 L576 386 Q 586 388 586 398 L586 414 Z"
          fill="url(#ef-car)"
          stroke="#ffffff"
          strokeOpacity=".7"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* rúður */}
        <path d="M480 362 L538 362 L556 384 L470 384 Z" fill="#4bd8ec" fillOpacity=".18" stroke="#7ee8f5" strokeOpacity=".5" strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="512" y1="362" x2="512" y2="384" stroke="#7ee8f5" strokeOpacity=".4" strokeWidth="1.5" />
        {/* hjól */}
        <circle cx="452" cy="414" r="14" fill="#071423" stroke="#ffffff" strokeOpacity=".7" strokeWidth="2.5" />
        <circle cx="452" cy="414" r="5" fill="#ffffff" fillOpacity=".5" />
        <circle cx="552" cy="414" r="14" fill="#071423" stroke="#ffffff" strokeOpacity=".7" strokeWidth="2.5" />
        <circle cx="552" cy="414" r="5" fill="#ffffff" fillOpacity=".5" />
        {/* ljós */}
        <rect x="574" y="392" width="8" height="5" rx="2" fill="#ffd66b" filter="url(#ef-glow)" />
        {/* hleðslutengi */}
        <circle cx="416" cy="394" r="5" fill="#071423" stroke={carColor} strokeWidth="2" />
        <circle cx="416" cy="394" r="1.8" fill={carColor} className={s.carCharging ? "ef-bolt" : ""} />
      </g>
      <Readout
        x={424}
        y={322}
        w={160}
        label={s.carCharging ? "Rafbíll · 7,2 kW" : "Rafbíll"}
        value={s.carCharging ? pct(s.carPct) : "Fullhlaðinn ✓"}
        accent
      />
    </svg>
  );
}
