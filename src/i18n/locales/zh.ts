export default {
  locales: {
    en: "English",
    ru: "Русский",
    es: "Español",
    zh: "中文",
    fr: "Français",
  },
  errors: {
    microphoneNotFound: "未找到麦克风",
    microphonePermissionDenied: "麦克风访问被拒绝",
    errotToaccessMicrophone: "访问麦克风时出错",
    unknownError: "未知错误",
    mediaApiError: "您的设备不支持 MediaDevices API。",
  },
  settings: {
    audioSettings: {
      title: "音频设置",
      description: "为调音器选择麦克风",
      availableDevices: "可用设备",
      microphoneLabel: "麦克风 ({id})",
      selectMicrophone: "选择麦克风",
      noDevices: "音频使用已禁用或缺少音频设备",
    },
    a4Calibration: {
      title: "A4 校准",
      description: "设置 A4 音符的参考频率 (Hz)",
    },
    themeSettings: {
      title: "主题设置",
      description: "选择首选配色方案",
    },
    theme: {
      light: "浅色",
      dark: "深色",
      auto: "系统",
    },
    language: {
      title: "语言设置",
      description: "选择应用程序语言",
    },
  },
  about: {
    title: "关于",
    version: "应用版本",
    links: "链接",
    github: "GitHub",
    desktop: "桌面版",
    web: "网页版",
    copyright: "© {year} TunA. 保留所有权利。 ⊂(◉‿◉)つ",
  },
  notFound: {
    error: "[错误 0x0000001A] 资源未找到",
    button: "<-- 返回首页",
  },
  tuner: {
    readyToOffline: "应用程序已准备好离线工作",
    readyToRefresh: "应用程序需要刷新",
    selectInstrument: "选择乐器",
    selectTuning: "选择调音",
    start: "启动调音器",
    stop: "停止调音器",
    status: {
      inTune: "已调准",
      tuneDown: "调低",
      tuneUp: "调高",
      tooHigh: "过高",
      tooLow: "过低",
      wrongString: "错误的弦",
      default: "-",
    },
    frequency: "[   {frequency} ] Hz",
    instrumentDialog: {
      title: "选择乐器和调音",
      description: "选择您的乐器和首选调音",
    },
  },
  navigation: {
    home: "主页",
    settings: "设置",
  },
  window: {
    minimize: "最小化",
    maximize: "最大化",
    restore: "还原",
    close: "关闭",
  },
  general: {
    unknown: "未知",
    hertz: "赫兹",
    refresh: "刷新",
    reset: "重置",
  },
};
