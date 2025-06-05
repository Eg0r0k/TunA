import ru from "@/i18n/locales/ru";
import en from "@/i18n/locales/en";
import zh from "@/i18n/locales/zh";
import es from "@/i18n/locales/es";
import fr from "@/i18n/locales/fr";

export const messages = {
  en,
  ru,
  zh,
  es,
  fr,
} as const;

export type SupportedLocale = keyof typeof messages;
