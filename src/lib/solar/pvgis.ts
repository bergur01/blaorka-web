import "server-only";
import { ASPECTS, type Aspect, type SolarProfiles } from "./sizing";

// Hjúpun á PVGIS (Photovoltaic Geographical Information System, JRC / ESB).
// Ókeypis, án lykils. Skilar mánaðarlegri framleiðslu á 1 kWp kerfi.
// Svör eru skyndiminnuð í 30 daga – geislunargögnin breytast ekki.

const BASE = "https://re.jrc.ec.europa.eu/api/v5_3/PVcalc";
const REVALIDATE = 60 * 60 * 24 * 30;
const SYSTEM_LOSS = 14; // % – kaplar, óhreinindi, hitastig, áriðill (PVGIS sjálfgefið)

interface PvcalcResponse {
  inputs: {
    meteo_data: { radiation_db: string };
    mounting_system: { fixed: { slope: { value: number }; azimuth: { value: number } } };
  };
  outputs: {
    monthly: { fixed: { month: number; E_m: number }[] };
    totals: { fixed: { E_y: number } };
  };
}

async function pvcalc(params: Record<string, string | number>): Promise<PvcalcResponse> {
  const url = new URL(BASE);
  const all = { peakpower: 1, loss: SYSTEM_LOSS, outputformat: "json", ...params };
  for (const [k, v] of Object.entries(all)) url.searchParams.set(k, String(v));
  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`PVGIS ${res.status}`);
  return res.json();
}

export async function fetchSolarProfiles(
  lat: number,
  lon: number,
  tilt: number,
): Promise<SolarProfiles> {
  const [optimal, ...aspects] = await Promise.all([
    pvcalc({ lat, lon, optimalangles: 1 }),
    ...ASPECTS.map((aspect) => pvcalc({ lat, lon, angle: tilt, aspect })),
  ]);

  const byAspect = {} as Record<Aspect, number[]>;
  ASPECTS.forEach((aspect, i) => {
    byAspect[aspect] = aspects[i].outputs.monthly.fixed.map((m) => m.E_m);
  });

  return {
    lat,
    lon,
    tilt,
    db: aspects[0].inputs.meteo_data.radiation_db,
    byAspect,
    optimal: {
      tilt: optimal.inputs.mounting_system.fixed.slope.value,
      aspect: optimal.inputs.mounting_system.fixed.azimuth.value,
      monthly: optimal.outputs.monthly.fixed.map((m) => m.E_m),
      annual: optimal.outputs.totals.fixed.E_y,
    },
  };
}
