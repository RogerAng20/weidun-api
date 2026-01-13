import React, { createContext, useContext, useState } from "react";

type Lang = "en" | "ms" | "zh";
type Site = "A" | "B" | "C" | "ALL";

type AppState = {
  lang: Lang;
  site: Site;
  setLang: (l: Lang) => void;
  setSite: (s: Site) => void;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [site, setSite] = useState<Site>("A");

  return (
    <AppContext.Provider value={{ lang, site, setLang, setSite }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return ctx;
}
