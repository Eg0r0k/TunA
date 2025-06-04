export default {
  locales: {
    en: "English",
    ru: "Русский",
    es: "Español",
    zh: "中文",
    fr: "Français",
  },
  errors: {
    microphoneNotFound: "Micrófono no encontrado",
    microphonePermissionDenied: "Acceso al micrófono denegado",
    errotToaccessMicrophone: "Error al acceder al micrófono",
    unknownError: "Error desconocido",
    mediaApiError:
      "La API de MediaDevices no es compatible con tu dispositivo.",
  },
  settings: {
    audioSettings: {
      title: "Configuración de audio",
      description: "Selecciona el micrófono para el afinador",
      availableDevices: "Dispositivos disponibles",
      microphoneLabel: "Micrófono ({id})",
      selectMicrophone: "Seleccionar micrófono",
      noDevices:
        "El uso de audio está deshabilitado o faltan dispositivos de audio",
    },
    a4Calibration: {
      title: "Calibración de A4",
      description: "Establece la frecuencia de referencia para la nota A4 (Hz)",
    },
    themeSettings: {
      title: "Configuración del tema",
      description: "Selecciona el esquema de color preferido",
    },
    theme: {
      light: "Claro",
      dark: "Oscuro",
      system: "Sistema",
    },
    language: {
      title: "Configuración de idioma",
      description: "Selecciona el idioma de la aplicación",
    },
  },
  about: {
    title: "Acerca de",
    version: "Versión de la aplicación",
    links: "Enlaces",
    github: "GitHub",
    desktop: "Escritorio",
    web: "Web",
    copyright: "© {year} TunA. Todos los derechos reservados. ⊂(◉‿◉)つ",
  },
  notFound: {
    error: "[ERROR 0x0000001A] Recurso no encontrado",
    button: "<-- VOLVER AL INICIO",
  },
  tuner: {
    readyToOffline:
      "La aplicación está lista para trabajar en modo sin conexión",
    readyToRefresh: "La aplicación necesita actualizarse",
    selectInstrument: "Seleccionar instrumento",
    selectTuning: "Seleccionar afinación",
    start: "Iniciar afinador",
    stop: "Detener afinador",
    status: {
      inTune: "En sintonía",
      tuneDown: "Afinar hacia abajo",
      tuneUp: "Afinar hacia arriba",
      tooHigh: "Demasiado alto",
      tooLow: "Demasiado bajo",
      wrongString: "Cuerda incorrecta",
      default: "-",
    },
    frequency: "[   {frequency} ] Hz",
    instrumentDialog: {
      title: "Seleccionar instrumento y afinación",
      description: "Elige tu instrumento y afinación preferida",
    },
  },
  navigation: {
    home: "Inicio",
    settings: "Configuración",
  },
  window: {
    minimize: "Minimizar",
    maximize: "Maximizar",
    restore: "Restaurar",
    close: "Cerrar",
  },
  general: {
    unknown: "Desconocido",
    hertz: "Hz",
    refresh: "Actualizar",
  },
};
