"use client";

import { useRef } from "react";
import { MONTHS_SHORT } from "@/content/climate";
import { makeFormatter } from "@/lib/format";
import type { LabDay, LabYear } from "@/lib/system-lab";

const nf1 = makeFormatter(1);
const nf0 = makeFormatter(0);

const W = 720;
const H = 232;
const PAD = { l: 40, r: 44, t: 16, b: 26 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

/** Sólarhringurinn: framleiðsla, notkun og hleðslustaða. Hægt að draga til að velja tíma. */
export function DayChart({
  day,
  hour,
  onScrub,
}: {
  day: LabDay;
  hour: number;
  onScrub: (h: number) => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const hours = day.hours;
  const demand = hours.map((h) => h.house + h.ev + h.deficit);
  const prod = hours.map((h) => h.solar + h.wind);
  const peak = Math.max(1, ...demand, ...prod);
  const yMax = Math.ceil(peak * 1.15 * 2) / 2;

  const x = (h: number) => PAD.l + (h / 24) * IW;
  const y = (v: number) => PAD.t + IH - (v / yMax) * IH;
  const ySoc = (p: number) => PAD.t + IH - (p / 100) * IH;

  // Þrepalínur (klukkustundargildi) – hvert gildi gildir alla klukkustundina
  const step = (vals: number[], close: boolean) => {
    let d = `M ${x(0)} ${y(vals[0])}`;
    for (let i = 0; i < 24; i++) {
      d += ` L ${x(i)} ${y(vals[i])} L ${x(i + 1)} ${y(vals[i])}`;
    }
    if (close) d += ` L ${x(24)} ${y(0)} L ${x(0)} ${y(0)} Z`;
    return d;
  };
  const stackedSolar = hours.map((h) => h.solar);
  const stackedAll = prod;

  // Hleðslustaðan er staðan í lok hverrar klukkustundar – ferillinn byrjar því
  // á stöðunni frá kvöldinu áður og endar á sömu tölu sólarhring síðar.
  const socPath = (() => {
    let d = `M ${x(0)} ${ySoc(hours[23].soc)}`;
    for (let i = 0; i < 24; i++) d += ` L ${x(i + 1)} ${ySoc(hours[i].soc)}`;
    return d;
  })();

  const scrub = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = ref.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    onScrub(Math.max(0, Math.min(23.99, ((px - PAD.l) / IW) * 24)));
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full cursor-ew-resize touch-none select-none"
      role="img"
      aria-label={`Sólarhringsferill: framleiðsla ${nf1.format(day.solarKwh + day.windKwh)} kílóvattstundir, notkun ${nf1.format(day.houseKwh + day.evKwh)} kílóvattstundir`}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        scrub(e);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) scrub(e);
      }}
    >
      <defs>
        <linearGradient id="dc-solar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1288ca" stopOpacity=".85" />
          <stop offset="1" stopColor="#1288ca" stopOpacity=".12" />
        </linearGradient>
        <linearGradient id="dc-wind" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#20cae1" stopOpacity=".55" />
          <stop offset="1" stopColor="#20cae1" stopOpacity=".08" />
        </linearGradient>
      </defs>

      {/* Rúðunet */}
      <g stroke="#ffffff" strokeOpacity=".08">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD.l} y1={PAD.t + IH * f} x2={PAD.l + IW} y2={PAD.t + IH * f} />
        ))}
      </g>
      <g fill="#ffffff" fillOpacity=".4" fontSize="9" fontFamily="var(--font-inter), system-ui">
        {[0, 0.5, 1].map((f) => (
          <text key={f} x={PAD.l - 6} y={PAD.t + IH * (1 - f) + 3} textAnchor="end">
            {nf1.format(yMax * f)}
          </text>
        ))}
        <text x={PAD.l - 6} y={PAD.t - 4} textAnchor="end" fillOpacity=".55">
          kW
        </text>
        {[0, 6, 12, 18, 24].map((h) => (
          <text key={h} x={x(h)} y={H - 8} textAnchor="middle">
            {String(h).padStart(2, "0")}
          </text>
        ))}
        {[0, 50, 100].map((p) => (
          <text key={p} x={PAD.l + IW + 6} y={ySoc(p) + 3} fillOpacity=".5">
            {p}%
          </text>
        ))}
      </g>

      {/* Nótt */}
      <g fill="#ffffff" fillOpacity=".03">
        {hours.map((h, i) =>
          h.solar < 0.01 ? <rect key={i} x={x(i)} y={PAD.t} width={IW / 24} height={IH} /> : null,
        )}
      </g>

      {/* Framleiðsla: sól neðst, vindur ofan á */}
      <path d={step(stackedAll, true)} fill="url(#dc-wind)" />
      <path d={step(stackedSolar, true)} fill="url(#dc-solar)" />
      <path d={step(stackedAll, false)} fill="none" stroke="#20cae1" strokeOpacity=".8" strokeWidth="1.5" />

      {/* Rafstöð */}
      {day.genKwh > 0.01 && (
        <g fill="#f59e0b" fillOpacity=".35">
          {hours.map((h, i) =>
            h.gen > 0.01 ? <rect key={i} x={x(i) + 1} y={PAD.t + IH - 6} width={IW / 24 - 2} height={6} /> : null,
          )}
        </g>
      )}

      {/* Notkun */}
      <path d={step(demand, false)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />

      {/* Hleðslustaða */}
      <path d={socPath} fill="none" stroke="#ffffff" strokeOpacity=".65" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Tímamerki */}
      <g>
        <line x1={x(hour)} y1={PAD.t} x2={x(hour)} y2={PAD.t + IH} stroke="#ffffff" strokeOpacity=".7" strokeWidth="1.5" />
        <circle cx={x(hour)} cy={PAD.t} r="3.5" fill="#ffffff" />
      </g>
    </svg>
  );
}

/** Tólf mánuðir: framleiðsla á móti notkun. Smellt á súlu velur mánuðinn. */
export function YearChart({
  year,
  month,
  onSelect,
}: {
  year: LabYear;
  month: number;
  onSelect: (m: number) => void;
}) {
  const w = 720;
  const h = 210;
  const pad = { l: 42, r: 12, t: 14, b: 30 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const max = Math.max(
    1,
    ...year.months.map((m) => Math.max(m.solarKwh + m.windKwh, m.loadKwh)),
  );
  const bw = iw / 12;
  const y = (v: number) => pad.t + ih - (v / max) * ih;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      role="img"
      aria-label={`Ársyfirlit: framleiðsla ${nf0.format(year.solarKwh + year.windKwh)} kílóvattstundir á móti ${nf0.format(year.loadKwh)} kílóvattstunda notkun`}
    >
      <g stroke="#ffffff" strokeOpacity=".08">
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={pad.l} y1={pad.t + ih * f} x2={pad.l + iw} y2={pad.t + ih * f} />
        ))}
      </g>
      <g fill="#ffffff" fillOpacity=".4" fontSize="9" fontFamily="var(--font-inter), system-ui">
        {[0, 0.5, 1].map((f) => (
          <text key={f} x={pad.l - 6} y={pad.t + ih * (1 - f) + 3} textAnchor="end">
            {nf0.format(max * f)}
          </text>
        ))}
        <text x={pad.l - 6} y={pad.t - 3} textAnchor="end" fillOpacity=".55">
          kWst
        </text>
      </g>

      {year.months.map((m, i) => {
        const cx = pad.l + bw * i;
        const on = m.month === month;
        const prod = m.solarKwh + m.windKwh;
        return (
          <g
            key={i}
            onClick={() => onSelect(m.month)}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`${MONTHS_SHORT[i]}: framleiðsla ${nf0.format(prod)} kWst, notkun ${nf0.format(m.loadKwh)} kWst`}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(m.month)}
          >
            <rect x={cx} y={pad.t} width={bw} height={ih} fill={on ? "#ffffff" : "transparent"} fillOpacity={on ? 0.07 : 0} />
            {/* framleiðsla */}
            <rect x={cx + bw * 0.16} y={y(prod)} width={bw * 0.38} height={pad.t + ih - y(prod)} rx="3" fill="#1288ca" />
            <rect
              x={cx + bw * 0.16}
              y={y(prod)}
              width={bw * 0.38}
              height={Math.max(0, ((m.windKwh / Math.max(prod, 0.001)) * (pad.t + ih - y(prod))))}
              rx="3"
              fill="#20cae1"
            />
            {/* notkun */}
            <rect x={cx + bw * 0.56} y={y(m.loadKwh)} width={bw * 0.28} height={pad.t + ih - y(m.loadKwh)} rx="3" fill="#f59e0b" fillOpacity=".75" />
            {/* rafstöð ofan á notkun */}
            {m.genKwh > 0.5 && (
              <rect
                x={cx + bw * 0.56}
                y={y(m.loadKwh)}
                width={bw * 0.28}
                height={Math.max(2, ((m.genKwh / Math.max(m.loadKwh, 0.001)) * (pad.t + ih - y(m.loadKwh))))}
                rx="3"
                fill="#dc2626"
                fillOpacity=".8"
              />
            )}
            <text
              x={cx + bw / 2}
              y={h - 10}
              textAnchor="middle"
              fontSize="10"
              fill="#ffffff"
              fillOpacity={on ? 0.95 : 0.45}
              fontWeight={on ? 700 : 400}
              fontFamily="var(--font-inter), system-ui"
            >
              {MONTHS_SHORT[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
