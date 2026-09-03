// Sameiginlegar týpur fyrir efni vefsins.
// Þegar gagnagrunnur kemur inn verða þessar týpur speglaðar í schema (t.d. Prisma).

export type NewsCategory =
  | "Verkefni"
  | "Húsbílar"
  | "Fjarskipti"
  | "Vörur"
  | "Tilkynningar";

export interface NewsPost {
  slug: string;
  title: string;
  /** ISO dagsetning, YYYY-MM-DD */
  date: string;
  excerpt: string;
  /** Málsgreinar – ein færsla per línu. Verður ríkt efni (markdown/blocks) síðar. */
  body: string[];
  /** Slóðir í /public */
  images: string[];
  category: NewsCategory;
  /** Ytri tenglar, t.d. umfjöllun fjölmiðla */
  links?: { label: string; url: string }[];
}

export interface Solution {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  icon: IconName;
  highlights: string[];
  /** Dæmigerður búnaður í svona kerfi */
  equipment: string[];
  /** Slóðir á fréttir sem sýna svona kerfi */
  relatedNews?: string[];
  image?: string;
  /** Auðkenni mynda úr galleríi */
  gallery?: string[];
}

export interface KnowledgeArticle {
  slug: string;
  title: string;
  summary: string;
  icon: IconName;
  readingMinutes: number;
  /** Forsíðumynd greinar */
  image?: string;
  sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
}

export interface CalculatorField {
  key: string;
  label: string;
  unit?: string;
  placeholder?: string;
  hint?: string;
  type: "number" | "select";
  options?: string[];
}

export interface Calculator {
  slug: string;
  title: string;
  description: string;
  icon: IconName;
  status: "live" | "soon";
  inputs: CalculatorField[];
  /** Niðurstöður sem reiknivélin mun skila */
  outputs: { label: string; unit?: string }[];
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  category: "uti" | "heimili" | "tafla" | "rafgeymar" | "fjarskipti" | "husbill" | "verkstaedi";
}

export interface TeamMember {
  name: string;
  role: string;
  email?: string;
}

export type IconName =
  | "sun"
  | "battery"
  | "bolt"
  | "home"
  | "van"
  | "tower"
  | "grid"
  | "panel"
  | "wave"
  | "cable"
  | "gauge"
  | "wind"
  | "question";
