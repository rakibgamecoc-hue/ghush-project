import { useCallback, useEffect, useState } from "react";
import { LANGUAGE_OPTIONS, type SupportedLanguage } from "@/lib/translations";

const STORAGE_KEY = "rasuah-language-v1";

export function getStoredLanguage(): SupportedLanguage | null {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value && LANGUAGE_OPTIONS.some((option) => option.value === value)) {
      return value as SupportedLanguage;
    }
  } catch {
    // Storage may be unavailable in private browsing.
  }

  return null;
}

export function storeLanguage(language: SupportedLanguage): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Ignore write failures.
  }
}

export function useLanguagePreference(defaultLanguage: SupportedLanguage = "ms") {
  // Render the same default on the server and first browser render.
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);

  useEffect(() => {
    const stored = getStoredLanguage();
    if (!stored) return;
    const timer = window.setTimeout(() => setLanguageState(stored), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((value: SupportedLanguage) => {
    setLanguageState(value);
    storeLanguage(value);
  }, []);

  return [language, setLanguage] as const;
}
