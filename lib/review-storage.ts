import AsyncStorage from "@react-native-async-storage/async-storage";
import { analyzeEssay, type EssayReview } from "../shared/essay-analysis";

const STORAGE_KEY = "essay-sentinel.saved-reviews.v1";
const ANALYSIS_VERSION = 2;

export type SavedReview = EssayReview & {
  id: string;
  title: string;
  studentReference: string;
  sourceName: string;
  text: string;
  createdAt: string;
  analysisVersion: number;
};

function hydrateReview(review: SavedReview): SavedReview {
  if (review.analysisVersion === ANALYSIS_VERSION && review.statistics && review.recommendations && typeof review.revisionGuidanceSuggested === "boolean" && review.ruleSetId && review.ruleSetName) return review;
  return { ...review, ...analyzeEssay(review.text), analysisVersion: ANALYSIS_VERSION };
}

export async function listReviews(): Promise<SavedReview[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const reviews = stored ? (JSON.parse(stored) as SavedReview[]) : [];
    return reviews.map(hydrateReview).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function getReview(id: string): Promise<SavedReview | null> {
  const reviews = await listReviews();
  return reviews.find((review) => review.id === id) ?? null;
}

export async function saveReview(review: Omit<SavedReview, "id" | "createdAt" | "analysisVersion">): Promise<SavedReview> {
  const createdAt = new Date().toISOString();
  const saved: SavedReview = { ...review, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt, analysisVersion: ANALYSIS_VERSION };
  const existing = await listReviews();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([saved, ...existing]));
  return saved;
}

export async function removeReview(id: string): Promise<void> {
  const existing = await listReviews();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existing.filter((review) => review.id !== id)));
}
