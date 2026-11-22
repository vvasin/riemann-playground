import i18next, { type TOptions } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { en } from "./en";
import { ru } from "./ru";

export const LANGUAGES = ["en", "ru"] as const;
export type Language = (typeof LANGUAGES)[number];

const STORAGE_KEY = "language";
const LOCALES: Record<Language, string> = { en: "en-US", ru: "ru-RU" };

void i18next.use(LanguageDetector).init({
  resources: { en: { translation: en }, ru: { translation: ru } },
  supportedLngs: LANGUAGES,
  nonExplicitSupportedLngs: true,
  load: "languageOnly",
  fallbackLng: "en",
  initAsync: false,
  interpolation: { escapeValue: false },
  detection: {
    order: ["querystring", "localStorage", "navigator"],
    lookupQuerystring: "lang",
    lookupLocalStorage: STORAGE_KEY,
    caches: [],
  },
});

export const t = (key: string, options: TOptions = {}): string => i18next.t(key, options);

export const language = (): Language =>
  LANGUAGES.find((lng) => lng === i18next.resolvedLanguage) ?? "en";

export const locale = (): string => LOCALES[language()];

export function setLanguage(lng: Language): Promise<unknown> {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    // Storage can be unavailable; the choice then lasts for this visit only.
  }
  return i18next.changeLanguage(lng);
}

export function onLanguageChange(handler: () => void): void {
  i18next.on("languageChanged", handler);
}
