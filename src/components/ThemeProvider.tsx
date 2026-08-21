"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Theme, ThemeContext } from "@/shared/hooks/useTheme";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "interntrack-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const applyTheme = useCallback(
    (targetTheme: Theme) => {
      const root = document.documentElement;
      let effectiveDark = false;

      if (targetTheme === "system") {
        effectiveDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        effectiveDark = targetTheme === "dark";
      }

      if (effectiveDark) {
        root.classList.add("dark");
        setTimeout(() => setResolvedTheme("dark"), 0);
      } else {
        root.classList.remove("dark");
        setTimeout(() => setResolvedTheme("light"), 0);
      }
    },
    []
  );

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as Theme | null;
    if (saved && (saved === "light" || saved === "dark" || saved === "system")) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme(defaultTheme);
    }
  }, [storageKey, defaultTheme, applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme]);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
