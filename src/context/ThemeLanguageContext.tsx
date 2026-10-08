import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, Translations, translations } from "../lib/translations";
import { safeGetLocalStorage, safeSetLocalStorage } from "../lib/storage";

export type Theme = "light" | "dark";

interface ThemeLanguageContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export function ThemeLanguageProvider({ children }: { children: React.ReactNode }) {
  // Theme state
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = safeGetLocalStorage("raf_theme") as Theme;
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
    // Check system preference
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLang = safeGetLocalStorage("raf_lang") as Language;
    if (savedLang === "bn" || savedLang === "en") {
      return savedLang;
    }
    return "en";
  });

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
    safeSetLocalStorage("raf_theme", theme);
  }, [theme]);

  // Apply language attribute
  useEffect(() => {
    document.documentElement.lang = language;
    safeSetLocalStorage("raf_lang", language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "en" ? "bn" : "en"));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        toggleLanguage,
        setLanguage,
        t,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
}

export function useThemeLanguage() {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error("useThemeLanguage must be used within a ThemeLanguageProvider");
  }
  return context;
}
