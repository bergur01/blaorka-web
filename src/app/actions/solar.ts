"use server";

import { fetchSolarProfiles } from "@/lib/solar/pvgis";
import type { SolarProfiles } from "@/lib/solar/sizing";

// Server Action: sækir geislunargögn fyrir hnit + halla.
// Hnit eru bundin við Ísland og námunduð svo skyndiminnið nýtist.

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export async function getSolarProfiles(input: {
  lat: number;
  lon: number;
  tilt: number;
}): Promise<{ ok: true; data: SolarProfiles } | { ok: false; error: string }> {
  const lat = Math.round(clamp(Number(input.lat) || 64.13, 63.2, 66.6) * 100) / 100;
  const lon = Math.round(clamp(Number(input.lon) || -21.9, -24.6, -13.4) * 100) / 100;
  const tilt = Math.round(clamp(Number(input.tilt) || 45, 0, 90));

  try {
    const data = await fetchSolarProfiles(lat, lon, tilt);
    return { ok: true, data };
  } catch (err) {
    console.error("[solar] PVGIS villa", err);
    return { ok: false, error: "Náði ekki í geislunargögn – reyndu aftur eftir smá stund." };
  }
}
