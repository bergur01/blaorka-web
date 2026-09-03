"use client";

import { deviceGroups, devices } from "@/lib/solar/devices";
import { fmt, fmt1 } from "@/lib/solar/sizing";

/** Tækjaval með magni og öryggismörkum. */
export function DevicePicker({
  selected,
  onQty,
  marginPct,
  onMargin,
  totals,
}: {
  selected: Map<string, number>;
  onQty: (id: string, qty: number) => void;
  marginPct: number;
  onMargin: (v: number) => void;
  totals: { dailyKwh: number; peakKw: number; count: number };
}) {
  const rawDaily = totals.dailyKwh / (1 + marginPct / 100);
  return (
    <div className="mt-5 rounded-2xl border border-mist-200 bg-mist-50 p-4 sm:p-5">
      <div className="space-y-5">
        {deviceGroups.map((g) => (
          <div key={g.id}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-900/45">{g.label}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {devices
                .filter((d) => d.group === g.id)
                .map((d) => {
                  const qty = selected.get(d.id) ?? 0;
                  const on = qty > 0;
                  return (
                    <li key={d.id}>
                      <div
                        className={`rounded-xl border px-3 py-2.5 transition ${
                          on ? "border-brand-500 bg-white ring-1 ring-brand-500" : "border-mist-300 bg-white/60 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onQty(d.id, on ? 0 : 1)}
                            aria-pressed={on}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold ${
                                on ? "border-brand-500 bg-brand-500 text-white" : "border-mist-300 bg-white"
                              }`}
                              aria-hidden="true"
                            >
                              {on ? "✓" : ""}
                            </span>
                            <span className="min-w-0 text-sm font-medium leading-snug">{d.name}</span>
                          </button>
                          {on && (
                            <span className="flex shrink-0 items-center rounded-lg border border-mist-300 bg-mist-50">
                              <button type="button" onClick={() => onQty(d.id, qty - 1)} className="h-7 w-7 text-sm font-semibold text-ink-900/60 hover:text-brand-600" aria-label={`Fækka ${d.name}`}>
                                −
                              </button>
                              <span className="w-5 text-center text-xs font-semibold tabular-nums">{qty}</span>
                              <button type="button" onClick={() => onQty(d.id, Math.min(9, qty + 1))} className="h-7 w-7 text-sm font-semibold text-ink-900/60 hover:text-brand-600" aria-label={`Fjölga ${d.name}`}>
                                +
                              </button>
                            </span>
                          )}
                        </div>
                        <p className="mt-1 pl-8 text-[11px] leading-snug text-ink-900/50">
                          {fmt1.format(d.kwhPerDay)} kWst/dag · {fmt.format(d.peakW)} W · {d.note}
                          {qty > 1 && (
                            <span className="text-brand-600"> · ×{qty} = {fmt1.format(d.kwhPerDay * qty)} kWst</span>
                          )}
                        </p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-mist-200 pt-4">
        <label className="block">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Öryggismörk</span>
            <span className="font-display text-lg font-semibold text-brand-600">+{marginPct} %</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            step={5}
            value={marginPct}
            onChange={(e) => onMargin(Number(e.target.value))}
            className="mt-2 w-full accent-brand-500"
            aria-label="Öryggismörk í prósentum"
          />
          <p className="mt-1 text-xs text-ink-900/50">
            Bætt ofan á notkun og álag fyrir gesti, nýjar græjur og dimma daga. 15–25 % er algengt.
          </p>
        </label>
        <p className="mt-3 text-sm">
          <strong>{totals.count} tæki</strong> · {fmt1.format(rawDaily)} kWst/dag
          {marginPct > 0 && (
            <>
              {" "}
              + {marginPct} % = <strong className="text-brand-600">{fmt1.format(totals.dailyKwh)} kWst/dag</strong>
            </>
          )}{" "}
          · hámarksálag <strong className="text-brand-600">{fmt1.format(totals.peakKw)} kW</strong>
          <span className="text-ink-900/50"> (60 % samtímastuðull, þó a.m.k. stærsta tækið)</span>
        </p>
      </div>
    </div>
  );
}

