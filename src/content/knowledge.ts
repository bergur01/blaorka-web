import type { KnowledgeArticle } from "@/lib/types";

// Fróðleikur – efni að hluta byggt á núverandi blaorka.is/frodleikur.

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "solarsellur",
    image: "/gallery/43.webp",
    title: "Sólarsellur",
    summary:
      "Hvað eru sólarsellur, hvernig framleiða þær rafmagn og hvað þarf að hafa í huga við val?",
    icon: "panel",
    readingMinutes: 5,
    sections: [
      {
        heading: "Hvað eru sólarsellur?",
        paragraphs: [
          "Sólarsellur eða ljósspennurafhlöð (e. photovoltaic cells) eru búnaður sem breyta sólarljósi (ljósorku) yfir í raforku með hjálp hálfleiðara. Í kristöllum hálfleiðara er að finna rafeindir sem gleypa ljóseindir sólargeislanna við rétt skilyrði og mynda rafstraum.",
          "Sólarsella, eins og tíðkast hefur að kalla þær á íslensku, er í raun samsett úr mörgum litlum ljósspennurafhlöðum. Eitt ljósspennurafhlað í opinni rás getur að hámarki myndað 0,5–0,6 volta spennu.",
        ],
      },
      {
        heading: "Spenna og afl",
        paragraphs: [
          "Sólarsella (e. solar panel) er oftast samsett úr raðtengdum seríum af ljósspennurafhlöðum til þess að mynda hærri, nýtanlegri spennu. Hefðbundin spenna í opinni sólarsellurás er frá 21,6 V – 43,2 V en það fer eftir stærð panelsins og hvernig hlöðin eru innbyrðis tengd.",
          "Stærð sólarsellu er gefin upp í wöttum og voltum. Við val á sólarsellu þarf að huga að báðum tölum. Það gengur ekki að vera með minni spennu en kerfið sem á að tengja við, en það er í góðu lagi að spennan sé hærri – það er hlutverk sólarsellustýringarinnar að umbreyta spennunni í straum (A). Passa verður þó að Voc fari ekki yfir það sem stýringin er gefin upp fyrir.",
        ],
        bullets: [
          "Dæmi: 215 W 24 V sella með 72 hlöðum – 36 hlöð raðtengd mynda par sem er hliðtengt til að fá 24 V. Voc = 36 × 0,6 V ≈ 21,6 V.",
          "Nútíma 400–500 W sellur hafa oftast Voc á bilinu 40–50 V.",
          "Bifacial sellur nýta einnig endurkast frá baki – gott í snjó.",
        ],
      },
      {
        heading: "Hvað þarf að hafa í huga við val?",
        paragraphs: [],
        bullets: [
          "Aflstærð (W) og hversu margar sellur komast fyrir",
          "Opin spenna (Voc) og skammhlaupsstraumur (Isc) – þarf að passa við stýringu",
          "Uppsetning: þak, veggur eða grind á jörðu",
          "Stefna og halli – á Íslandi borgar sig oft brattur halli",
        ],
      },
    ],
  },
  {
    slug: "solarsellustyringar",
    image: "/photos/rafmagn-egar-u-arft-a-vi-a-halda-15a2936.webp",
    title: "Sólarsellustýringar – MPPT og PWM",
    summary:
      "Stýringin sér um að hlaða rafgeymana rétt. Hér er munurinn á MPPT og PWM útskýrður.",
    icon: "gauge",
    readingMinutes: 6,
    sections: [
      {
        heading: "Hvað er sólarsellustýring?",
        paragraphs: [
          "Sólarsellustýringar (e. solar charge controllers) eru mikilvægur hluti af sólarsellukerfum og sjá um að stjórna hleðslu og afhleðslu rafgeyma til að hámarka skilvirkni og lengja endingartíma þeirra. Þær tryggja að rafgeymar séu ekki ofhlaðnir eða tæmdir um of, sem getur skemmt þá og dregið úr afköstum kerfisins.",
        ],
      },
      {
        heading: "Hverju þarf að huga að við val?",
        paragraphs: [],
        bullets: [
          "Spennusamhæfi – stýringin þarf að passa við spennu sólarsellunnar (12 V, 24 V, 48 V) og spennu rafgeymanna.",
          "Hámarksstraumur (A) – stýringin verður að ráða við hámarksafköst sellunnar. Ef sellan gefur 20 A í hámarki ætti stýringin að þola a.m.k. 25 A.",
          "Gerð stýringar – MPPT eða PWM (sjá hér að neðan).",
          "Notkun – hús, farartæki eða iðnaður kallar á ólíkar stýringar.",
          "Aukaeiginleikar – skjár, Bluetooth, snjallstýring, VRM fjarvöktun.",
        ],
      },
      {
        heading: "MPPT (Maximum Power Point Tracking)",
        paragraphs: [
          "MPPT-stýringar eru hannaðar til að hámarka orkunýtingu með því að fylgjast með og vinna með hámarksaflpunkti sólarsellunnar. Þær taka við háspennu (t.d. 18–450 V) frá sellum og umbreyta henni í lægri spennu fyrir rafgeymana með því að auka strauminn – án þess að tapa orku.",
        ],
        bullets: [
          "90–99 % nýtni",
          "Leyfir háspennustrengi og lengri kapla",
          "Nauðsynleg fyrir stærri kerfi og íslenskar aðstæður með breytilegri birtu",
        ],
      },
      {
        heading: "PWM (Pulse Width Modulation)",
        paragraphs: [
          "PWM-stýringar virka með því að kveikja og slökkva á straumnum í púlsum. Spenna sellunnar þarf að passa við spennu rafgeymanna, og þar sem umframspenna er ekki nýtt fer töluverð orka til spillis. Þær eru ódýrari og henta litlum kerfum.",
        ],
      },
    ],
  },
  {
    slug: "rafgeymar",
    image: "/photos/oflokkaar-15a3137.webp",
    title: "Rafgeymar – LiFePO4 vs. blý",
    summary:
      "Af hverju við notum LiFePO4, hvernig kWst og Ah tengjast og hvað „hleðsluhringur“ þýðir.",
    icon: "battery",
    readingMinutes: 5,
    sections: [
      {
        heading: "LiFePO4 – litíum járn fosfat",
        paragraphs: [
          "LiFePO4 rafgeymar eru öruggasta litíumtæknin sem völ er á. Þeir eru ekki eldfimir eins og aðrar litíumgerðir, þola djúpa afhleðslu og endast í þúsundir hleðsluhringja. Það er þess vegna sem Bláorka byggir raforkubanka sína á LiFePO4.",
        ],
        bullets: [
          "6000+ hleðsluhringir við 80 % afhleðslu",
          "Um helmingi léttari en blýgeymar með sömu nýtanlegu orku",
          "Innbyggt BMS ver gegn ofhleðslu, ofhita og skammhlaupi",
          "Engin viðhaldsþörf",
        ],
      },
      {
        heading: "Ah, V og kWst",
        paragraphs: [
          "Orka rafgeymis í kílóvattstundum (kWst) er spenna × rýmd: 48 V × 200 Ah = 9,6 kWst, oftast kallað 10 kWst. Fjórir slíkir bankar gefa 40 kWst – nóg til að keyra heilt heimili í 1–2 daga án sólar.",
        ],
      },
      {
        heading: "Blýgeymar (AGM/GEL)",
        paragraphs: [
          "Blýgeymar eru ódýrari í innkaupum en má aðeins afhlaða um 50 % án þess að stytta líftíma verulega. Þeir eru þungir, endast í 300–800 hringi og þurfa vandaðri hleðslustýringu. Fyrir flest kerfi í dag er LiFePO4 hagkvæmari yfir líftímann.",
        ],
      },
    ],
  },
  {
    slug: "aridlar",
    image: "/photos/rafmagn-egar-u-arft-a-vi-a-halda-15a2925.webp",
    title: "Áriðlar og hleðslutæki",
    summary:
      "Hvernig MultiPlus breytir 48 V jafnstraumi í 230 V, og af hverju þriggja fasa kerfi þurfa þrjá.",
    icon: "wave",
    readingMinutes: 4,
    sections: [
      {
        heading: "Hvað gerir áriðill?",
        paragraphs: [
          "Áriðill (e. inverter) breytir jafnstraumi (DC) úr rafgeymum í 230 V riðstraum (AC) fyrir venjuleg heimilistæki. Tvíátta áriðlar eins og Victron MultiPlus-II eru einnig hleðslutæki – þeir hlaða rafgeymana frá rafstöð eða landtengingu og skipta sjálfkrafa yfir ef rafmagnið fer af.",
        ],
      },
      {
        heading: "Einfasa eða þriggja fasa?",
        paragraphs: [
          "Íslensk heimili eru langflest þriggja fasa. Til að keyra hús ótengt netinu setjum við því upp þrjá MultiPlus-II áriðla, einn á hvern fasa, sem vinna saman í svokölluðu 3-phase setup. Stærðirnar sem við notum oftast eru 48/5000, 48/8000 og 48/15000.",
        ],
        bullets: [
          "3× MultiPlus-II 48/5000 → 15 kVA samtals",
          "3× MultiPlus-II 48/8000 → 24 kVA samtals",
          "3× MultiPlus-II 48/15000 → 45 kVA samtals",
        ],
      },
    ],
  },
  {
    slug: "otengd-kerfi-grunnur",
    image: "/gallery/17.webp",
    title: "Ótengt kerfi frá A til Ö",
    summary:
      "Hvaða hlutar mynda sjálfstætt raforkukerfi og hvernig tala þeir saman?",
    icon: "grid",
    readingMinutes: 7,
    sections: [
      {
        heading: "Hlutar kerfisins",
        paragraphs: [
          "Ótengt kerfi samanstendur af orkugjöfum (sól, vindur, rafstöð), orkugeymslu (rafgeymar), umbreytingu (áriðlar/stýringar) og heila (GX stýrieining). Allt tengist saman á DC skinnu – Lynx Distributor – sem einnig hýsir öryggin.",
        ],
        bullets: [
          "Sólarsellur → MPPT stýring → DC skinna",
          "Vindmylla → hleðslustýring → DC skinna",
          "Rafgeymar ↔ DC skinna",
          "DC skinna → MultiPlus-II → 230 V tafla hússins",
          "Rafstöð → MultiPlus-II (AC inn) – fer sjálfkrafa í gang þegar þarf",
          "Cerbo GX fylgist með öllu og sendir gögn í VRM",
        ],
      },
      {
        heading: "Sjálfvirkni",
        paragraphs: [
          "Cerbo GX stýrieiningin fylgist með hleðslustöðu rafgeyma og ræsir rafstöðina sjálfkrafa þegar staðan fer niður fyrir sett mark – og slekkur á henni aftur þegar bankinn er fullur. Umframorku má beina í rafbílahleðslu eða hitun þannig að ekkert fari til spillis.",
        ],
      },
    ],
  },
  {
    slug: "algengar-spurningar",
    image: "/photos/komdu-vi-hja-blaorku-15a3273.webp",
    title: "Algengar spurningar",
    summary: "Stutt svör við því sem við erum oftast spurð um.",
    icon: "question",
    readingMinutes: 3,
    sections: [
      {
        heading: "Virkar sólarorka á Íslandi?",
        paragraphs: [
          "Já. Sumarmánuðina er birta nánast allan sólarhringinn og kerfin okkar framleiða þá langt umfram þörf. Yfir dimmustu vetrarmánuðina er framleiðslan lítil og þá þarf rafstöð eða vindmyllu til viðbótar í ótengdum kerfum.",
        ],
      },
      {
        heading: "Hvað endist LiFePO4 rafgeymir lengi?",
        paragraphs: [
          "Miðað við daglega notkun eru 6000 hleðsluhringir um 15+ ár. Rafgeymirinn hættir ekki að virka þá heldur minnkar rýmdin hægt niður í ~80 %.",
        ],
      },
      {
        heading: "Setjið þið kerfin upp?",
        paragraphs: [
          "Við hönnum kerfið, smíðum töfluna og forstillum búnaðinn. Uppsetning fer eftir umfangi og staðsetningu – hafðu samband og við finnum bestu leiðina.",
        ],
      },
      {
        heading: "Get ég stækkað kerfið síðar?",
        paragraphs: [
          "Já, kerfin eru mátanleg. Hægt er að bæta við rafgeymum, sellum eða MPPT stýringum eftir því sem þarfir breytast.",
        ],
      },
    ],
  },
];
