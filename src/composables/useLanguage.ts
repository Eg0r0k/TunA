import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/constants/tuner";
import { SupportedLocale } from "@/i18n/messages";
import { setHtmlLangAttribute } from "@/utils/localeUtils";
import { useStorage } from "@vueuse/core";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

export const useLanguage = () => {
  const i18n = useI18n();
  const storedLocale = useStorage<SupportedLocale>(
    "user-locale",
    DEFAULT_LOCALE
  );

  const currentLocale = computed<SupportedLocale>({
    get() {
      return storedLocale.value;
    },
    set(newLocale: SupportedLocale) {
      storedLocale.value = newLocale;
      i18n.locale.value = newLocale;
      setHtmlLangAttribute(newLocale);
    },
  });

  return {
    currentLocale,
    supportedLocale: SUPPORTED_LOCALES,
  };
};
