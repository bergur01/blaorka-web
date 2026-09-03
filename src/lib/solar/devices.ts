// Algeng heimilistæki – dæmigerð dagleg orkunotkun (kWst/dag) og hámarksafl (W).
// Tölurnar eru meðaltöl fyrir íslensk heimili/sumarhús; notandi getur breytt magni
// og bætt öryggismörkum ofan á. Uppfærðu hér, ekki í reiknivélinni sjálfri.

export interface Device {
  id: string;
  name: string;
  /** Dæmigerð notkun, kWst á dag fyrir eitt tæki */
  kwhPerDay: number;
  /** Hámarksafl í notkun, W */
  peakW: number;
  /** Stutt skýring á forsendu */
  note: string;
  group: "eldhus" | "thvottur" | "afthreying" | "hiti" | "annad";
}

export const deviceGroups: { id: Device["group"]; label: string }[] = [
  { id: "eldhus", label: "Eldhús" },
  { id: "thvottur", label: "Þvottur" },
  { id: "afthreying", label: "Afþreying & tengingar" },
  { id: "hiti", label: "Hiti & vatn" },
  { id: "annad", label: "Annað" },
];

export const devices: Device[] = [
  // Eldhús
  { id: "isskapur", name: "Ísskápur", kwhPerDay: 1.0, peakW: 150, note: "allan sólarhringinn", group: "eldhus" },
  { id: "frystir", name: "Frystikista / -skápur", kwhPerDay: 1.2, peakW: 200, note: "allan sólarhringinn", group: "eldhus" },
  { id: "eldavel", name: "Eldavél / helluborð", kwhPerDay: 1.5, peakW: 3500, note: "≈ 45 mín eldun á dag", group: "eldhus" },
  { id: "ofn", name: "Bakaraofn", kwhPerDay: 1.0, peakW: 2500, note: "≈ 30 mín á dag", group: "eldhus" },
  { id: "uppthvottavel", name: "Uppþvottavél", kwhPerDay: 1.0, peakW: 2000, note: "1 umferð á dag", group: "eldhus" },
  { id: "orbylgja", name: "Örbylgjuofn", kwhPerDay: 0.2, peakW: 1000, note: "≈ 10 mín á dag", group: "eldhus" },
  { id: "kaffivel", name: "Kaffivél", kwhPerDay: 0.3, peakW: 1500, note: "nokkrir bollar", group: "eldhus" },
  { id: "ketill", name: "Hraðsuðuketill", kwhPerDay: 0.3, peakW: 2000, note: "≈ 4 suður", group: "eldhus" },
  // Þvottur
  { id: "thvottavel", name: "Þvottavél", kwhPerDay: 0.7, peakW: 2000, note: "1 þvottur á 40 °C annan hvern dag", group: "thvottur" },
  { id: "thurrkari", name: "Þurrkari", kwhPerDay: 2.0, peakW: 2500, note: "1 umferð annan hvern dag", group: "thvottur" },
  // Afþreying & tengingar
  { id: "sjonvarp", name: "Sjónvarp", kwhPerDay: 0.4, peakW: 100, note: "≈ 4 klst á dag", group: "afthreying" },
  { id: "starlink", name: "Starlink", kwhPerDay: 1.0, peakW: 75, note: "≈ 40 W allan sólarhringinn", group: "afthreying" },
  { id: "router", name: "Beinir / 4G", kwhPerDay: 0.25, peakW: 15, note: "allan sólarhringinn", group: "afthreying" },
  { id: "tolva", name: "Tölva / vinnuaðstaða", kwhPerDay: 0.5, peakW: 150, note: "≈ 6 klst á dag", group: "afthreying" },
  { id: "simar", name: "Símar & spjaldtölvur", kwhPerDay: 0.1, peakW: 40, note: "hleðsla", group: "afthreying" },
  { id: "ljos", name: "Lýsing (LED)", kwhPerDay: 0.5, peakW: 120, note: "allt húsið, ≈ 5 klst", group: "afthreying" },
  // Hiti & vatn
  { id: "varmadaela", name: "Varmadæla (loft í loft)", kwhPerDay: 17.5, peakW: 2000, note: "hitar húsið, 15–20 kWst á dag á Íslandi", group: "hiti" },
  { id: "hitakutur", name: "Rafmagnshitakútur", kwhPerDay: 4.0, peakW: 2000, note: "heitt vatn fyrir 2–4", group: "hiti" },
  { id: "vatnsdaela", name: "Vatnsdæla / brunndæla", kwhPerDay: 0.5, peakW: 750, note: "≈ 40 mín gangur", group: "hiti" },
  // Annað
  { id: "ryksuga", name: "Ryksuga / verkfæri", kwhPerDay: 0.2, peakW: 1200, note: "stutt notkun", group: "annad" },
  { id: "loftraesting", name: "Loftræsting / vifta", kwhPerDay: 0.5, peakW: 50, note: "allan sólarhringinn", group: "annad" },
];

/** Samtímastuðull: ekki eru öll tæki í gangi í einu. */
export const DIVERSITY = 0.6;

export interface DeviceTotals {
  dailyKwh: number;
  /** Hámarksálag í kW: a.m.k. stærsta tækið + 0,5 kW, annars samtímastuðull × summa */
  peakKw: number;
  count: number;
}

export interface CustomDevice {
  id: string;
  name: string;
  peakW: number;
  hoursPerDay: number;
  qty: number;
}

export const customKwhPerDay = (c: CustomDevice) => (c.peakW * c.hoursPerDay) / 1000;

export function sumDevices(
  selected: Map<string, number>,
  marginPct: number,
  custom: CustomDevice[] = [],
): DeviceTotals {
  let daily = 0;
  let sumW = 0;
  let largestW = 0;
  let count = 0;
  for (const [id, qty] of selected) {
    const d = devices.find((x) => x.id === id);
    if (!d || qty <= 0) continue;
    daily += d.kwhPerDay * qty;
    sumW += d.peakW * qty;
    largestW = Math.max(largestW, d.peakW);
    count += qty;
  }
  for (const c of custom) {
    if (c.qty <= 0 || c.peakW <= 0) continue;
    daily += customKwhPerDay(c) * c.qty;
    sumW += c.peakW * c.qty;
    largestW = Math.max(largestW, c.peakW);
    count += c.qty;
  }
  const m = 1 + marginPct / 100;
  const peakW = Math.max(largestW + 500, sumW * DIVERSITY) * m;
  return {
    dailyKwh: Math.round(daily * m * 10) / 10,
    peakKw: Math.max(0.5, Math.ceil((peakW / 1000) * 2) / 2),
    count,
  };
}
