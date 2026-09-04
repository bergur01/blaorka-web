import type { NodeId } from "./diagram";

export interface NodeInfo {
  title: string;
  text: string;
  facts: string[];
  href?: string;
  hrefLabel?: string;
}

/** Skýringar sem birtast þegar smellt er á hluta myndarinnar. */
export const NODE_INFO: Record<NodeId, NodeInfo> = {
  sol: {
    title: "Sólin á Íslandi",
    text: "Ísland fær álíka mikla sólargeislun á ári og norðurhluti Þýskalands – en hún dreifist allt öðruvísi. Frá apríl til ágúst er birtan nánast samfelld, í desember eru fáeinar klukkustundir af lágri sól.",
    facts: [
      "Sumarsólstöður: sólin er á lofti í ~21 klst",
      "Desember: 4–5 klst og sólin fer aldrei hátt",
      "Kaldar sellur skila meiru – íslenskt sumar hentar sólarsellum vel",
    ],
    href: "/frodleikur/solarsellur",
    hrefLabel: "Lesa um sólarsellur",
  },
  sellur: {
    title: "Sólarsellur",
    text: "Sellurnar breyta birtu í jafnstraum. Uppsett afl er mælt í kWp (kílóvatt-toppafl) við staðalskilyrði; raunframleiðslan ræðst af birtu, halla, stefnu og hitastigi.",
    facts: [
      "Bláorku sella: 455 W, 1762 × 1134 mm (≈ 2 m²)",
      "Halli 15° nýtir sumarsólina, 60–90° vetrarsólina og snjórinn rennur af",
      "Í Reykjavík skilar hvert kWp um 700–750 kWst á ári í suður",
    ],
    href: "/frodleikur/solarsellur",
    hrefLabel: "Lesa um sólarsellur",
  },
  mppt: {
    title: "MPPT sólarsellustýring",
    text: "Stýringin fylgir hámarksaflspunkti sellanna og breytir spennunni niður í hleðsluspennu rafgeymisins. MPPT nær 20–30 % meiri orku úr sömu sellum en einföld PWM-stýring.",
    facts: [
      "Victron SmartSolar – Bluetooth og VE.Direct í Cerbo",
      "Sellurnar mega vera á mun hærri spennu en rafgeymirinn",
      "Kalt og bjart veður gefur hæstu spennuna – hún ræður stærðarvalinu",
    ],
    href: "/frodleikur/solarsellustyringar",
    hrefLabel: "MPPT eða PWM?",
  },
  mylla: {
    title: "Vindmylla",
    text: "Vindmyllan er fullkomin viðbót við sólina á Íslandi: hún framleiðir mest þegar sólin gerir það ekki – á veturna, í lægðum og um nætur. Aflið vex með vindhraðanum í þriðja veldi.",
    facts: [
      "Tvöfaldur vindhraði = áttfalt afl",
      "Byrjar að skila um 3 m/s, nær nafnafli um 12 m/s",
      "Slórfell: 800 W mylla vinnur með 11 kW sellum og 60 kWst rafgeymum",
    ],
    href: "/frodleikur/otengd-kerfi-grunnur",
    hrefLabel: "Ótengt kerfi frá A til Ö",
  },
  vindstyring: {
    title: "Vindstýring og álagsviðnám",
    text: "Vindmylla má aldrei snúast álagslaus. Stýringin hleður rafgeyminn og setur umframorkuna í álagsviðnám (dump load) þegar hann er fullur – þannig heldur myllan alltaf bremsu.",
    facts: [
      "Bremsar mylluna sjálfkrafa í óveðri",
      "Umframorkan getur farið í hitakút í stað þess að tapast",
      "Sérstakur SmartShunt mælir framlag myllunnar í VRM",
    ],
  },
  dc: {
    title: "DC dreifing",
    text: "Allt safnast á 48 volta jafnstraumsteininn: sellur, vindmylla, rafgeymar og áriðill. Hér eru varnarrofar, öryggi og straummælar – hjartað í ótengdu kerfi.",
    facts: [
      "48 V þýðir fjórfalt minni straum en 12 V fyrir sama afl",
      "Minni straumur = grennri kaplar og minna tap",
      "Lynx-teinar gera kerfið einfalt að stækka",
    ],
    href: "/frodleikur/otengd-kerfi-grunnur",
    hrefLabel: "Ótengt kerfi frá A til Ö",
  },
  rafgeymir: {
    title: "LiFePO4 rafgeymar",
    text: "Rafgeymirinn geymir sólina fram á kvöld og vindinn fram á logn. Litíumjárnfosfat þolir djúpa afhleðslu, þúsundir hleðslulota og skilar nánast öllu sem sett er inn.",
    facts: [
      "Bláorku bankar: 48 V / 200 Ah ≈ 10 kWst hver",
      "Nýtanleg dýpt 80–90 % – blýgeymir þolir 50 %",
      "BMS talar við Cerbo og ver geyminn í frosti og hita",
    ],
    href: "/frodleikur/rafgeymar",
    hrefLabel: "LiFePO4 vs. blý",
  },
  multiplus: {
    title: "MultiPlus-II áriðill",
    text: "Áriðillinn breytir 48 V jafnstraumi í 230 V riðstraum fyrir öll venjuleg tæki – og virkar á hinn veginn líka: hann hleður rafgeyminn af rafstöð eða neti þegar á þarf að halda.",
    facts: [
      "PowerAssist: rafgeymirinn hjálpar lítilli rafstöð yfir álagstoppa",
      "Hreinn sínus – öruggur fyrir tölvur, dælur og fjarskiptabúnað",
      "Stærðin ræðst af hámarksálagi, ekki af dagsnotkun",
    ],
    href: "/frodleikur/aridlar",
    hrefLabel: "Áriðlar og hleðslutæki",
  },
  cerbo: {
    title: "Cerbo GX",
    text: "Heilinn í kerfinu. Cerbo les alla íhlutina, stýrir hleðslu og ræsingu rafstöðvar, og sendir gögnin í VRM-vefgáttina svo hægt sé að fylgjast með kerfinu hvaðan sem er.",
    facts: [
      "Ræsir rafstöð sjálfkrafa við valda hleðslustöðu",
      "VRM: rauntímamælingar og söguleg gögn í símanum",
      "Fjarstýring og uppfærslur án þess að fara á staðinn",
    ],
  },
  hus: {
    title: "Notkunin",
    text: "Notkunin ræður öllu um stærð kerfisins. Á Íslandi er hitinn stærsti liðurinn – varmadæla ein og sér getur verið 15–20 kWst á dag, meira en allt annað til samans.",
    facts: [
      "Ísskápur og frystir: ~2 kWst á dag allan sólarhringinn",
      "Rafmagnshitakútur: ~4 kWst á dag fyrir 2–4",
      "Sparneytin tæki eru ódýrari en fleiri sólarsellur",
    ],
    href: "/reiknivelar/orkunotkun",
    hrefLabel: "Reikna eigin notkun",
  },
  rafbill: {
    title: "Rafbíllinn",
    text: "Bíllinn er stærsta einstaka álagið á heimilinu – en líka sveigjanlegasta. Ef hann hleðst þegar sólin skín nýtist orka sem annars færi til spillis; ef hann hleðst um nótt tæmir hann rafgeyminn.",
    facts: [
      "1 kWst ≈ 5–6 km akstur",
      "Sólarhleðsla: bíllinn tekur bara umframorku",
      "Hleðslustýring getur fylgt sólinni sjálfkrafa",
    ],
  },
  varaafl: {
    title: "Varaafl",
    text: "Í íslenskum vetri dugar hvorki sól né vindur alltaf. Rafstöð sem ræsist sjálfkrafa við lága hleðslustöðu keyrir í fáeina tíma í senn – eða þá að kerfið er nettengt og sækir afganginn þangað.",
    facts: [
      "Sjálfvirk ræsing við 20 % hleðslu, keyrir 1–2 tíma",
      "Rafstöð sem hleður rafgeymi keyrir á góðu álagi og eyðir minna",
      "Slórfell: olíunotkun fór úr 12.000 í 6.000 lítra á ári",
    ],
    href: "/frettir",
    hrefLabel: "Sjá Slórfellsverkefnið",
  },
};
