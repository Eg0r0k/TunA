import { useNavigatorLanguage, useStorage } from "@vueuse/core";
import { createI18n } from "vue-i18n";
import { DEFAULT_LOCALE } from "@/constants/tuner";
import { isSupportedLocale, setHtmlLangAttribute } from "@/lib/localeUtils";
import { type SupportedLocale, messages } from "./messages";

type MessageSchema = (typeof messages)["en"];

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
  messages,
});
