export default {
  locales: {
    en: "Английский",
    ru: "Русский",
  },
  errors: {
    microphoneNotFound: "Микрофон не найден",
    microphonePermissionDenied: "Доступ к микрофону запрещён",
    errotToaccessMicrophone: "Ошибка доступа к микрофону",
    unknownError: "Неизвестная ошибка",
    mediaApiError: "API MediaDevices не поддерживается вашим устройством",
  },
  settings: {
    audioSettings: {
      title: "Настройки аудио",
      description: "Выберите микрофон для тюнера",
      availableDevices: "Доступные устройства",
      microphoneLabel: "Микрофон ({id})",
      selectMicrophone: "Выбрать микрофон",
      noDevices:
        "Использование аудио отключено или аудио устройства отсутствуют",
    },
    a4Calibration: {
      title: "Калибровка A4",
      description: "Установите опорную частоту для ноты A4 (Гц)",
    },
    themeSettings: {
      title: "Настройки темы",
      description: "Выберите цветовую схему",
    },
    theme: {
      light: "Светлая",
      dark: "Тёмная",
      system: "Системная",
    },
    language: {
      title: "Настройки языка",
      description: "Выберите язык приложения",
    },
  },

  about: {
    title: "О приложении",
    version: "Версия приложения",
    links: "Ссылки",
    github: "GitHub",
    copyright: "© {year} TunA. Все права НЕ защищены. ⊂(◉‿◉)つ",
  },
  notFound: {
    error: " [ERROR 0x0000001A] Рессурс не найден",
    button: "<-- ВОЗВРАТ К ИНДЕКСУ",
  },
  tuner: {
    selectInstrument: "Выберите инструмент",
    selectTuning: "Выберите настройку",
    start: "Запустить тюнер",
    stop: "Остановить тюнер",
    status: {
      inTune: "В строю",
      tuneDown: "Настрой ниже",
      tuneUp: "Настрой выше",
      tooHigh: "Слишком высоко",
      tooLow: "Слишком низко",
      wrongString: "Не та струна",
      default: "-",
    },
    frequency: "[ {frequency} ] Гц",
    instrumentDialog: {
      title: "Выберите инструмент и настройку",
      description: "Выберите инструмент и предпочтительную настройку",
    },
  },
  window: {
    minimize: "Свернуть",
    maximize: "Развернуть",
    restore: "Свернуть в окно",
    close: "Закрыть",
  },
  navigation: {
    home: "Главная",
    settings: "Настройки",
  },
  general: {
    unknown: "Неизвестно",
    hertz: "Гц",
  },
};
