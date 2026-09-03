// Staðir á Íslandi fyrir sólarorkureiknivélina.
// Hnit eru notuð til að sækja geislunargögn úr PVGIS (JRC, ESB).

export interface SolarLocation {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
}

export const solarLocations: SolarLocation[] = [
  { id: "reykjavik", name: "Reykjavík", region: "Höfuðborgarsvæðið", lat: 64.13, lon: -21.9 },
  { id: "keflavik", name: "Reykjanesbær", region: "Suðurnes", lat: 64.0, lon: -22.56 },
  { id: "selfoss", name: "Selfoss", region: "Suðurland", lat: 63.93, lon: -21.0 },
  { id: "vik", name: "Vík í Mýrdal", region: "Suðurland", lat: 63.42, lon: -19.01 },
  { id: "vestmannaeyjar", name: "Vestmannaeyjar", region: "Suðurland", lat: 63.44, lon: -20.27 },
  { id: "hofn", name: "Höfn í Hornafirði", region: "Austurland", lat: 64.25, lon: -15.2 },
  { id: "egilsstadir", name: "Egilsstaðir", region: "Austurland", lat: 65.26, lon: -14.39 },
  { id: "akureyri", name: "Akureyri", region: "Norðurland", lat: 65.68, lon: -18.09 },
  { id: "husavik", name: "Húsavík", region: "Norðurland", lat: 66.04, lon: -17.34 },
  { id: "saudarkrokur", name: "Sauðárkrókur", region: "Norðurland", lat: 65.75, lon: -19.64 },
  { id: "isafjordur", name: "Ísafjörður", region: "Vestfirðir", lat: 66.07, lon: -23.12 },
  { id: "patreksfjordur", name: "Patreksfjörður", region: "Vestfirðir", lat: 65.59, lon: -23.99 },
  { id: "stykkisholmur", name: "Stykkishólmur", region: "Vesturland", lat: 65.07, lon: -22.73 },
  { id: "borgarnes", name: "Borgarnes", region: "Vesturland", lat: 64.54, lon: -21.92 },
  { id: "custom", name: "Önnur hnit…", region: "", lat: 64.13, lon: -21.9 },
];

export const defaultLocation = solarLocations[0];
