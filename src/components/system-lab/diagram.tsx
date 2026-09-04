"use client";

/**
 * Skýringarmynd af ótengdu orkukerfi sem hreyfist með hermanum.
 *
 * Öll hreyfing (spaðar, geislar, orkupunktar á köplum, norðurljós, snjór) er CSS.
 * Tölurnar koma frá hermi í src/lib/system-lab.ts og eru millireiknaðar milli
 * klukkustunda svo dagurinn líði mjúklega þegar spilað er.
 */

export interface LiveState {
  /** Klukkan, 0–24 með aukastöfum */
  hour: number;
  solar: number;
  wind: number;
  house: number;
  ev: number;
  /** + inn á rafgeymi, − út af honum */
  battery: number;
  soc: number;
  gen: number;
  grid: number;
  curtailed: number;
  deficit: number;
  windSpeed: number;
  temp: number;
}

export type NodeId =
  | "sol"
  | "sellur"
  | "mppt"
  | "mylla"
  | "vindstyring"
  | "dc"
  | "rafgeymir"
  | "multiplus"
  | "actafla"
  | "cerbo"
  | "hus"
  | "rafbill"
  | "varaafl";

export interface DiagramConfig {
  kwp: number;
  tilt: number;
  turbineKw: number;
  turbines: number;
  batteryKwh: number;
  inverterLabel: string;
  inverterKw: number;
  evEnabled: boolean;
  generator: boolean;
  grid: boolean;
  sunrise: number;
  sunset: number;
  /** Sólskinsstuðull notandans, 0,1–1,3 */
  sunFactor: number;
  /** Nafn staðar fyrir merkingu */
  siteName: string;
  monthName: string;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** Námundun í 2 aukastafi – hornaföll skila ekki sama bita á Node og í vafra. */
const r2 = (v: number) => Math.round(v * 100) / 100;
const nf1 = (v: number) => v.toFixed(1).replace(".", ",");
const kw = (v: number) => `${nf1(v)} kW`;

// ---------- Kaplar ----------

const EDGES = {
  sellur: "M420 400 C 442 394, 452 336, 462 274",
  vind: "M204 506 C 250 546, 320 552, 392 550 C 424 549, 434 512, 440 470 C 445 424, 448 376, 452 338",
  mppt: "M523 302 L523 326",
  batt: "M608 344 L608 470",
  inv: "M523 344 L523 364",
  ac: "M588 407 L628 407",
  hus: "M752 392 C 800 392, 812 380, 858 372",
  bill: "M752 424 C 796 452, 800 476, 800 512",
  varaafl: "M398 508 C 424 506, 438 460, 452 420 L458 412",
} as const;

type EdgeId = keyof typeof EDGES;

// ---------- Smáhlutir ----------

function Pill({
  x,
  y,
  label,
  value,
  w = 128,
  tone = "dark",
}: {
  x: number;
  y: number;
  label: string;
  value: string;
  w?: number;
  tone?: "dark" | "brand" | "warn" | "muted";
}) {
  const fills = {
    dark: { bg: "#04101d", stroke: "#ffffff", so: 0.2, value: "#7ee8f5" },
    brand: { bg: "#1288ca", stroke: "#7ee8f5", so: 0.75, value: "#ffffff" },
    warn: { bg: "#3a1d05", stroke: "#f59e0b", so: 0.7, value: "#fbbf24" },
    muted: { bg: "#04101d", stroke: "#ffffff", so: 0.1, value: "#ffffff" },
  }[tone];
  return (
    <g transform={`translate(${x} ${y})`} className="sl-pill">
      <rect
        width={w}
        height="24"
        rx="12"
        fill={fills.bg}
        fillOpacity={tone === "brand" ? 0.95 : 0.85}
        stroke={fills.stroke}
        strokeOpacity={fills.so}
      />
      <text x="11" y="16" fill="#ffffff" fillOpacity=".55" fontSize="9" letterSpacing=".08em">
        {label.toUpperCase()}
      </text>
      <text
        x={w - 11}
        y="16.5"
        textAnchor="end"
        fill={fills.value}
        fillOpacity={tone === "muted" ? 0.45 : 1}
        fontSize="12"
        fontWeight="700"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </text>
    </g>
  );
}

function Box({
  id,
  x,
  y,
  w,
  h,
  title,
  sub,
  selected,
  onSelect,
  active = true,
  children,
}: {
  id: NodeId;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  selected: NodeId | null;
  onSelect: (id: NodeId) => void;
  active?: boolean;
  children?: React.ReactNode;
}) {
  const on = selected === id;
  return (
    <g
      className="sl-node"
      role="button"
      tabIndex={0}
      aria-label={`${title}${sub ? ` – ${sub}` : ""}`}
      aria-pressed={on}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="12"
        fill={on ? "#0d2b45" : "#0a1e33"}
        fillOpacity={active ? 0.95 : 0.6}
        stroke={on ? "#4bd8ec" : "#ffffff"}
        strokeOpacity={on ? 0.9 : 0.22}
        strokeWidth={on ? 2 : 1.5}
      />
      {on && (
        <rect
          x={x - 4}
          y={y - 4}
          width={w + 8}
          height={h + 8}
          rx="16"
          fill="none"
          stroke="#4bd8ec"
          strokeOpacity=".35"
        />
      )}
      <text
        x={x + w / 2}
        y={y + 20}
        textAnchor="middle"
        fill="#ffffff"
        fillOpacity={active ? 0.92 : 0.5}
        fontSize="12"
        fontWeight="600"
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + 34}
          textAnchor="middle"
          fill="#7ee8f5"
          fillOpacity={active ? 0.75 : 0.35}
          fontSize="9.5"
          letterSpacing=".04em"
        >
          {sub}
        </text>
      )}
      {children}
    </g>
  );
}

function Flow({
  id,
  power,
  reverse = false,
  color = "#20cae1",
}: {
  id: EdgeId;
  power: number;
  reverse?: boolean;
  color?: string;
}) {
  const on = power > 0.015;
  const dur = clamp(3.4 / (0.35 + power * 0.75), 0.55, 6);
  return (
    <g>
      <path d={EDGES[id]} stroke="#ffffff" strokeOpacity=".14" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path
        d={EDGES[id]}
        stroke={color}
        strokeOpacity={on ? 0.5 : 0.08}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="sl-cable"
      />
      {on && (
        <g fill={color} className={reverse ? "sl-rev" : undefined}>
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              r="3.6"
              className={`sl-dot sl-dot-${id}`}
              style={{
                animationDuration: `${dur}s`,
                animationDelay: `${-(dur * i) / 3}s`,
              }}
            />
          ))}
        </g>
      )}
    </g>
  );
}

// ---------- Myndin ----------

export function SystemDiagram({
  live,
  config,
  selected,
  onSelect,
}: {
  live: LiveState;
  config: DiagramConfig;
  selected: NodeId | null;
  onSelect: (id: NodeId) => void;
}) {
  const { sunrise, sunset } = config;
  const dayLen = Math.max(0.5, sunset - sunrise);
  const frac = (live.hour - sunrise) / dayLen;
  const isDay = frac >= 0 && frac <= 1;
  const ang = Math.PI * (1 - clamp(frac, 0, 1));
  const sunX = r2(560 + 330 * Math.cos(ang));
  const sunY = r2(626 - 486 * Math.sin(ang));
  // Nóttin: tungl á spegluðum ferli
  const nightFrac = live.hour < sunrise ? (live.hour + 24 - sunset) / (24 - dayLen) : (live.hour - sunset) / (24 - dayLen);
  const moonAng = Math.PI * (1 - clamp(nightFrac, 0, 1));
  const moonX = r2(560 + 330 * Math.cos(moonAng));
  const moonY = r2(600 - 400 * Math.sin(moonAng));

  const darkness = isDay ? r2(clamp(1 - Math.sin(Math.PI * clamp(frac, 0, 1)) * 1.6, 0, 1)) : 1;
  const snowing = live.temp < 0.5;
  const bladeDur = live.windSpeed > 3 ? clamp(14 / live.windSpeed, 0.35, 5) : 0;
  const socFill = clamp(live.soc / 100, 0, 1);
  const charging = live.battery > 0.01;
  const discharging = live.battery < -0.01;
  const lightsOn = darkness > 0.35;
  const gridIn = live.grid > 0.01;
  const gridOut = live.grid < -0.01;
  const varaaflOn = live.gen > 0.01 || gridIn;
  const varaaflLabel = config.generator ? "Rafstöð" : config.grid ? "Netið" : "Ekkert varaafl";
  const varaaflSub = config.generator
    ? varaaflOn
      ? "í gangi"
      : "í bið"
    : config.grid
      ? gridIn
        ? "tekur af neti"
        : gridOut
          ? "selur á net"
          : "tengt"
      : "kerfið stendur eitt";

  return (
    <svg
      viewBox="0 0 1100 596"
      className="sl-svg w-full"
      role="img"
      aria-label={`Skýringarmynd: ${config.siteName} í ${config.monthName.toLowerCase()} kl. ${String(Math.floor(live.hour)).padStart(2, "0")}. Sól ${kw(live.solar)}, vindur ${kw(live.wind)}, notkun ${kw(live.house + live.ev)}, hleðslustaða ${Math.round(live.soc)} prósent.`}
      fill="none"
    >
      <style>{`
        .sl-svg text { font-family: var(--font-inter), system-ui, sans-serif; }
        .sl-node { cursor: pointer; }
        .sl-node rect { transition: fill .25s ease, stroke-opacity .25s ease; }
        .sl-node:hover rect:first-of-type { stroke-opacity: .6; }
        .sl-node:focus-visible { outline: none; }
        .sl-node:focus-visible rect:first-of-type { stroke: #4bd8ec; stroke-opacity: 1; }
        .sl-dot { animation-name: sl-travel; animation-timing-function: linear; animation-iteration-count: infinite; }
        .sl-rev .sl-dot { animation-direction: reverse; }
        ${(Object.keys(EDGES) as EdgeId[]).map((k) => `.sl-dot-${k} { offset-path: path("${EDGES[k]}"); }`).join("\n        ")}
        @keyframes sl-travel { 0% { offset-distance: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
        .sl-blades { transform-box: fill-box; transform-origin: center; animation: sl-spin linear infinite; }
        @keyframes sl-spin { to { transform: rotate(360deg); } }
        .sl-rays { transform-box: fill-box; transform-origin: center; animation: sl-spin 60s linear infinite; }
        .sl-aurora { animation: sl-aurora 9s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .sl-aurora-2 { animation-delay: -4s; }
        @keyframes sl-aurora { 0%,100% { transform: translateX(-14px) scaleY(.9); opacity: .5; } 50% { transform: translateX(18px) scaleY(1.15); opacity: .9; } }
        .sl-snow { animation: sl-snow linear infinite; }
        @keyframes sl-snow { 0% { transform: translate(0,-40px); opacity: 0; } 10% { opacity: .9; } 100% { transform: translate(26px, 320px); opacity: 0; } }
        .sl-fill { transition: y .5s ease, height .5s ease; }
        .sl-pulse { animation: sl-pulse 1.8s ease-in-out infinite; }
        @keyframes sl-pulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
        .sl-comm { stroke-dasharray: 2 6; animation: sl-comm 3s linear infinite; }
        @keyframes sl-comm { to { stroke-dashoffset: -32; } }
        .sl-sky, .sl-glow { transition: opacity .5s ease; }
        @media (prefers-reduced-motion: reduce) {
          .sl-svg * { animation: none !important; }
        }
      `}</style>

      <defs>
        <linearGradient id="sl-sky-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123f6b" />
          <stop offset="1" stopColor="#1f6f9e" stopOpacity=".55" />
        </linearGradient>
        <linearGradient id="sl-sky-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#03080f" />
          <stop offset="1" stopColor="#071423" />
        </linearGradient>
        <radialGradient id="sl-sun-halo">
          <stop offset="0" stopColor="#ffd66b" stopOpacity=".95" />
          <stop offset=".5" stopColor="#ffb54a" stopOpacity=".3" />
          <stop offset="1" stopColor="#ffb54a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sl-sun" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="1" stopColor="#ffb54a" />
        </linearGradient>
        <linearGradient id="sl-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#164e80" />
          <stop offset="1" stopColor="#0a2440" />
        </linearGradient>
        <linearGradient id="sl-batt" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1288ca" />
          <stop offset="1" stopColor="#4bd8ec" />
        </linearGradient>
        <linearGradient id="sl-aurora-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4bd8ec" stopOpacity="0" />
          <stop offset=".45" stopColor="#5ef2b8" stopOpacity=".38" />
          <stop offset="1" stopColor="#5ef2b8" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="sl-window">
          <stop offset="0" stopColor="#ffd66b" stopOpacity=".45" />
          <stop offset="1" stopColor="#ffd66b" stopOpacity="0" />
        </radialGradient>
        <filter id="sl-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="sl-panel-clip">
          <polygon points="252,404 418,372 424,432 258,464" />
        </clipPath>
        <clipPath id="sl-sky-clip">
          <rect x="0" y="0" width="1100" height="558" />
        </clipPath>
      </defs>

      {/* ---------- Himinn ---------- */}
      <g clipPath="url(#sl-sky-clip)">
        <rect width="1100" height="558" fill="url(#sl-sky-night)" />
        <rect className="sl-sky" width="1100" height="558" fill="url(#sl-sky-day)" opacity={1 - darkness} />

        {/* Norðurljós og stjörnur á dimmum tímum */}
        <g opacity={r2(darkness * 0.75)}>
          {[0, 1].map((i) => (
            <path
              key={i}
              className={`sl-aurora${i ? " sl-aurora-2" : ""}`}
              d={i ? "M40 120 C 260 60, 520 150, 880 70 L880 130 C 520 210, 260 120, 40 180 Z" : "M0 170 C 240 110, 560 200, 1020 120 L1020 190 C 560 270, 240 180, 0 240 Z"}
              fill="url(#sl-aurora-grad)"
            />
          ))}
          <g fill="#ffffff">
            {[[90, 70], [220, 120], [380, 60], [610, 96], [700, 44], [880, 140], [990, 80], [1050, 190], [520, 40], [150, 200]].map(
              ([sx, sy], i) => (
                <circle key={i} cx={sx} cy={sy} r={i % 3 ? 1.4 : 2} opacity={0.5 + (i % 4) * 0.12} />
              ),
            )}
          </g>
        </g>

        {/* Tungl */}
        {!isDay && (
          <g opacity={darkness}>
            <circle cx={moonX} cy={moonY} r="30" fill="#ffffff" fillOpacity=".08" />
            <circle cx={moonX} cy={moonY} r="15" fill="#e8f4ff" fillOpacity=".85" />
            <circle cx={moonX + 6} cy={moonY - 4} r="13" fill="#071423" fillOpacity=".9" />
          </g>
        )}

        {/* Sól */}
        {isDay && (
          <g opacity={clamp(1 - darkness * 0.7, 0.15, 1)}>
            <circle className="sl-glow" cx={sunX} cy={sunY} r="70" fill="url(#sl-sun-halo)" opacity={r2(clamp(0.3 + 0.7 * config.sunFactor, 0.2, 1))} />
            <g className="sl-rays" stroke="#ffd66b" strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round">
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i * Math.PI) / 6;
                const rr = i % 2 ? 36 : 44;
                return (
                  <line
                    key={i}
                    x1={r2(sunX + Math.cos(a) * 30)}
                    y1={r2(sunY + Math.sin(a) * 30)}
                    x2={r2(sunX + Math.cos(a) * rr)}
                    y2={r2(sunY + Math.sin(a) * rr)}
                  />
                );
              })}
            </g>
            <circle cx={sunX} cy={sunY} r="21" fill="url(#sl-sun)" filter="url(#sl-glow)" />
            <circle
              className="sl-node"
              cx={sunX}
              cy={sunY}
              r="34"
              fill="transparent"
              role="button"
              tabIndex={0}
              aria-label="Sólin"
              onClick={() => onSelect("sol")}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect("sol")}
            />
          </g>
        )}

        {/* Ský – þéttast eftir því sem sólarstuðullinn lækkar */}
        <g opacity={r2(clamp(1.25 - config.sunFactor, 0, 1) * (isDay ? 0.85 : 0.3))} fill="#ffffff" fillOpacity=".16">
          <g>
            <ellipse cx="620" cy="118" rx="86" ry="30" />
            <ellipse cx="676" cy="106" rx="58" ry="26" />
            <ellipse cx="566" cy="106" rx="46" ry="22" />
          </g>
          <g opacity=".7">
            <ellipse cx="250" cy="180" rx="70" ry="24" />
            <ellipse cx="296" cy="170" rx="46" ry="20" />
          </g>
        </g>

        {/* Snjókoma þegar frost er */}
        {snowing && (
          <g fill="#ffffff" fillOpacity=".8">
            {Array.from({ length: 26 }, (_, i) => (
              <circle
                key={i}
                cx={30 + ((i * 71) % 1040)}
                cy={60 + ((i * 37) % 160)}
                r={i % 3 ? 2.1 : 3}
                className="sl-snow"
                style={{
                  animationDuration: `${6 + (i % 5) * 1.6}s`,
                  animationDelay: `${-(i % 7) * 1.3}s`,
                }}
              />
            ))}
          </g>
        )}
      </g>

      {/* Jörð */}
      <path d="M0 558 L1100 558" stroke="#ffffff" strokeOpacity=".18" strokeWidth="2" />
      <rect y="558" width="1100" height="38" fill="#04101d" fillOpacity=".85" />

      {/* ---------- Kaplar (undir hlutunum) ---------- */}
      <Flow id="sellur" power={live.solar} />
      <Flow id="vind" power={live.wind} />
      <Flow id="mppt" power={live.solar} />
      <Flow id="inv" power={live.house + live.ev} />
      <Flow id="ac" power={live.house + live.ev} />
      <Flow id="hus" power={live.house} />
      {config.evEnabled && <Flow id="bill" power={live.ev} />}
      <Flow id="batt" power={Math.abs(live.battery)} reverse={discharging} color={charging ? "#20cae1" : "#7ee8f5"} />
      {(config.generator || config.grid) && (
        <Flow
          id="varaafl"
          power={live.gen + Math.abs(live.grid)}
          reverse={gridOut}
          color={gridOut ? "#5ef2b8" : "#f59e0b"}
        />
      )}

      {/* ---------- Vindmylla ---------- */}
      <g opacity={config.turbineKw > 0 ? 1 : 0.28}>
        <path d="M134 520 L138 236 L142 236 L146 520 Z" fill="#ffffff" fillOpacity=".8" />
        <rect x="132" y="228" width="20" height="11" rx="4" fill="#ffffff" fillOpacity=".9" />
        <g
          className="sl-blades"
          style={bladeDur ? { animationDuration: `${bladeDur}s` } : { animation: "none" }}
          fill="#ffffff"
          fillOpacity=".95"
        >
          {[0, 120, 240].map((a) => (
            <path
              key={a}
              transform={`rotate(${a} 140 233)`}
              d="M140 233 C 130 214, 131 182, 139 152 C 141 149, 144 152, 144 157 C 147 186, 147 213, 140 233 Z"
            />
          ))}
          <circle cx="140" cy="233" r="6" fill="#071423" stroke="#ffffff" strokeWidth="2.5" />
        </g>
      </g>
      <g
        className="sl-node"
        role="button"
        tabIndex={0}
        aria-label="Vindmylla"
        onClick={() => onSelect("mylla")}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect("mylla")}
      >
        <rect x="52" y="286" width="176" height="52" rx="12" fill="transparent" />
        <Pill
          x={64}
          y={288}
          w={152}
          label={`Vindmylla${config.turbines > 1 ? ` ×${config.turbines}` : ""}`}
          value={config.turbineKw > 0 ? kw(live.wind) : "engin"}
          tone={live.wind > 0.02 ? "brand" : "muted"}
        />
        <Pill x={64} y={316} w={152} label="Vindhraði" value={`${nf1(live.windSpeed)} m/s`} />
      </g>

      {/* Vindstýring */}
      <Box id="vindstyring" x={72} y={466} w={132} h={52} title="Vindstýring" sub="+ álagsviðnám" selected={selected} onSelect={onSelect} active={config.turbineKw > 0} />

      {/* ---------- Sólarsellur ---------- */}
      <g>
        <line x1="272" y1="450" x2="268" y2="522" stroke="#ffffff" strokeOpacity=".4" strokeWidth="4" />
        <line x1="404" y1="424" x2="408" y2="522" stroke="#ffffff" strokeOpacity=".4" strokeWidth="4" />
        <polygon points="252,404 418,372 424,432 258,464" fill="url(#sl-panel)" stroke="#6dbbe7" strokeOpacity=".85" strokeWidth="2" strokeLinejoin="round" />
        <g clipPath="url(#sl-panel-clip)" stroke="#a3d3f0" strokeOpacity=".3" strokeWidth="1">
          <line x1="250" y1="424" x2="426" y2="392" />
          <line x1="250" y1="444" x2="426" y2="412" />
          <line x1="296" y1="360" x2="302" y2="474" />
          <line x1="338" y1="360" x2="344" y2="474" />
          <line x1="380" y1="360" x2="386" y2="474" />
        </g>
        {/* Glampi þegar sól skín á sellurnar */}
        <polygon
          points="252,404 418,372 424,432 258,464"
          fill="#ffd66b"
          opacity={r2(clamp(live.solar / Math.max(0.8, config.kwp * 0.7), 0, 1) * 0.22)}
        />
      </g>
      <g
        className="sl-node"
        role="button"
        tabIndex={0}
        aria-label="Sólarsellur"
        onClick={() => onSelect("sellur")}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect("sellur")}
      >
        <rect x="238" y="300" width="180" height="56" rx="12" fill="transparent" />
        <Pill x={246} y={302} w={164} label="Sólarsellur" value={kw(live.solar)} tone={live.solar > 0.02 ? "brand" : "muted"} />
        <Pill x={246} y={330} w={164} label={`${nf1(config.kwp)} kWp · ${config.tilt}°`} value={`${live.temp > 0 ? "+" : ""}${nf1(live.temp)} °C`} />
      </g>

      {/* ---------- Varaafl (rafstöð eða net) ---------- */}
      <Box
        id="varaafl"
        x={248}
        y={478}
        w={150}
        h={52}
        title={varaaflLabel}
        sub={varaaflSub}
        selected={selected}
        onSelect={onSelect}
        active={config.generator || config.grid}
      >
        {varaaflOn && <circle cx={386} cy={490} r="4" fill="#f59e0b" className="sl-pulse" filter="url(#sl-glow)" />}
      </Box>

      {/* ---------- Tæknirými ---------- */}
      <rect x="440" y="222" width="330" height="336" rx="18" fill="#061626" fillOpacity=".82" stroke="#ffffff" strokeOpacity=".12" />
      <text x="605" y="212" textAnchor="middle" fill="#7ee8f5" fillOpacity=".7" fontSize="10" letterSpacing=".18em">
        TÆKNIRÝMI
      </text>

      {/* MPPT */}
      <Box id="mppt" x={458} y={242} w={130} h={60} title="MPPT" sub="SmartSolar" selected={selected} onSelect={onSelect}>
        <rect x={470} y={282} width={106} height={10} rx="5" fill="#04101d" stroke="#ffffff" strokeOpacity=".2" />
        <rect
          x={471}
          y={283}
          width={clamp(live.solar / Math.max(0.5, config.kwp), 0, 1) * 104}
          height={8}
          rx="4"
          fill="#4bd8ec"
        />
      </Box>

      {/* Cerbo GX */}
      <Box id="cerbo" x={628} y={242} w={124} h={60} title="Cerbo GX" selected={selected} onSelect={onSelect}>
        <rect x={640} y={262} width={100} height={32} rx="5" fill="#04101d" stroke="#4bd8ec" strokeOpacity=".5" />
        <text x={648} y={276} fill="#7ee8f5" fontSize="9" style={{ fontVariantNumeric: "tabular-nums" }}>
          {`${Math.round(live.soc)} %`}
        </text>
        <text x={648} y={288} fill="#ffffff" fillOpacity=".6" fontSize="8.5" style={{ fontVariantNumeric: "tabular-nums" }}>
          {`${nf1(live.solar + live.wind)} kW inn`}
        </text>
        <circle cx={732} cy={270} r="3" fill="#5ef2b8" className="sl-pulse" />
        <text x={732} y={292} textAnchor="middle" fill="#ffffff" fillOpacity=".45" fontSize="8">
          VRM
        </text>
      </Box>

      {/* Samskiptalínur Cerbo → tæki */}
      <g stroke="#5ef2b8" strokeOpacity=".35" strokeWidth="1.2" className="sl-comm" fill="none">
        <path d="M628 272 L588 272" />
        <path d="M690 302 L690 320 L560 320 L560 364" />
        <path d="M752 272 C 786 272, 790 460, 758 500 L716 500" />
      </g>

      {/* DC dreifing */}
      <g
        className="sl-node"
        role="button"
        tabIndex={0}
        aria-label="DC dreifing"
        aria-pressed={selected === "dc"}
        onClick={() => onSelect("dc")}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect("dc")}
      >
        <rect
          x="452"
          y="326"
          width="306"
          height="18"
          rx="9"
          fill={selected === "dc" ? "#1288ca" : "#0d2b45"}
          fillOpacity=".9"
          stroke={selected === "dc" ? "#4bd8ec" : "#ffffff"}
          strokeOpacity={selected === "dc" ? 0.9 : 0.3}
        />
        <text x="466" y="339" fill="#ffffff" fillOpacity=".8" fontSize="10" letterSpacing=".08em">
          DC DREIFING · 48 V
        </text>
        <text x="744" y="339" textAnchor="end" fill="#7ee8f5" fontSize="10" style={{ fontVariantNumeric: "tabular-nums" }}>
          {`${nf1((live.solar + live.wind) * 1000 / 51.2)} A`}
        </text>
      </g>

      {/* MultiPlus */}
      <Box
        id="multiplus"
        x={458}
        y={364}
        w={130}
        h={86}
        title="MultiPlus-II"
        sub={config.inverterLabel.replace("MultiPlus-II ", "")}
        selected={selected}
        onSelect={onSelect}
      >
        <path
          d="M472 428 C 480 412, 488 444, 496 428 C 504 412, 512 444, 520 428"
          stroke="#4bd8ec"
          strokeOpacity={live.house + live.ev > 0.02 ? 0.95 : 0.3}
          strokeWidth="2"
          fill="none"
        />
        <text x={556} y={432} textAnchor="end" fill="#ffffff" fillOpacity=".7" fontSize="9.5" style={{ fontVariantNumeric: "tabular-nums" }}>
          {`${Math.round(((live.house + live.ev) / Math.max(0.1, config.inverterKw)) * 100)} %`}
        </text>
      </Box>

      {/* AC tafla */}
      <Box id="actafla" x={628} y={364} w={124} h={86} title="AC tafla" sub="230 V" selected={selected} onSelect={onSelect}>
        <g stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.5">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={644 + i * 22} y={400} width={13} height={30} rx="3" fill="#04101d" />
          ))}
        </g>
        <g fill="#5ef2b8">
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={648 + i * 22} y={406} width={5} height={8} rx="2" opacity={live.house + live.ev > 0.02 ? 0.9 : 0.25} />
          ))}
        </g>
      </Box>

      {/* Rafgeymir */}
      <Box
        id="rafgeymir"
        x={452}
        y={462}
        w={306}
        h={80}
        title={`Rafgeymar · ${Math.round(config.batteryKwh)} kWst`}
        selected={selected}
        onSelect={onSelect}
      >
        <rect x={466} y={494} width={278} height={34} rx="6" fill="#04101d" stroke="#ffffff" strokeOpacity=".25" />
        <rect className="sl-fill" x={468} y={496} width={r2(socFill * 274)} height={30} rx="5" fill="url(#sl-batt)" />
        <g stroke="#061626" strokeWidth="2.5" opacity=".7">
          {[1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1={r2(466 + (278 / 6) * i)} y1={494} x2={r2(466 + (278 / 6) * i)} y2={528} />
          ))}
        </g>
        <text x={605} y={517} textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700" style={{ fontVariantNumeric: "tabular-nums" }}>
          {`${Math.round(live.soc)} %`}
        </text>
        <text x={744} y={482} textAnchor="end" fill={charging ? "#5ef2b8" : discharging ? "#fbbf24" : "#ffffff"} fillOpacity=".9" fontSize="10.5" fontWeight="600" style={{ fontVariantNumeric: "tabular-nums" }}>
          {charging ? `+${nf1(live.battery)} kW` : discharging ? `−${nf1(-live.battery)} kW` : "í hvíld"}
        </text>
        <text x={466} y={482} fill="#ffffff" fillOpacity=".45" fontSize="9.5" letterSpacing=".06em">
          {charging ? "HLEÐST" : discharging ? "AFHLEÐST" : "BIÐSTAÐA"}
        </text>
      </Box>

      {/* ---------- Hús ---------- */}
      <g>
        <ellipse cx="920" cy="470" rx="130" ry="70" fill="url(#sl-window)" opacity={lightsOn ? 0.9 : 0.15} className="sl-glow" />
        <polygon points="836,368 920,300 1004,368" fill="#102a44" stroke="#ffffff" strokeOpacity=".6" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="856" y="366" width="128" height="192" fill="#0b1d30" fillOpacity=".95" stroke="#ffffff" strokeOpacity=".55" strokeWidth="2.5" />
        <g fill={lightsOn ? "#ffd66b" : "#123f6b"} opacity={lightsOn ? 0.95 : 0.7}>
          <rect x="874" y="390" width="30" height="26" rx="2" />
          <rect x="936" y="390" width="30" height="26" rx="2" />
          <rect x="874" y="440" width="30" height="26" rx="2" />
        </g>
        <rect x="932" y="440" width="36" height="60" rx="2" fill="#04101d" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.5" />
        {/* hleðslustöð á vegg */}
        {config.evEnabled && (
          <g>
            <rect x="838" y="424" width="18" height="30" rx="4" fill="#0d2b45" stroke="#4bd8ec" strokeOpacity=".7" strokeWidth="1.5" />
            <circle cx="847" cy="439" r="3" fill={live.ev > 0.02 ? "#5ef2b8" : "#4bd8ec"} className={live.ev > 0.02 ? "sl-pulse" : undefined} />
          </g>
        )}
      </g>
      <g
        className="sl-node"
        role="button"
        tabIndex={0}
        aria-label="Hús"
        onClick={() => onSelect("hus")}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect("hus")}
      >
        <rect x="800" y="236" width="180" height="56" rx="12" fill="transparent" />
        <Pill x={812} y={238} w={164} label="Notkun húss" value={kw(live.house)} tone={live.house > 0.02 ? "brand" : "muted"} />
        <Pill x={812} y={266} w={164} label="Klukkan" value={`${String(Math.floor(live.hour) % 24).padStart(2, "0")}:${String(Math.floor((live.hour % 1) * 60)).padStart(2, "0")}`} />
      </g>

      {/* ---------- Rafbíll ---------- */}
      {config.evEnabled && (
        <g>
          <path
            d="M792 552 L792 532 Q 794 521 806 519 L828 517 L850 494 Q 855 489 864 489 L916 489 Q 925 489 930 496 L946 517 L958 519 Q 968 521 968 532 L968 552 Z"
            fill="#0b1d30"
            stroke="#ffffff"
            strokeOpacity=".65"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M860 495 L914 495 L932 517 L846 517 Z" fill="#4bd8ec" fillOpacity=".18" stroke="#7ee8f5" strokeOpacity=".45" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="826" cy="552" r="13" fill="#04101d" stroke="#ffffff" strokeOpacity=".65" strokeWidth="2.5" />
          <circle cx="934" cy="552" r="13" fill="#04101d" stroke="#ffffff" strokeOpacity=".65" strokeWidth="2.5" />
          <circle cx="796" cy="524" r="4.5" fill="#04101d" stroke={live.ev > 0.02 ? "#5ef2b8" : "#4bd8ec"} strokeWidth="2" />
        </g>
      )}
      {config.evEnabled && (
        <g
          className="sl-node"
          role="button"
          tabIndex={0}
          aria-label="Rafbíll"
          onClick={() => onSelect("rafbill")}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect("rafbill")}
        >
          <rect x="800" y="440" width="180" height="28" rx="12" fill="transparent" />
          <Pill
            x={812}
            y={444}
            w={164}
            label="Rafbíll"
            value={live.ev > 0.02 ? kw(live.ev) : "bíður"}
            tone={live.ev > 0.02 ? "brand" : "muted"}
          />
        </g>
      )}

      {/* ---------- Viðvaranir ---------- */}
      {live.deficit > 0.02 && (
        <g>
          <rect x="440" y="176" width="330" height="26" rx="13" fill="#3a1d05" stroke="#f59e0b" strokeOpacity=".8" />
          <text x="605" y="193" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="600">
            {`Orku vantar – ${kw(live.deficit)} skerðast`}
          </text>
        </g>
      )}
      {live.curtailed > 0.02 && live.deficit <= 0.02 && (
        <g>
          <rect x="440" y="176" width="330" height="26" rx="13" fill="#04101d" stroke="#5ef2b8" strokeOpacity=".5" />
          <text x="605" y="193" textAnchor="middle" fill="#5ef2b8" fontSize="11" fontWeight="600">
            {`Rafgeymir fullur – ${kw(live.curtailed)} fara til spillis`}
          </text>
        </g>
      )}
    </svg>
  );
}
