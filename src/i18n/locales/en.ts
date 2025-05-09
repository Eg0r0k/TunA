export default {
  locales: {
    en: "English",
    ru: "Russian",
  },
  errors: {
    microphoneNotFound: "Microphone not found",
    microphonePermissionDenied: "Microphone access denied",
    errotToaccessMicrophone: "Error accessing microphone",
    unknownError: "Unknown error",
    mediaApiError: "The MediaDevices API is not supported by your device.",
  },
  settings: {
    audioSettings: {
      title: "Audio Settings",
      description: "Select microphone for tuner",
      availableDevices: "Available Devices",
      microphoneLabel: "Microphone ({id})",
      selectMicrophone: "Select microphone",
      noDevices: "Audio usage is disabled or audio devices are missing",
    },
    a4Calibration: {
      title: "A4 Calibration",
      description: "Set reference frequency for A4 note (Hz)",
    },
    themeSettings: {
      title: "Theme Settings",
      description: "Select preferred color scheme",
    },
    theme: {
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    language: {
      title: "Language Settings",
      description: "Select application language",
    },
  },

  about: {
    title: "About",
    version: "App Version",
    links: "Links",
    github: "GitHub",
    desktop: "Desktop",
    web: "Web",
    copyright: "© {year} TunA. All rights NOT reserved. ⊂(◉‿◉)つ",
  },
  notFound: {
    error: " [ERROR 0x0000001A] Resource not found",
    button: "<-- BACK TO INDEX",
  },
  tuner: {
    selectInstrument: "Select instrument",
    selectTuning: "Select tuning",
    start: "Start Tuner",
    stop: "Stop Tuner",
    status: {
      inTune: "In tune",
      tuneDown: "Tune down",
      tuneUp: "Tune up",
      tooHigh: "Too high",
      tooLow: "Too low",
      wrongString: "Wrong string",
      default: "-",
    },
    frequency: "[   {frequency} ] Hz",
    instrumentDialog: {
      title: "Select Instrument and Tuning",
      description: "Choose your instrument and preferred tuning",
    },
  },
  navigation: {
    home: "Home",
    settings: "Settings",
  },
  window: {
    minimize: "Minimize",
    maximize: "Maximize",
    restore: "Restore",
    close: "Close",
  },
  general: {
    unknown: "Unknown",
    hertz: "Hz",
  },
};
