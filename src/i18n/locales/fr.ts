export default {
  locales: {
    en: "English",
    ru: "Русский",
    es: "Español",
    zh: "中文",
    fr: "Français",
  },
  errors: {
    microphoneNotFound: "Microphone non trouvé",
    microphonePermissionDenied: "Accès au microphone refusé",
    errotToaccessMicrophone: "Erreur lors de l'accès au microphone",
    unknownError: "Erreur inconnue",
    mediaApiError:
      "L'API MediaDevices n'est pas prise en charge par votre appareil.",
  },
  settings: {
    audioSettings: {
      title: "Paramètres audio",
      description: "Sélectionnez le microphone pour l'accordeur",
      availableDevices: "Appareils disponibles",
      microphoneLabel: "Microphone ({id})",
      selectMicrophone: "Sélectionner le microphone",
      noDevices:
        "L'utilisation de l'audio est désactivée ou les appareils audio sont manquants",
    },
    a4Calibration: {
      title: "Calibration de A4",
      description: "Définissez la fréquence de référence pour la note A4 (Hz)",
    },
    themeSettings: {
      title: "Paramètres du thème",
      description: "Choisissez le schéma de couleurs préféré",
    },
    theme: {
      light: "Clair",
      dark: "Sombre",
      auto: "Système",
    },
    language: {
      title: "Paramètres de langue",
      description: "Sélectionnez la langue de l'application",
    },
  },
  about: {
    title: "À propos",
    version: "Version de l'application",
    links: "Liens",
    github: "GitHub",
    desktop: "Bureau",
    web: "Web",
    copyright: "© {year} TunA. Tous droits réservés. ⊂(◉‿◉)つ",
  },
  notFound: {
    error: "[ERREUR 0x0000001A] Ressource introuvable",
    button: "<-- RETOUR À L'ACCUEIL",
  },
  tuner: {
    readyToOffline: "L'application est prête à fonctionner en mode hors ligne",
    readyToRefresh: "L'application doit être actualisée",
    selectInstrument: "Sélectionner l'instrument",
    selectTuning: "Sélectionner l'accordage",
    start: "Démarrer l'accordeur",
    stop: "Arrêter l'accordeur",
    status: {
      inTune: "Accordé",
      tuneDown: "Désaccorder vers le bas",
      tuneUp: "Désaccorder vers le haut",
      tooHigh: "Trop haut",
      tooLow: "Trop bas",
      wrongString: "Mauvaise corde",
      default: "-",
    },
    frequency: "[   {frequency} ] Hz",
    instrumentDialog: {
      title: "Sélectionner l'instrument et l'accordage",
      description: "Choisissez votre instrument et l'accordage préféré",
    },
  },
  navigation: {
    home: "Accueil",
    settings: "Paramètres",
  },
  window: {
    minimize: "Minimiser",
    maximize: "Maximiser",
    restore: "Restaurer",
    close: "Fermer",
  },
  general: {
    unknown: "Inconnu",
    hertz: "Hz",
    refresh: "Actualiser",
    reset: "Réinitialiser",
  },
};
