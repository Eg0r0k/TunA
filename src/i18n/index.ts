import { useNavigatorLanguage, useStorage } from "@vueuse/core";
import { createI18n } from "vue-i18n";
import ru from "@/i18n/locales/ru";
import en from "@/i18n/locales/en";
import { DEFAULT_LOCALE } from "@/constants/tuner";
import { type SupportedLocale } from "@/types/tuner/config";
import { isSupportedLocale, setHtmlLangAttribute } from "@/lib/localeUtils";

type MessageSchema = typeof en;

const getSavedLocale = (): SupportedLocale | null => {
  const savedLocale = useStorage<SupportedLocale>(
    "user-locale",
    DEFAULT_LOCALE
  );
  return savedLocale.value && isSupportedLocale(savedLocale.value)
    ? savedLocale.value
    : null;
};
const getBrowserLocale = (): SupportedLocale | null => {
  const { language } = useNavigatorLanguage();
  const browserLocale = language.value?.split("-")[0];
  return browserLocale && isSupportedLocale(browserLocale)
    ? browserLocale
    : null;
};
const getInitialLocale = (): SupportedLocale => {
  const savedLocale = getSavedLocale();
  if (savedLocale) {
    setHtmlLangAttribute(savedLocale);
    return savedLocale;
  }

  const browserLocale = getBrowserLocale();
  if (browserLocale) {
    setHtmlLangAttribute(browserLocale);
    return browserLocale;
  }

  setHtmlLangAttribute(DEFAULT_LOCALE);
  return DEFAULT_LOCALE;
};

export const i18n = createI18n<[MessageSchema], SupportedLocale>({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    en,
    ru,
  },
});
