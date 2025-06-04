import { SUPPORTED_LOCALES } from "@/constants/tuner";
import { SupportedLocale } from "@/types/tuner/config";

export const isSupportedLocale = (
  locale: string
): locale is SupportedLocale => {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
};

export const setHtmlLangAttribute = (locale: SupportedLocale): void => {
  document.querySelector("html")?.setAttribute("lang", locale);
};
