import { beforeEach, describe, expect, it, vi } from "vitest";

const memory = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: async (key: string) => memory.get(key) ?? null,
    setItem: async (key: string, value: string) => { memory.set(key, value); },
  },
}));

import { APPEARANCE_STORAGE_KEY, loadAppearancePreference, saveAppearancePreference } from "../lib/appearance-storage";

const themeConfig = require("../theme.config.js");

function luminance(hex: string) {
  const values = hex.slice(1).match(/.{2}/g)?.map((part) => parseInt(part, 16) / 255) ?? [];
  const linear = values.map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first: string, second: string) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("appearance preference and contrast", () => {
  beforeEach(() => memory.clear());

  it("persists and rejects invalid appearance preferences", async () => {
    expect(await loadAppearancePreference()).toBeNull();
    await saveAppearancePreference("dark");
    expect(memory.get(APPEARANCE_STORAGE_KEY)).toBe("dark");
    expect(await loadAppearancePreference()).toBe("dark");
    memory.set(APPEARANCE_STORAGE_KEY, "system");
    expect(await loadAppearancePreference()).toBeNull();
  });

  it("keeps body text and primary-action labels at accessible contrast levels", () => {
    const colors = themeConfig.themeColors;
    expect(contrast(colors.foreground.light, colors.background.light)).toBeGreaterThanOrEqual(7);
    expect(contrast(colors.foreground.dark, colors.background.dark)).toBeGreaterThanOrEqual(7);
    expect(contrast(colors.onPrimary.light, colors.primary.light)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.onPrimary.dark, colors.primary.dark)).toBeGreaterThanOrEqual(4.5);
  });
});
