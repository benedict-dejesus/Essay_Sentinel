import { beforeEach, describe, expect, it, vi } from "vitest";

const memory = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => memory.get(key) ?? null,
    setItem: async (key: string, value: string) => { memory.set(key, value); },
  },
}));

import { analyzeEssay } from "../shared/essay-analysis";
import { getReview, listReviews, removeReview, saveReview } from "../lib/review-storage";

describe("saved review storage", () => {
  beforeEach(() => memory.clear());

  it("removes a saved review and its locally retained essay text", async () => {
    const analysis = analyzeEssay("### Draft response\n\nIt is crucial to connect one concrete example to the main claim before making a conclusion.");
    const saved = await saveReview({
      ...analysis,
      title: "Draft response",
      studentReference: "Student 14",
      sourceName: "Pasted text",
      text: "### Draft response\n\nIt is crucial to connect one concrete example to the main claim before making a conclusion.",
    });

    expect((await listReviews())).toHaveLength(1);
    expect((await getReview(saved.id))?.title).toBe("Draft response");

    await removeReview(saved.id);

    expect(await getReview(saved.id)).toBeNull();
    expect(await listReviews()).toHaveLength(0);
  });
});
