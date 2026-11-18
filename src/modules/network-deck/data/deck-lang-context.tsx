import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { networkDeckContentEn } from "./network-deck-content-en";
import type { NetworkDeckContent } from "./network-deck-content.types";
import { networkDeckContentEs } from "./network-deck-content";

export type DeckLang = "en" | "es";

interface DeckLangContextValue {
  lang: DeckLang;
  toggleLang: () => void;
  content: NetworkDeckContent;
}

const DeckLangContext = createContext<DeckLangContextValue | null>(null);

export function DeckLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<DeckLang>("en");

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "es" : "en"));
  }, []);

  const content = lang === "en" ? networkDeckContentEn : networkDeckContentEs;

  return (
    <DeckLangContext.Provider value={{ lang, toggleLang, content }}>
      {children}
    </DeckLangContext.Provider>
  );
}

export function useDeckContent() {
  const ctx = useContext(DeckLangContext);
  if (!ctx) throw new Error("useDeckContent must be used within DeckLangProvider");
  return ctx;
}
