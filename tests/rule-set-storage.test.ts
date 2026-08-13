import { beforeEach, describe, expect, it, vi } from "vitest";

const memory = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => memory.get(key) ?? null,
    setItem: async (key: string, value: string) => { memory.set(key, value); },
  },
}));

import { deleteRuleSet, getActiveRuleSet, listRuleSets, saveRuleSet, setActiveRuleSet } from "../lib/rule-set-storage";
import { ALL_BASELINE_RULE_IDS, SYSTEM_DEFAULT_RULE_SET } from "../shared/rule-sets";

describe("assignment rule-set storage", () => {
  beforeEach(() => memory.clear());

  it("normalizes, persists, selects, and deletes a local assignment rule set", async () => {
    const saved = await saveRuleSet({
      name: "  Lab reflection  ",
      description: "A science reflection profile",
      enabledBaseRuleIds: [ALL_BASELINE_RULE_IDS[0]],
      customPhrases: ["based on my results", "Based on my results", "x", "a phrase that is valid"],
    });

    expect(saved.name).toBe("Lab reflection");
    expect(saved.customPhrases).toEqual(["Based on my results", "a phrase that is valid"]);
    expect((await listRuleSets()).some((set) => set.id === saved.id)).toBe(true);
    expect((await getActiveRuleSet()).id).toBe(saved.id);

    await setActiveRuleSet(SYSTEM_DEFAULT_RULE_SET.id);
    await deleteRuleSet(saved.id);
    expect((await getActiveRuleSet()).id).toBe(SYSTEM_DEFAULT_RULE_SET.id);
    expect((await listRuleSets()).some((set) => set.id === saved.id)).toBe(false);
  });
});
