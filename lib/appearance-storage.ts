import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ColorScheme } from "@/constants/theme";

export const APPEARANCE_STORAGE_KEY = "essay-sentinel.appearance.v1";

function isColorScheme(value: string | null): value is ColorScheme {
  return value === "light" || value === "dark";
}

export async function loadAppearancePreference(): Promise<ColorScheme | null> {
  const saved = await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY);
  return isColorScheme(saved) ? saved : null;
}

export async function saveAppearancePreference(scheme: ColorScheme): Promise<void> {
  await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, scheme);
}
