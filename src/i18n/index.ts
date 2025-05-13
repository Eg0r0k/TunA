import { useNavigatorLanguage, useStorage } from "@vueuse/core";
import { createI18n } from "vue-i18n";
import ru from "@/i18n/locales/ru";
import en from "@/i18n/locales/en";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/constants/tuner";
import { type SupportedLocale } from "@/types/tuner/config";

const isSupportedLocale = (locale: string): locale is SupportedLocale => {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
};

const getInitLocale = (): SupportedLocale => {
  const savedLocale = useStorage<SupportedLocale>(
    "user-locale",
    DEFAULT_LOCALE
  );

  if (savedLocale.value && isSupportedLocale(savedLocale.value)) {
    return savedLocale.value;
  }

  const { language } = useNavigatorLanguage();
  const browserLocale = language.value?.split("-")[0];

  if (browserLocale && isSupportedLocale(browserLocale)) {
    savedLocale.value = browserLocale;
    return browserLocale;
  }

  return DEFAULT_LOCALE;
};

export const i18n = createI18n({
  legacy: false,
  locale: getInitLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    en,

    ru,
  },
});
