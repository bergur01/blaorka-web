import type { TeamMember } from "@/lib/types";

export const site = {
  name: "Bláorka",
  legalName: "Bláorka ehf",
  tagline: "Við lifum á rafmagni",
  description:
    "Bláorka sérhæfir sig í sólarorku, rafgeymum og sjálfstæðum raforkukerfum fyrir heimili, sumarhús, húsbíla, báta og fyrirtæki um allt land.",
  url: "https://blaorka.is",
  shopUrl: "https://blaorka.is/vefverslun/",
  email: "blaorka@blaorka.is",
  phone: "+354 583 9000",
  phoneDisplay: "583 9000",
  address: {
    street: "Fossháls 27",
    postal: "110",
    city: "Reykjavík",
  },
  social: {
    facebook: "https://facebook.com/blaorka.is",
  },
  hours: [
    { days: "Mánudagar – fimmtudagar", time: "09:00 – 17:00" },
    { days: "Föstudagar", time: "09:00 – 15:00" },
    { days: "Helgar", time: "Lokað" },
  ],
};

export const navigation = [
  { href: "/lausnir", label: "Lausnir" },
  { href: "/frodleikur", label: "Fróðleikur" },
  { href: "/reiknivelar", label: "Reiknivélar" },
  { href: "/frettir", label: "Fréttir" },
  { href: "/um-okkur", label: "Um okkur" },
  { href: "/hafa-samband", label: "Hafa samband" },
];

export const team: TeamMember[] = [
  { name: "Bergur Haukdal Ólafsson", role: "Framkvæmdastjóri" },
  { name: "Jón Kristinn Þorsteinsson", role: "Sölu- og markaðsstjóri" },
  { name: "Frímann Örn Frímannsson", role: "Sölumaður" },
];

export const stats = [
  { value: "2015", label: "starfandi síðan" },
  { value: "40 kWst", label: "stærstu rafgeymabankar okkar" },
  { value: "20 kW", label: "sólarsellur í einu kerfi" },
  { value: "3 fasa", label: "ótengd kerfi um allt land" },
];
