import { createContext, useContext, useState, type ReactNode } from "react";
import { en } from "./translations/en";
import { bn } from "./translations/bn";

export type Lang = "en" | "bn";
export type Translations = typeof en;

const TRANSLATIONS = { en, bn } as const;

interface LanguageCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageCtx>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem("site_lang") as Lang) ?? "en"
  );

  const setLang = (l: Lang) => {
    localStorage.setItem("site_lang", l);
    setLangState(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useTranslation(): Translations {
  const { lang } = useLanguage();
  return TRANSLATIONS[lang];
}
