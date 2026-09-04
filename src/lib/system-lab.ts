// Hermir fyrir ótengt (eða nettengt) orkukerfi – hrein stærðfræði, engin React-tengsl.
//
// Keyrir sólarhringinn klukkustund fyrir klukkustund á raunverulegum veðurgögnum
// (sjá src/content/climate.ts) og skilar flæði í hverjum tíma: framleiðslu, notkun,
// hleðslu/afhleðslu rafgeymis, hleðslustöðu, varaafli og umframorku.

import {
  CLIMATE_SITES,
  DAYS_IN_MONTH,
  type ClimateSite,
  type TiltDeg,
} from "@/content/climate";

// ---------- Fastar ----------

/** Nýtni MultiPlus áriðils (DC → AC) */
export const INVERTER_EFF = 0.94;
/** Nýtni inn í rafgeymi og út úr honum (LiFePO4, ≈96 % báðar leiðir samanlagt) */
export const BATT_EFF = 0.98;
/** Hámarks hleðslu-/afhleðslustraumur sem hlutfall af rýmd (0,5C = 5 kW á 10 kWst) */
export const BATT_C_RATE = 0.5;
/** Lítrar af olíu á hverja kWst frá rafstöð (dæmigerð dísilrafstöð undir hálfu álagi) */
export const GEN_LITRES_PER_KWH = 0.4;
/** Vindstuðull (power law) fyrir hæðarleiðréttingu vindhraða yfir opnu landi */
export const WIND_SHEAR = 0.14;

/** MultiPlus-II 48 V gerðir Bláorku – samfellt afl og hleðsluafl. */
export const INVERTERS = [
  { va: 3000, contW: 2400, chargeW: 1700, label: "MultiPlus-II 48/3000" },
  { va: 5000, contW: 4000, chargeW: 3400, label: "MultiPlus-II 48/5000" },
  { va: 8000, contW: 6400, chargeW: 5300, label: "MultiPlus-II 48/8000" },
  { va: 15000, contW: 12000, chargeW: 9600, label: "MultiPlus-II 48/15000" },
] as const;

export type InverterVa = (typeof INVERTERS)[number]["va"];

export function inverterFor(va: InverterVa) {
  return INVERTERS.find((i) => i.va === va) ?? INVERTERS[1];
}

/**
 * Dægursveifla heimilisnotkunar – hlutfall dagsnotkunar á hverri klukkustund.
 * Lág nótt, toppur á morgnana og aftur síðdegis/á kvöldin. Normaliserað í reikningnum.
 */
const LOAD_SHAPES = {
  // Heimili: lág nótt, toppur á morgnana og aftur síðdegis
  heimili: [
    2.4, 2.1, 2.0, 2.0, 2.1, 2.6, 3.6, 4.8, 5.2, 4.6, 4.2, 4.3, 4.6, 4.3, 4.1, 4.4, 5.4, 6.4, 6.8,
    6.2, 5.4, 4.4, 3.5, 2.8,
  ],
  // Sumarbústaður: lítið á daginn, kvöldið er stóra stundin
  bustadur: [
    2.0, 1.6, 1.4, 1.4, 1.4, 1.6, 2.2, 3.0, 3.4, 3.0, 2.8, 3.0, 3.2, 3.2, 3.4, 4.4, 6.6, 8.4, 8.8,
    8.0, 7.0, 5.6, 4.0, 2.6,
  ],
  // Jafnt álag allan sólarhringinn – fjarskiptastöð, kæling, frystiklefi
  jafnt: Array.from({ length: 24 }, () => 1),
} as const;

export type LoadProfile = keyof typeof LOAD_SHAPES;

export const LOAD_PROFILE_LABELS: { id: LoadProfile; label: string; note: string }[] = [
  { id: "heimili", label: "Heimili", note: "toppar morgna og kvölds" },
  { id: "bustadur", label: "Sumarbústaður", note: "mest á kvöldin" },
  { id: "jafnt", label: "Jafnt álag", note: "fjarskipti, kæling, frysting" },
];

export type EvMode = "nott" | "kvold" | "sol";

export interface LabInput {
  siteSlug: string;
  month: number; // 0–11
  tilt: TiltDeg;
  /** Uppsett sólarafl, kWp */
  kwp: number;
  /** Veðurstuðull: 1 = dæmigert veður mánaðarins, 0 = alskýjað, 1,3 = heiðskírt */
  sun: number;
  /** Meðalvindhraði á staðnum í 10 m hæð, m/s */
  windMean: number;
  /** Nafnafl hverrar vindmyllu, kW (0 = engin mylla) */
  turbineKw: number;
  turbines: number;
  /** Nafhæð myllu, m */
  hubHeight: number;
  /** Rafgeymar, kWst nafnrýmd */
  batteryKwh: number;
  /** Lágmarks hleðslustaða sem kerfið vill halda, % */
  reservePct: number;
  inverterVa: InverterVa;
  /** Dagleg notkun húss/bústaðar, kWst */
  dailyKwh: number;
  /** Lögun dægursveiflu í notkun */
  profile: LoadProfile;
  evEnabled: boolean;
  /** Hleðsluafl rafbíls, kW */
  evKw: number;
  /** Orka í bílinn á dag, kWst */
  evKwhPerDay: number;
  evMode: EvMode;
  /** Rafstöð ræsir sjálfkrafa undir varaforða */
  generator: boolean;
  /** Nettenging: net tekur við umframorku og fyllir upp í það sem vantar */
  grid: boolean;
}

export interface LabHour {
  hour: number;
  /** kW frá sólarsellum (DC, eftir MPPT) */
  solar: number;
  /** kW frá vindmyllu (DC, eftir hleðslustýringu) */
  wind: number;
  /** kW notkun í húsi (AC) */
  house: number;
  /** kW í rafbíl (AC) */
  ev: number;
  /** kW inn í rafgeymi (+) eða út úr honum (−) */
  battery: number;
  /** Hleðslustaða í lok tímans, % */
  soc: number;
  /** kW frá rafstöð */
  gen: number;
  /** kW af neti (+ inn af neti, − út á net) */
  grid: number;
  /** kW sem hvergi komst fyrir (rafgeymir fullur) */
  curtailed: number;
  /** kW sem vantaði upp á – ljósin fara út */
  deficit: number;
  /** Vindhraði í nafhæð, m/s */
  windSpeed: number;
  /** Lofthiti, °C */
  temp: number;
}

export interface LabDay {
  hours: LabHour[];
  solarKwh: number;
  windKwh: number;
  houseKwh: number;
  evKwh: number;
  chargeKwh: number;
  dischargeKwh: number;
  genKwh: number;
  genHours: number;
  genLitres: number;
  gridInKwh: number;
  gridOutKwh: number;
  curtailedKwh: number;
  deficitKwh: number;
  minSoc: number;
  maxSoc: number;
  /** Hlutfall notkunar sem kerfið sjálft stóð undir, 0–1 */
  selfSufficiency: number;
  peakKw: number;
  /** Álag fór yfir samfellt afl áriðils */
  inverterOverload: boolean;
}

export interface LabYearMonth {
  month: number;
  solarKwh: number;
  windKwh: number;
  loadKwh: number;
  genKwh: number;
  genLitres: number;
  curtailedKwh: number;
  deficitKwh: number;
  selfSufficiency: number;
}

export interface LabYear {
  months: LabYearMonth[];
  solarKwh: number;
  windKwh: number;
  loadKwh: number;
  genKwh: number;
  genLitres: number;
  curtailedKwh: number;
  deficitKwh: number;
  selfSufficiency: number;
}

// ---------- Hjálparföll ----------

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Námundun í 4 aukastafi. Math.pow skilar ekki alveg sama bita á Node og í vafra,
 * svo tölurnar eru námundaðar áður en þær rata í SVG-eigindi – annars kvartar
 * React undan hydration-misræmi í öftustu tölustöfunum.
 */
const r4 = (v: number) => Math.round(v * 1e4) / 1e4;

export function siteBySlug(slug: string): ClimateSite {
  return CLIMATE_SITES.find((s) => s.slug === slug) ?? CLIMATE_SITES[0];
}

/**
 * Aflferill lítillar vindmyllu: ekkert undir 3 m/s, vex með v³ upp í nafnafl við 12 m/s,
 * flatt upp að 20 m/s og myllan stöðvast (fer í öryggisstöðu) yfir 25 m/s.
 */
export function turbinePower(v: number, ratedKw: number): number {
  const cutIn = 3;
  const rated = 12;
  const cutOut = 25;
  if (v <= cutIn || v >= cutOut) return 0;
  if (v >= rated) return ratedKw;
  const f = (v ** 3 - cutIn ** 3) / (rated ** 3 - cutIn ** 3);
  return ratedKw * f;
}

/** Vindhraði færður úr 10 m mælihæð upp í nafhæð myllunnar. */
export function windAtHub(v10: number, hubHeight: number): number {
  return v10 * (hubHeight / 10) ** WIND_SHEAR;
}

/** Framleiðsla sólarsella í kW á tilteknum tíma. */
function solarKw(site: ClimateSite, month: number, hour: number, tilt: TiltDeg, kwp: number, sun: number) {
  const wPerKwp = site.solar[tilt][month][hour];
  return (wPerKwp / 1000) * kwp * sun;
}

/** Hleðsluferill rafbíls: hvenær sólarhringsins bíllinn tekur við orku. */
function evWindow(mode: EvMode, hour: number): boolean {
  if (mode === "nott") return hour >= 0 && hour < 7;
  if (mode === "kvold") return hour >= 17 && hour < 23;
  return hour >= 8 && hour < 19; // sólarhleðsla – aðeins þegar afgangur er til
}

// ---------- Sólarhringurinn ----------

/**
 * Keyrir sólarhringinn. Byrjað er á 60 % hleðslu og dagurinn keyrður þrisvar
 * svo hleðslustaðan nái jafnvægi – niðurstaðan er síðasti dagurinn.
 */
export function simulateDay(input: LabInput): LabDay {
  const site = siteBySlug(input.siteSlug);
  const inv = inverterFor(input.inverterVa);
  const usableKwh = input.batteryKwh;
  const battMaxKw = input.batteryKwh * BATT_C_RATE;
  const reserve = input.reservePct / 100;

  const shape = LOAD_SHAPES[input.profile] ?? LOAD_SHAPES.heimili;
  const shapeSum = shape.reduce((a, b) => a + b, 0);

  let soc = 0.6;
  let hours: LabHour[] = [];
  let overload = false;

  for (let pass = 0; pass < 3; pass++) {
    hours = [];
    overload = false;
    let evLeft = input.evEnabled ? input.evKwhPerDay : 0;
    for (let hour = 0; hour < 24; hour++) {
      const solar = solarKw(site, input.month, hour, input.tilt, input.kwp, input.sun);
      const v10 = site.wind[input.month][hour] * (input.windMean / site.windCubeMean10m);
      const windSpeed = windAtHub(v10, input.hubHeight);
      const wind = input.turbineKw > 0 ? turbinePower(windSpeed, input.turbineKw) * input.turbines : 0;

      const house = (input.dailyKwh * shape[hour]) / shapeSum;

      // Framleiðsla og grunnnotkun mætast á DC-teininum
      const prod = solar + wind;
      let ev = 0;

      // Húsið hefur forgang í áriðlinum, rafbíllinn fær það sem eftir er
      const contKw = inv.contW / 1000;
      const servedHouse = Math.min(house, contKw);
      let deficit = house - servedHouse;
      if (deficit > 0.001) overload = true;

      // Rafbíllinn: í sólarham tekur hann aðeins það sem annars færi til spillis
      if (input.evEnabled && evLeft > 0.01 && evWindow(input.evMode, hour)) {
        const headroom = Math.max(0, contKw - servedHouse);
        if (input.evMode === "sol") {
          const surplusAc = Math.max(0, (prod - servedHouse / INVERTER_EFF) * INVERTER_EFF);
          // Sólarhleðsla er hófsöm: bara ef rafgeymirinn er kominn vel á veg
          ev = soc < 0.6 ? 0 : clamp(surplusAc, 0, Math.min(input.evKw, headroom, evLeft));
        } else {
          const windowHours = input.evMode === "nott" ? 7 : 6;
          ev = Math.min(input.evKw, input.evKwhPerDay / windowHours, headroom, evLeft);
        }
        evLeft -= ev;
      }

      const servedAc = servedHouse + ev;

      // Allt AC-álag er sótt í gegnum áriðilinn
      const dcDemand = servedAc / INVERTER_EFF;
      const net = prod - dcDemand;

      let battery = 0;
      let gen = 0;
      let grid = 0;
      let curtailed = 0;

      if (net >= 0) {
        // Afgangur – hlaða rafgeymi, svo net, svo skerðing
        const room = ((1 - soc) * usableKwh) / BATT_EFF;
        const charge = Math.min(net, battMaxKw, room);
        battery = charge;
        soc += (charge * BATT_EFF) / usableKwh;
        const left = net - charge;
        if (left > 0) {
          if (input.grid) grid = -left;
          else curtailed = left;
        }
      } else {
        // Vantar orku – taka af rafgeymi niður að varaforða
        const need = -net;
        const available = Math.max(0, ((soc - reserve) * usableKwh) * BATT_EFF);
        const draw = Math.min(need, battMaxKw, available);
        battery = -draw;
        soc -= draw / BATT_EFF / usableKwh;
        let short = need - draw;
        if (short > 0.001) {
          if (input.grid) {
            grid = short;
            short = 0;
          } else if (input.generator) {
            // Rafstöðin keyrir álagið og hleður rafgeyminn í leiðinni
            const chargeRoom = Math.min(
              battMaxKw,
              ((1 - soc) * usableKwh) / BATT_EFF,
              inv.chargeW / 1000,
            );
            gen = short + chargeRoom;
            battery += chargeRoom;
            soc += (chargeRoom * BATT_EFF) / usableKwh;
            short = 0;
          } else {
            // Ekkert varaafl: notkunin skerðist
            deficit += short * INVERTER_EFF;
            short = 0;
          }
        }
      }

      soc = clamp(soc, 0, 1);

      hours.push({
        hour,
        solar: r4(solar),
        wind: r4(wind),
        house: r4(servedHouse),
        ev: r4(ev),
        battery: r4(battery),
        soc: r4(soc * 100),
        gen: r4(gen),
        grid: r4(grid),
        curtailed: r4(curtailed),
        deficit: r4(deficit),
        windSpeed: r4(windSpeed),
        temp: site.temp[input.month][hour],
      });
    }
  }

  const sum = (f: (h: LabHour) => number) => r4(hours.reduce((a, h) => a + f(h), 0));
  const houseKwh = sum((h) => h.house);
  const evKwh = sum((h) => h.ev);
  const genKwh = sum((h) => h.gen);
  const gridInKwh = sum((h) => Math.max(0, h.grid));
  const deficitKwh = sum((h) => h.deficit);
  const loadKwh = houseKwh + evKwh + deficitKwh;

  return {
    hours,
    solarKwh: sum((h) => h.solar),
    windKwh: sum((h) => h.wind),
    houseKwh,
    evKwh,
    chargeKwh: sum((h) => Math.max(0, h.battery)),
    dischargeKwh: sum((h) => Math.max(0, -h.battery)),
    genKwh,
    genHours: hours.filter((h) => h.gen > 0.01).length,
    genLitres: genKwh * GEN_LITRES_PER_KWH,
    gridInKwh,
    gridOutKwh: sum((h) => Math.max(0, -h.grid)),
    curtailedKwh: sum((h) => h.curtailed),
    deficitKwh,
    minSoc: Math.min(...hours.map((h) => h.soc)),
    maxSoc: Math.max(...hours.map((h) => h.soc)),
    selfSufficiency: r4(loadKwh > 0 ? clamp((loadKwh - genKwh - gridInKwh - deficitKwh) / loadKwh, 0, 1) : 1),
    peakKw: r4(Math.max(...hours.map((h) => h.house + h.ev))),
    inverterOverload: overload,
  };
}

/** Keyrir alla tólf mánuðina og margfaldar með dagafjölda – gróft en raunsætt ársyfirlit. */
export function simulateYear(input: LabInput): LabYear {
  const months: LabYearMonth[] = [];
  for (let month = 0; month < 12; month++) {
    const day = simulateDay({ ...input, month });
    const d = DAYS_IN_MONTH[month];
    const loadKwh = (day.houseKwh + day.evKwh + day.deficitKwh) * d;
    months.push({
      month,
      solarKwh: r4(day.solarKwh * d),
      windKwh: r4(day.windKwh * d),
      loadKwh: r4(loadKwh),
      genKwh: r4(day.genKwh * d),
      genLitres: r4(day.genLitres * d),
      curtailedKwh: r4(day.curtailedKwh * d),
      deficitKwh: r4(day.deficitKwh * d),
      selfSufficiency: day.selfSufficiency,
    });
  }
  const t = (f: (m: LabYearMonth) => number) => r4(months.reduce((a, m) => a + f(m), 0));
  const loadKwh = t((m) => m.loadKwh);
  const genKwh = t((m) => m.genKwh);
  const deficitKwh = t((m) => m.deficitKwh);
  return {
    months,
    solarKwh: t((m) => m.solarKwh),
    windKwh: t((m) => m.windKwh),
    loadKwh,
    genKwh,
    genLitres: t((m) => m.genLitres),
    curtailedKwh: t((m) => m.curtailedKwh),
    deficitKwh,
    selfSufficiency: r4(loadKwh > 0 ? clamp((loadKwh - genKwh - deficitKwh) / loadKwh, 0, 1) : 1),
  };
}
