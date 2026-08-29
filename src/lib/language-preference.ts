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
  // Use a lazy initializer so the stored preference (if available) is
  // read once during initial render. `getStoredLanguage` guards against
  // server execution by returning `null` when `window` is undefined.
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const stored = getStoredLanguage();
    return stored ?? defaultLanguage;
  });

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((value: SupportedLanguage) => {
    setLanguageState(value);
    storeLanguage(value);
  }, []);

  return [language, setLanguage] as const;
}
