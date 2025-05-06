export default {
  locales: {
    en: "Английский",
    ru: "Русский",
  },
  settings: {
    audioSettings: {
      title: "Настройки аудио",
      description: "Выберите микрофон для тюнера",
      availableDevices: "Доступные устройства",
      microphoneLabel: "Микрофон ({id})",
      selectMicrophone: "Выбрать микрофон",
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

  general: {
    hertz: "Гц",
  },
};
