import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";
import { loadAppearancePreference, saveAppearancePreference } from "@/lib/appearance-storage";

type ThemeContextValue = { colorScheme: ColorScheme; setColorScheme: (scheme: ColorScheme) => void; appearanceLoaded: boolean };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);
  const [appearanceLoaded, setAppearanceLoaded] = useState(false);
  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      Object.entries(SchemeColors[scheme]).forEach(([token, value]) => root.style.setProperty(`--color-${token}`, value));
    }
  }, []);
  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    applyScheme(scheme);
    void saveAppearancePreference(scheme);
  }, [applyScheme]);
  useEffect(() => { applyScheme(colorScheme); }, [applyScheme, colorScheme]);
  useEffect(() => {
    let mounted = true;
    loadAppearancePreference().then((saved) => {
      if (!mounted) return;
      if (saved) setColorSchemeState(saved);
    }).finally(() => { if (mounted) setAppearanceLoaded(true); });
    return () => { mounted = false; };
  }, []);
  const themeVariables = useMemo(() => vars({
    "color-primary": SchemeColors[colorScheme].primary,
    "color-onPrimary": SchemeColors[colorScheme].onPrimary,
    "color-background": SchemeColors[colorScheme].background,
    "color-surface": SchemeColors[colorScheme].surface,
    "color-foreground": SchemeColors[colorScheme].foreground,
    "color-muted": SchemeColors[colorScheme].muted,
    "color-border": SchemeColors[colorScheme].border,
    "color-success": SchemeColors[colorScheme].success,
    "color-warning": SchemeColors[colorScheme].warning,
    "color-error": SchemeColors[colorScheme].error,
  }), [colorScheme]);
  const value = useMemo(() => ({ colorScheme, setColorScheme, appearanceLoaded }), [colorScheme, setColorScheme, appearanceLoaded]);
  return <ThemeContext.Provider value={value}><View style={[{ flex: 1 }, themeVariables]}>{children}</View></ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
