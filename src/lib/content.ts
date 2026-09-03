// Gagnaaðgangslag.
//
// Allar síður sækja efni í gegnum þessar föll – aldrei beint úr seed-skránum.
// Föllin eru async svo hægt sé að skipta seed-gögnum út fyrir gagnagrunn
// (Postgres/Prisma, Supabase o.s.frv.) án þess að snerta síðurnar sjálfar.

import { newsSeed } from "@/content/news";
import { solutions } from "@/content/solutions";
import { knowledgeArticles } from "@/content/knowledge";
import { calculators } from "@/content/calculators";
import { galleryImages } from "@/content/gallery";
import type {
  Calculator,
  GalleryImage,
  KnowledgeArticle,
  NewsPost,
  Solution,
} from "./types";

const byDateDesc = (a: NewsPost, b: NewsPost) => (a.date < b.date ? 1 : -1);

export async function getAllNews(): Promise<NewsPost[]> {
  return [...newsSeed].sort(byDateDesc);
}

export async function getLatestNews(limit = 3): Promise<NewsPost[]> {
  return (await getAllNews()).slice(0, limit);
}

export async function getNewsBySlug(slug: string): Promise<NewsPost | null> {
  return newsSeed.find((p) => p.slug === slug) ?? null;
}

export async function getNewsCategories(): Promise<string[]> {
  return Array.from(new Set(newsSeed.map((p) => p.category)));
}

export async function getSolutions(): Promise<Solution[]> {
  return solutions;
}

export async function getSolutionBySlug(slug: string): Promise<Solution | null> {
  return solutions.find((s) => s.slug === slug) ?? null;
}

export async function getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
  return knowledgeArticles;
}

export async function getKnowledgeBySlug(
  slug: string,
): Promise<KnowledgeArticle | null> {
  return knowledgeArticles.find((a) => a.slug === slug) ?? null;
}

export async function getCalculators(): Promise<Calculator[]> {
  return calculators;
}

export async function getCalculatorBySlug(
  slug: string,
): Promise<Calculator | null> {
  return calculators.find((c) => c.slug === slug) ?? null;
}

export async function getGallery(category?: GalleryImage["category"]): Promise<GalleryImage[]> {
  return category ? galleryImages.filter((g) => g.category === category) : galleryImages;
}

export async function getGalleryByIds(ids: string[]): Promise<GalleryImage[]> {
  return ids.map((id) => galleryImages.find((g) => g.id === id)).filter((g): g is GalleryImage => !!g);
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("is-IS", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}
