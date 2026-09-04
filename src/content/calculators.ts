import type { Calculator } from "@/lib/types";

// Skilgreining reiknivélanna: heiti, lýsing, inntak og úttak sem birtast í
// yfirlitinu. Útreikningarnir sjálfir eru í src/lib/<efni>/sizing.ts og
// viðmótin í src/components/calculators/*.

export const calculators: Calculator[] = [
  {
    slug: "solarorkukerfi",
    title: "Stærð sólarorkukerfis",
    description:
      "Áætlaðu sólarsellur, rafgeymabanka og áriðil út frá orkunotkun og staðsetningu – með raunverulegum geislunargögnum fyrir Ísland.",
    icon: "sun",
    status: "live",
    inputs: [
      {
        key: "dailyKwh",
        label: "Dagleg orkunotkun",
        unit: "kWst/dag",
        placeholder: "t.d. 12",
        hint: "Sjá orkunotkunarreiknivél ef þú ert ekki viss.",
        type: "number",
      },
      {
        key: "autonomyDays",
        label: "Dagar án sólar",
        unit: "dagar",
        placeholder: "t.d. 2",
        hint: "Hversu marga daga á bankinn að duga í dimmviðri?",
        type: "number",
      },
      {
        key: "phase",
        label: "Fasar",
        type: "select",
        options: ["Einfasa", "Þriggja fasa"],
      },
      {
        key: "location",
        label: "Landshluti",
        type: "select",
        options: [
          "Höfuðborgarsvæðið",
          "Vesturland",
          "Vestfirðir",
          "Norðurland",
          "Austurland",
          "Suðurland",
        ],
      },
      {
        key: "peakKw",
        label: "Hámarksálag",
        unit: "kW",
        placeholder: "t.d. 9",
        type: "number",
      },
    ],
    outputs: [
      { label: "Sólarsellur", unit: "kWp" },
      { label: "Fjöldi 455 W sella" },
      { label: "Rafgeymabanki", unit: "kWst" },
      { label: "Fjöldi 10 kWst banka" },
      { label: "Áriðill", unit: "kVA" },
      { label: "Áætluð ársframleiðsla", unit: "kWst" },
    ],
  },
  {
    slug: "mppt",
    title: "MPPT reiknivél",
    description:
      "Finndu Victron MPPT-stýringu sem passar sellunum þínum – Voc í kulda, Vmp í hita, straumur og aflhlutfall, eftir sömu reglum og reiknivél Victron.",
    icon: "gauge",
    status: "live",
    inputs: [
      {
        key: "panelCount",
        label: "Fjöldi sella í streng",
        placeholder: "t.d. 6",
        type: "number",
      },
      {
        key: "strings",
        label: "Fjöldi strengja í hlið",
        placeholder: "t.d. 2",
        type: "number",
      },
      {
        key: "voc",
        label: "Voc sellu",
        unit: "V",
        placeholder: "t.d. 45,2",
        type: "number",
      },
      {
        key: "isc",
        label: "Isc sellu",
        unit: "A",
        placeholder: "t.d. 13,9",
        type: "number",
      },
      {
        key: "pmax",
        label: "Afl sellu",
        unit: "W",
        placeholder: "t.d. 500",
        type: "number",
      },
      {
        key: "tempCoeff",
        label: "Hitastuðull Voc",
        unit: "%/°C",
        placeholder: "t.d. -0,27",
        type: "number",
      },
      {
        key: "minTemp",
        label: "Lægsta hitastig",
        unit: "°C",
        placeholder: "t.d. -25",
        type: "number",
      },
      {
        key: "battV",
        label: "Rafgeymaspenna",
        type: "select",
        options: ["12 V", "24 V", "48 V"],
      },
    ],
    outputs: [
      { label: "Voc strengs í kulda", unit: "V" },
      { label: "Isc samtals", unit: "A" },
      { label: "Afl samtals", unit: "Wp" },
      { label: "Hleðslustraumur", unit: "A" },
      { label: "Ráðlögð MPPT stýring" },
    ],
  },
  {
    slug: "orkunotkun",
    title: "Orkunotkun",
    description:
      "Hakaðu við tækin á heimilinu eða í bústaðnum, bættu við eigin tækjum og fáðu orkuþörf á dag, mánuði og ári ásamt hámarksálagi.",
    icon: "bolt",
    status: "live",
    inputs: [
      {
        key: "device",
        label: "Tæki",
        type: "select",
        options: [
          "Ísskápur",
          "Frystikista",
          "Varmadæla",
          "Kaffivél",
          "Örbylgjuofn",
          "Ljós (LED)",
          "Sjónvarp",
          "Tölva",
          "Þvottavél",
          "Annað",
        ],
      },
      { key: "watts", label: "Afl", unit: "W", placeholder: "t.d. 150", type: "number" },
      {
        key: "hours",
        label: "Notkun á dag",
        unit: "klst",
        placeholder: "t.d. 8",
        type: "number",
      },
      { key: "qty", label: "Fjöldi", placeholder: "1", type: "number" },
    ],
    outputs: [
      { label: "Dagleg orkuþörf", unit: "kWst" },
      { label: "Hámarksálag", unit: "W" },
      { label: "Mánaðarleg orkuþörf", unit: "kWst" },
    ],
  },
  {
    slug: "rafgeymar",
    title: "Rafgeymabanki",
    description:
      "Reiknaðu nýtanlega orku, keyrslutíma og hversu marga rafgeyma þarf fyrir tiltekið álag.",
    icon: "battery",
    status: "live",
    inputs: [
      {
        key: "battType",
        label: "Rafgeymir",
        type: "select",
        options: [
          "Bláorku 51,2 V 200 Ah LiFePO4",
          "Bláorku 51,2 V 100 Ah LiFePO4",
          "Bláorku 25,6 V 230 Ah LiFePO4",
          "Bláorku 12,8 V 460 Ah LiFePO4",
          "Bláorku 12,8 V 230 Ah LiFePO4",
          "Bláorku 12,8 V 100 Ah LiFePO4",
          "Annar",
        ],
      },
      { key: "count", label: "Fjöldi", placeholder: "t.d. 2", type: "number" },
      {
        key: "dod",
        label: "Afhleðsludýpt",
        unit: "%",
        placeholder: "80",
        type: "number",
      },
      {
        key: "load",
        label: "Meðalálag",
        unit: "W",
        placeholder: "t.d. 600",
        type: "number",
      },
    ],
    outputs: [
      { label: "Heildarorka", unit: "kWst" },
      { label: "Nýtanleg orka", unit: "kWst" },
      { label: "Keyrslutími við álag", unit: "klst" },
      { label: "Hámarks afhleðslustraumur", unit: "A" },
    ],
  },
  {
    slug: "kaplar",
    title: "Kapalstærð",
    description:
      "Finndu rétt þversnið á DC köplum út frá straumi, lengd og leyfilegu spennufalli.",
    icon: "cable",
    status: "live",
    inputs: [
      { key: "current", label: "Straumur", unit: "A", placeholder: "t.d. 200", type: "number" },
      {
        key: "voltage",
        label: "Spenna",
        type: "select",
        options: ["12 V", "24 V", "48 V"],
      },
      {
        key: "length",
        label: "Lengd (önnur leið)",
        unit: "m",
        placeholder: "t.d. 3",
        type: "number",
      },
      {
        key: "maxDrop",
        label: "Leyfilegt spennufall",
        unit: "%",
        placeholder: "2",
        type: "number",
      },
    ],
    outputs: [
      { label: "Lágmarksþversnið", unit: "mm²" },
      { label: "Ráðlagður kapall", unit: "mm²" },
      { label: "Spennufall", unit: "V" },
      { label: "Öryggi", unit: "A" },
    ],
  },
];
