"use client";

/**
 * Skýringarmynd af ótengdu orkukerfi.
 *
 * Uppsetningin er einfalt flæði frá vinstri til hægri í þremur hlutum:
 * FRAMLEIÐSLA (sól og vindur) → GEYMSLA OG BREYTING (DC-teinn, rafgeymir,
 * MultiPlus, Cerbo) → NOTKUN (hús og rafbíll). Kaplarnir eru hornréttir svo
 * auðvelt sé að rekja hvert orkan fer; punktarnir á þeim sýna flæðið.
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
  | "cerbo"
  | "hus"
  | "rafbill"
  | "varaafl";

export interface DiagramConfig {
  kwp: number;
  batteryKwh: number;
  inverterLabel: string;
  inverterKw: number;
  turbineKw: number;
  evEnabled: boolean;
  generator: boolean;
  sunrise: number;
  sunset: number;
  sunFactor: number;
  siteName: string;
  monthName: string;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** Námundun – hornaföll skila ekki sama bita á Node og í vafra (hydration). */
const r2 = (v: number) => Math.round(v * 100) / 100;
const nf1 = (v: number) => v.toFixed(1).replace(".", ",");
const kw = (v: number) => `${nf1(v)} kW`;

// ---------- Kaplar: hornréttir, á föstum rásum ----------

const EDGES = {
  sellur: "M196 179 H240",
  mylla: "M122 359 H240",
  mppt: "M390 179 H430 V250 H470",
  vind: "M390 359 H430 V250 H470",
  batt: "M580 259 V320",
  inv: "M690 250 H700",
  varaafl: "M780 380 V310",
  ac: "M860 250 H900",
  hus: "M900 250 V170 H944",
  bill: "M900 250 V366 H926",
} as const;

type EdgeId = keyof typeof EDGES;

// ---------- Smáhlutir ----------

function Pill({
  x,
  y,
  label,
  value,
  w = 150,
  active = true,
}: {
  x: number;
  y: number;
  label: string;
  value: string;
  w?: number;
  active?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width={w}
        height="26"
        rx="13"
        fill={active ? "#1288ca" : "#04101d"}
        fillOpacity={active ? 0.95 : 0.85}
        stroke={active ? "#7ee8f5" : "#ffffff"}
        strokeOpacity={active ? 0.7 : 0.15}
      />
      <text x="12" y="17" fill="#ffffff" fillOpacity={active ? 0.7 : 0.5} fontSize="9.5" letterSpacing=".08em">
        {label.toUpperCase()}
      </text>
      <text
        x={w - 12}
        y="17.5"
        textAnchor="end"
        fill="#ffffff"
        fillOpacity={active ? 1 : 0.45}
        fontSize="12.5"
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
        rx="14"
        fill={on ? "#0d2b45" : "#0a1e33"}
        fillOpacity={active ? 0.95 : 0.55}
        stroke={on ? "#4bd8ec" : "#ffffff"}
        strokeOpacity={on ? 0.9 : 0.2}
        strokeWidth={on ? 2 : 1.5}
      />
      <text
        x={x + w / 2}
        y={y + 22}
        textAnchor="middle"
        fill="#ffffff"
        fillOpacity={active ? 0.95 : 0.5}
        fontSize="13"
        fontWeight="600"
      >
        {title}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 37} textAnchor="middle" fill="#7ee8f5" fillOpacity={active ? 0.7 : 0.3} fontSize="10">
          {sub}
        </text>
      )}
      {children}
    </g>
  );
}

/** Smellisvæði utan um teiknaða hluti (sól, sellur, myllu, hús, bíl). */
function Hit({
  id,
  x,
  y,
  w,
  h,
  label,
  selected,
  onSelect,
  children,
}: {
  id: NodeId;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  selected: NodeId | null;
  onSelect: (id: NodeId) => void;
  children: React.ReactNode;
}) {
  return (
    <g
      className="sl-node"
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected === id}
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
        rx="16"
        fill={selected === id ? "#4bd8ec" : "transparent"}
        fillOpacity={selected === id ? 0.08 : 0}
        stroke="#4bd8ec"
        strokeOpacity={selected === id ? 0.5 : 0}
      />
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
  const dur = clamp(3.2 / (0.35 + power * 0.7), 0.6, 6);
  return (
    <g>
      <path
        d={EDGES[id]}
        stroke="#ffffff"
        strokeOpacity=".13"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d={EDGES[id]}
        stroke={color}
        strokeOpacity={on ? 0.45 : 0.07}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {on && (
        <g fill={color} className={reverse ? "sl-rev" : undefined}>
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              r="3.6"
              className={`sl-dot sl-dot-${id}`}
              style={{ animationDuration: `${dur}s`, animationDelay: `${-(dur * i) / 3}s` }}
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
  const elevation = isDay ? r2(Math.sin(Math.PI * clamp(frac, 0, 1))) : 0;
  const darkness = r2(clamp(1 - elevation * 1.7, 0, 1));

  const socFill = clamp(live.soc / 100, 0, 1);
  const charging = live.battery > 0.01;
  const discharging = live.battery < -0.01;
  const full = live.soc > 99.4 && !discharging;
  const lightsOn = darkness > 0.35;
  const load = live.house + live.ev;
  const backupOn = live.gen > 0.01;
  const clock = `${String(Math.floor(live.hour) % 24).padStart(2, "0")}:${String(
    Math.floor((live.hour % 1) * 60),
  ).padStart(2, "0")}`;

  return (
    <svg
      viewBox="0 0 1080 500"
      className="sl-svg w-full"
      role="img"
      aria-label={`Skýringarmynd: ${config.siteName} í ${config.monthName.toLowerCase()} kl. ${clock}. Sól ${kw(live.solar)}, vindur ${kw(live.wind)}, notkun ${kw(load)}, hleðslustaða ${Math.round(live.soc)} prósent.`}
      fill="none"
    >
      <style>{`
        .sl-svg text { font-family: var(--font-inter), system-ui, sans-serif; }
        .sl-node { cursor: pointer; }
        .sl-node > rect:first-of-type { transition: stroke-opacity .25s ease; }
        .sl-node:hover > rect:first-of-type { stroke-opacity: .55; }
        .sl-node:focus-visible { outline: none; }
        .sl-node:focus-visible > rect:first-of-type { stroke: #4bd8ec; stroke-opacity: 1; }
        .sl-dot { animation-name: sl-travel; animation-timing-function: linear; animation-iteration-count: infinite; }
        .sl-rev .sl-dot { animation-direction: reverse; }
        ${(Object.keys(EDGES) as EdgeId[]).map((k) => `.sl-dot-${k} { offset-path: path("${EDGES[k]}"); }`).join("\n        ")}
        @keyframes sl-travel { 0% { offset-distance: 0%; opacity: 0; } 12% { opacity: 1; } 88% { opacity: 1; } 100% { offset-distance: 100%; opacity: 0; } }
        /* Snúningsásinn er nafið sjálft, gefið í hnitum myndarinnar */
        .sl-blades { transform-box: view-box; transform-origin: 115px 300px; animation: sl-spin 9s linear infinite; }
        @keyframes sl-spin { to { transform: rotate(360deg); } }
        .sl-rays { transform-box: view-box; transform-origin: 110px 102px; animation: sl-spin 50s linear infinite; }
        .sl-fill { transition: width .5s ease; }
        .sl-pulse { animation: sl-pulse 1.8s ease-in-out infinite; }
        @keyframes sl-pulse { 0%,100% { opacity: .45; } 50% { opacity: 1; } }
        .sl-comm { stroke-dasharray: 2 6; animation: sl-comm 3s linear infinite; }
        @keyframes sl-comm { to { stroke-dashoffset: -32; } }
        .sl-sky { transition: opacity .6s ease; }
        @media (prefers-reduced-motion: reduce) { .sl-svg * { animation: none !important; } }
      `}</style>

      <defs>
        <linearGradient id="sl-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14456f" />
          <stop offset="1" stopColor="#071423" />
        </linearGradient>
        <radialGradient id="sl-sun-halo">
          <stop offset="0" stopColor="#ffd66b" stopOpacity=".85" />
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
        <linearGradient id="sl-batt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1288ca" />
          <stop offset="1" stopColor="#4bd8ec" />
        </linearGradient>
        <filter id="sl-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="sl-panel-clip">
          <polygon points="56,140 190,156 190,196 46,196" />
        </clipPath>
      </defs>

      {/* Bakgrunnur: dagsbirtan liggur ofan á nóttinni */}
      <rect width="1080" height="500" fill="#050f1c" />
      <rect className="sl-sky" width="1080" height="500" fill="url(#sl-day)" opacity={r2(1 - darkness)} />
      <g fill="#ffffff" opacity={r2(darkness * 0.45)}>
        {[[300, 70], [352, 104], [420, 62], [800, 88], [880, 62], [640, 74]].map(([sx, sy], i) => (
          <circle key={i} cx={sx} cy={sy} r={i % 2 ? 1.3 : 1.8} />
        ))}
      </g>

      {/* Yfirskriftir hlutanna þriggja */}
      <g fill="#7ee8f5" fillOpacity=".6" fontSize="10.5" letterSpacing=".18em">
        <text x="34" y="34">FRAMLEIÐSLA</text>
        <text x="470" y="34">GEYMSLA OG BREYTING</text>
        <text x="916" y="34">NOTKUN</text>
      </g>
      <g stroke="#ffffff" strokeOpacity=".1">
        <line x1="34" y1="44" x2="400" y2="44" />
        <line x1="470" y1="44" x2="860" y2="44" />
        <line x1="916" y1="44" x2="1056" y2="44" />
      </g>

      {/* ---------- Kaplar ---------- */}
      <Flow id="sellur" power={live.solar} />
      <Flow id="mppt" power={live.solar} />
      <Flow id="mylla" power={live.wind} />
      <Flow id="vind" power={live.wind} />
      <Flow id="batt" power={Math.abs(live.battery)} reverse={discharging} color={charging ? "#20cae1" : "#7ee8f5"} />
      <Flow id="inv" power={load} />
      <Flow id="ac" power={load} />
      <Flow id="hus" power={live.house} />
      {config.evEnabled && <Flow id="bill" power={live.ev} />}
      {config.generator && <Flow id="varaafl" power={live.gen} color="#f59e0b" />}

      {/* ---------- Sól ---------- */}
      <Hit id="sol" x={70} y={62} w={80} h={80} label="Sólin" selected={selected} onSelect={onSelect}>
        {isDay ? (
          <g>
            <circle cx="110" cy="102" r="36" fill="url(#sl-sun-halo)" opacity={r2(0.2 + 0.6 * elevation * config.sunFactor)} />
            <g className="sl-rays" stroke="#ffd66b" strokeOpacity={r2(0.25 + 0.45 * elevation)} strokeWidth="2.5" strokeLinecap="round">
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i * Math.PI) / 4;
                return (
                  <line
                    key={i}
                    x1={r2(110 + Math.cos(a) * 20)}
                    y1={r2(102 + Math.sin(a) * 20)}
                    x2={r2(110 + Math.cos(a) * 28)}
                    y2={r2(102 + Math.sin(a) * 28)}
                  />
                );
              })}
            </g>
            <circle cx="110" cy="102" r="14" fill="url(#sl-sun)" filter="url(#sl-glow)" opacity={r2(0.55 + 0.45 * elevation)} />
          </g>
        ) : (
          <g>
            <circle cx="110" cy="102" r="26" fill="#ffffff" fillOpacity=".05" />
            <circle cx="110" cy="102" r="13" fill="#e8f4ff" fillOpacity=".8" />
            <circle cx="116" cy="97" r="11" fill="#050f1c" />
          </g>
        )}
      </Hit>

      {/* ---------- Sólarsellur ---------- */}
      <Hit id="sellur" x={30} y={130} w={176} h={96} label="Sólarsellur" selected={selected} onSelect={onSelect}>
        <g>
          <line x1="70" y1="194" x2="66" y2="218" stroke="#ffffff" strokeOpacity=".4" strokeWidth="3.5" />
          <line x1="176" y1="194" x2="180" y2="218" stroke="#ffffff" strokeOpacity=".4" strokeWidth="3.5" />
          <polygon
            points="56,140 190,156 190,196 46,196"
            fill="url(#sl-panel)"
            stroke="#6dbbe7"
            strokeOpacity=".85"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <g clipPath="url(#sl-panel-clip)" stroke="#a3d3f0" strokeOpacity=".28" strokeWidth="1">
            <line x1="44" y1="172" x2="192" y2="186" />
            <line x1="90" y1="134" x2="90" y2="202" />
            <line x1="125" y1="134" x2="125" y2="202" />
            <line x1="158" y1="134" x2="158" y2="202" />
          </g>
          <polygon
            points="56,140 190,156 190,196 46,196"
            fill="#ffd66b"
            opacity={r2(clamp(live.solar / Math.max(0.8, config.kwp * 0.7), 0, 1) * 0.2)}
          />
        </g>
      </Hit>
      <Pill x={34} y={228} label={`Sól · ${nf1(config.kwp)} kWp`} value={kw(live.solar)} active={live.solar > 0.02} />

      {/* ---------- Vindmylla ---------- */}
      <Hit id="mylla" x={50} y={240} w={130} h={200} label="Vindmylla" selected={selected} onSelect={onSelect}>
        <g opacity={config.turbineKw > 0 ? 1 : 0.3}>
          <path d="M111 430 L113 306 L117 306 L119 430 Z" fill="#ffffff" fillOpacity=".8" />
          <line x1="99" y1="431" x2="131" y2="431" stroke="#ffffff" strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />
          <rect x="108" y="294" width="16" height="10" rx="4" fill="#ffffff" fillOpacity=".9" />
          <g className="sl-blades" fill="#ffffff" fillOpacity=".95">
            {[0, 120, 240].map((a) => (
              <path
                key={a}
                transform={`rotate(${a} 115 300)`}
                d="M115 300 C 108 286, 109 268, 114 250 C 116 248, 118 250, 118 253 C 120 272, 120 288, 115 300 Z"
              />
            ))}
            <circle cx="115" cy="300" r="5" fill="#050f1c" stroke="#ffffff" strokeWidth="2" />
          </g>
        </g>
      </Hit>
      <Pill x={34} y={446} label="Vindur" value={config.turbineKw > 0 ? kw(live.wind) : "engin mylla"} active={live.wind > 0.02} />

      {/* ---------- Stýringar ---------- */}
      <Box id="mppt" x={240} y={150} w={150} h={58} title="MPPT" sub="sólarsellustýring" selected={selected} onSelect={onSelect}>
        <rect x={262} y={190} width={106} height={7} rx="3.5" fill="#04101d" stroke="#ffffff" strokeOpacity=".18" />
        <rect
          x={263}
          y={191}
          width={r2(clamp(live.solar / Math.max(0.5, config.kwp), 0, 1) * 104)}
          height={5}
          rx="2.5"
          fill="#4bd8ec"
        />
      </Box>
      <Box
        id="vindstyring"
        x={240}
        y={330}
        w={150}
        h={58}
        title="Vindstýring"
        sub="+ álagsviðnám"
        selected={selected}
        onSelect={onSelect}
        active={config.turbineKw > 0}
      />

      {/* ---------- DC dreifing ---------- */}
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
          x="470"
          y="242"
          width="220"
          height="17"
          rx="8.5"
          fill={selected === "dc" ? "#1288ca" : "#0d2b45"}
          stroke={selected === "dc" ? "#4bd8ec" : "#ffffff"}
          strokeOpacity={selected === "dc" ? 0.9 : 0.28}
        />
        <text x="482" y="255" fill="#ffffff" fillOpacity=".8" fontSize="10" letterSpacing=".08em">
          DC DREIFING · 48 V
        </text>
      </g>

      {/* ---------- Cerbo GX ---------- */}
      <Box id="cerbo" x={490} y={112} w={180} h={82} title="Cerbo GX" sub="eftirlit og stýring" selected={selected} onSelect={onSelect}>
        <rect x={508} y={150} width={144} height={32} rx="6" fill="#04101d" stroke="#4bd8ec" strokeOpacity=".45" />
        <text x={518} y={164} fill="#7ee8f5" fontSize="9.5" style={{ fontVariantNumeric: "tabular-nums" }}>
          {`${Math.round(live.soc)} % · ${nf1(live.solar + live.wind)} kW inn`}
        </text>
        <text x={518} y={176} fill="#ffffff" fillOpacity=".55" fontSize="9" style={{ fontVariantNumeric: "tabular-nums" }}>
          {`${nf1(load)} kW út`}
        </text>
        <circle cx={640} cy={166} r="3.2" fill="#5ef2b8" className="sl-pulse" />
      </Box>
      <g stroke="#5ef2b8" strokeOpacity=".28" strokeWidth="1.2" className="sl-comm" fill="none">
        <path d="M490 153 H420 V208" />
        <path d="M670 153 H760 V190" />
        <path d="M580 194 V242" />
      </g>

      {/* ---------- Rafgeymir ---------- */}
      <Box
        id="rafgeymir"
        x={480}
        y={320}
        w={200}
        h={100}
        title="Rafgeymar"
        selected={selected}
        onSelect={onSelect}
      >
        <rect x={500} y={352} width={160} height={30} rx="8" fill="#04101d" stroke="#ffffff" strokeOpacity=".22" />
        <rect className="sl-fill" x={502} y={354} width={r2(socFill * 156)} height={26} rx="6" fill="url(#sl-batt)" />
        <text x={580} y={373} textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="700" style={{ fontVariantNumeric: "tabular-nums" }}>
          {`${Math.round(live.soc)} %`}
        </text>
        <text x={580} y={396} textAnchor="middle" fill="#ffffff" fillOpacity=".55" fontSize="10" style={{ fontVariantNumeric: "tabular-nums" }}>
          {`${nf1((live.soc / 100) * config.batteryKwh)} af ${Math.round(config.batteryKwh)} kWst`}
        </text>
        <text
          x={580}
          y={411}
          textAnchor="middle"
          fill={full ? "#5ef2b8" : charging ? "#5ef2b8" : discharging ? "#fbbf24" : "#ffffff"}
          fillOpacity={full || charging || discharging ? 0.95 : 0.45}
          fontSize="10.5"
          fontWeight="600"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {full ? "fullhlaðinn" : charging ? `hleðst  +${nf1(live.battery)} kW` : discharging ? `afhleðst  −${nf1(-live.battery)} kW` : "í hvíld"}
        </text>
      </Box>

      {/* ---------- MultiPlus ---------- */}
      <Box
        id="multiplus"
        x={700}
        y={190}
        w={160}
        h={120}
        title="MultiPlus-II"
        sub={config.inverterLabel.replace("MultiPlus-II ", "")}
        selected={selected}
        onSelect={onSelect}
      >
        <path
          d="M722 262 C 730 246, 738 278, 746 262 C 754 246, 762 278, 770 262"
          stroke="#4bd8ec"
          strokeOpacity={load > 0.02 ? 0.95 : 0.3}
          strokeWidth="2"
          fill="none"
        />
        <text x={842} y={266} textAnchor="end" fill="#ffffff" fillOpacity=".85" fontSize="12" fontWeight="600" style={{ fontVariantNumeric: "tabular-nums" }}>
          {kw(load)}
        </text>
        <rect x={718} y={278} width={124} height={7} rx="3.5" fill="#04101d" stroke="#ffffff" strokeOpacity=".18" />
        <rect
          x={719}
          y={279}
          width={r2(clamp(load / Math.max(0.1, config.inverterKw), 0, 1) * 122)}
          height={5}
          rx="2.5"
          fill={load > config.inverterKw * 0.9 ? "#f59e0b" : "#4bd8ec"}
        />
        <text x={780} y={300} textAnchor="middle" fill="#ffffff" fillOpacity=".5" fontSize="9.5">
          {`af ${nf1(config.inverterKw)} kW · 48 V → 230 V`}
        </text>
      </Box>

      {/* ---------- Rafstöð ---------- */}
      {config.generator && (
        <Box
          id="varaafl"
          x={700}
          y={380}
          w={160}
          h={58}
          title="Rafstöð"
          sub={backupOn ? `í gangi · ${kw(live.gen)}` : "í bið"}
          selected={selected}
          onSelect={onSelect}
        >
          {backupOn && <circle cx={844} cy={396} r="4" fill="#f59e0b" className="sl-pulse" filter="url(#sl-glow)" />}
        </Box>
      )}

      {/* ---------- Hús ---------- */}
      <Hit id="hus" x={926} y={96} w={130} h={140} label="Hús" selected={selected} onSelect={onSelect}>
        <g>
          <polygon
            points="944,152 991,110 1038,152"
            fill="#102a44"
            stroke="#ffffff"
            strokeOpacity=".55"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="954" y="150" width="74" height="76" fill="#0b1d30" stroke="#ffffff" strokeOpacity=".5" strokeWidth="2.5" />
          <g fill={lightsOn ? "#ffd66b" : "#123f6b"} opacity={lightsOn ? 0.95 : 0.75}>
            <rect x="964" y="164" width="20" height="18" rx="2" />
            <rect x="998" y="164" width="20" height="18" rx="2" />
          </g>
          <rect x="982" y="196" width="18" height="30" rx="2" fill="#04101d" stroke="#ffffff" strokeOpacity=".3" strokeWidth="1.5" />
        </g>
      </Hit>
      <Pill x={916} y={58} w={140} label="Hús" value={kw(live.house)} active={live.house > 0.02} />

      {/* ---------- Rafbíll ---------- */}
      {config.evEnabled && (
        <>
          <Hit id="rafbill" x={912} y={330} w={150} h={92} label="Rafbíll" selected={selected} onSelect={onSelect}>
            <g>
              <path
                d="M926 404 L926 386 Q 928 376 939 374 L957 372 L975 352 Q 979 348 986 348 L1030 348 Q 1038 348 1042 354 L1055 374 L1064 376 Q 1073 378 1073 388 L1073 404 Z"
                fill="#0b1d30"
                stroke="#ffffff"
                strokeOpacity=".55"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M982 354 L1028 354 L1043 374 L969 374 Z"
                fill="#4bd8ec"
                fillOpacity=".16"
                stroke="#7ee8f5"
                strokeOpacity=".4"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="954" cy="404" r="11" fill="#04101d" stroke="#ffffff" strokeOpacity=".55" strokeWidth="2.5" />
              <circle cx="1044" cy="404" r="11" fill="#04101d" stroke="#ffffff" strokeOpacity=".55" strokeWidth="2.5" />
              <circle cx="928" cy="378" r="4" fill="#04101d" stroke={live.ev > 0.02 ? "#5ef2b8" : "#4bd8ec"} strokeWidth="2" />
            </g>
          </Hit>
          <Pill x={916} y={300} w={140} label="Rafbíll" value={live.ev > 0.02 ? kw(live.ev) : "bíður"} active={live.ev > 0.02} />
        </>
      )}

      {/* ---------- Viðvörun ---------- */}
      {live.deficit > 0.02 && (
        <g>
          <rect x="440" y="452" width="280" height="26" rx="13" fill="#3a1d05" stroke="#f59e0b" strokeOpacity=".8" />
          <text x="580" y="469" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="600">
            {`Orku vantar – ${kw(live.deficit)} skerðast`}
          </text>
        </g>
      )}
      {live.curtailed > 0.02 && live.deficit <= 0.02 && (
        <g>
          <rect x="440" y="452" width="280" height="26" rx="13" fill="#04101d" stroke="#5ef2b8" strokeOpacity=".45" />
          <text x="580" y="469" textAnchor="middle" fill="#5ef2b8" fontSize="11" fontWeight="600">
            {`Rafgeymir fullur – ${kw(live.curtailed)} nýtast ekki`}
          </text>
        </g>
      )}
    </svg>
  );
}
