import type { Solution } from "@/lib/types";

export const solutions: Solution[] = [
  {
    slug: "heimili-og-sumarhus",
    title: "Heimili & sumarhús",
    tagline: "Sólarorka sem borgar sig – og heldur ljósunum kveiktum í rafmagnsleysi.",
    description:
      "Við hönnum og setjum upp sólarorkukerfi með rafgeymum fyrir heimili og sumarhús. Kerfin nýta sólina þegar hún skín, geyma orkuna í LiFePO4 rafgeymum og grípa sjálfkrafa inn í ef rafmagnið fer af.",
    icon: "home",
    highlights: [
      "Sjálfvirk varaaflslausn – heimilið finnur ekki fyrir rafmagnsleysi",
      "Minni raforkukaup með eigin framleiðslu",
      "Stækkanleg kerfi – bættu við sellum eða rafgeymum síðar",
      "Fjarvöktun í appi (Victron VRM)",
    ],
    equipment: [
      "Sólarsellur 400–500 W",
      "MPPT sólarsellustýring",
      "MultiPlus-II áriðill/hleðslutæki",
      "Bláorku LiFePO4 rafgeymar",
      "Cerbo GX stýrieining",
    ],
    relatedNews: ["siglufjordur", "thriggja-fasa-hus-med-solarorku"],
    image: "/news/siglufjordur-7c5fb1.webp",
  },
  {
    slug: "otengd-kerfi",
    title: "Ótengd kerfi (off-grid)",
    tagline: "Fullt þriggja fasa rafmagn – hvar sem er á landinu.",
    description:
      "Fyrir staði sem ekki eru tengdir raforkunetinu smíðum við sjálfstæð kerfi sem sameina sól, vind og rafstöð. Kerfið stýrir sjálft hvenær rafstöðin fer í gang og nýtir alla umframorku, til dæmis í rafbílahleðslu eða hitun.",
    icon: "grid",
    highlights: [
      "Einfasa eða þriggja fasa – allt að 45 kVA og meira",
      "Sól, vindur og rafstöð vinna saman sjálfvirkt",
      "Rafgeymabankar frá 10 kWst upp í 40+ kWst",
      "Reynsla af eyjum, fjalllendi og afskekktum stöðum",
    ],
    equipment: [
      "3x MultiPlus-II 48/8000–15000",
      "MPPT RS 450/200 stýringar",
      "Bláorku LiFePO4 48 V rafgeymar",
      "Lynx Distributor dreifiskinnur",
      "Cerbo GX + Touch 70 skjár",
      "Vindmylla / rafstöð eftir aðstæðum",
    ],
    relatedNews: ["eyja-i-breidafirdi", "sunnanverdir-vestfirdir"],
    image: "/news/eyja-i-breidafirdi-5f2307.webp",
  },
  {
    slug: "husbilar-og-batar",
    title: "Húsbílar & bátar",
    tagline: "Sjálfbær ferðalög – án þess að leita að rafmagni.",
    description:
      "Við smíðum heildarkerfi í húsbíla, ferðavagna og báta: LiFePO4 rafgeymar, áriðlar, DC-DC hleðsla frá alternator og sólarsellur á þaki. Allt tengt, stillt og prófað áður en það fer út úr húsi.",
    icon: "van",
    highlights: [
      "230 V rafmagn hvar sem er – kaffivél, örbylgjuofn, tölva",
      "Hleðsla frá sól, alternator og landtengingu",
      "Létt og fyrirferðarlítið samanborið við blýgeyma",
      "Plug n' Play töflur með tengiteikningu",
    ],
    equipment: [
      "12,8 V eða 25,6 V LiFePO4 rafgeymar",
      "MultiPlus-II 12/3000 eða 24/3000",
      "Orion XS DC-DC hleðslutæki",
      "SmartSolar MPPT stýring",
      "Lynx Distributor + Cerbo GX",
    ],
    relatedNews: [
      "lifepo4-lynx-multiplus-ii-kerfi-i-sprinter",
      "25-6v-lifepo4-lynx-multiplus-ii-kerfi-i-husbil",
      "alveg-sjalfbaer-ford-husbill",
    ],
    image: "/news/lifepo4-lynx-multiplus-i-24378b.webp",
  },
  {
    slug: "fyrirtaeki-og-fjarskipti",
    title: "Fyrirtæki & fjarskipti",
    tagline: "Áreiðanleg orka fyrir fjarskiptastaði, sendamöstur og rekstur.",
    description:
      "Við höfum unnið með Neyðarlínunni, Mílu og björgunarsveitum að lausnum sem tryggja rafmagn á afskekktum fjarskiptastöðum, draga úr olíunotkun og lengja endingu búnaðar. Sömu lausnir henta fyrirtækjum sem vilja varaafl og betri nýtingu á grænni orku.",
    icon: "tower",
    highlights: [
      "Varaafl fyrir fjarskipti og öryggiskerfi",
      "Olíusparnaður – rafstöð gengur aðeins þegar þarf",
      "Fjarvöktun og viðvaranir",
      "Búnaður sem þolir íslenskt veður",
    ],
    equipment: [
      "48 V LiFePO4 rafgeymabankar",
      "MultiPlus-II / Quattro áriðlar",
      "MPPT stýringar",
      "Cerbo GX með 4G tengingu",
    ],
    relatedNews: [
      "neydarlinan-og-netberg-grimsfjall",
      "mila-betri-nyting-a-graenni-orku-og-oliusparnadur",
      "hjalparsveit-skata-kopur-1",
    ],
    image: "/news/neydarlinan-og-netberg-g-0e04aa.webp",
  },
  {
    slug: "plug-n-play-toflur",
    title: "Plug n' Play töflur",
    tagline: "Tilbúin rafmagnstafla – tengd, stillt og merkt.",
    description:
      "Í stað þess að finna upp hjólið færðu tilbúna töflu frá okkur með öllum búnaði uppsettum, ásamt nákvæmri tengiteikningu. Búnaðurinn er stilltur fyrir þínar þarfir áður en hann fer úr húsi.",
    icon: "bolt",
    highlights: [
      "Fagmannlegur frágangur – öryggi og snyrtimennska",
      "Nákvæm tengiteikning fylgir",
      "Forstillt fyrir þitt kerfi",
      "Sparar tíma við uppsetningu",
    ],
    equipment: [
      "Lynx Distributor / Power-In",
      "MultiPlus-II",
      "MPPT stýring",
      "Öryggi, rofar og skinnur",
    ],
    relatedNews: ["toflusmid-i-sprinter"],
    image: "/news/toflusmid-i-sprinter-1f1d6d.webp",
  },
  {
    slug: "raforkubankar",
    title: "Raforkubankar",
    tagline: "Bláorku LiFePO4 rafgeymar – orkugeymsla sem endist.",
    description:
      "Okkar eigin LiFePO4 rafgeymabankar, 48 V 200 Ah (10 kWst), eru hjartað í flestum kerfum sem við smíðum. Þeir þola þúsundir hleðsluhringja, eru öruggir og hægt er að raða þeim saman í 20, 30 eða 40+ kWst banka.",
    icon: "battery",
    highlights: [
      "10 kWst per eining – stækkanlegt í raðir",
      "Innbyggt BMS með Bluetooth/CAN samskiptum",
      "Þolir 6000+ hleðsluhringi",
      "Samhæft við Victron GX kerfi",
    ],
    equipment: [
      "Bláorku 48 V 200 Ah LiFePO4",
      "Bláorku 12,8 V og 25,6 V rafgeymar",
      "Lynx Distributor dreifiskinnur",
    ],
    relatedNews: ["raforkubankar"],
    image: "/news/raforkubankar-d88024.webp",
  },
];
