export type NoteName = (typeof NOTES)[number];
export type NoteWithOctave = `${NoteName}${number}`;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["ru", "en"] as const;

export const NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;

export const TUNER_CONFIG = {
  //It is not recommended to set more or less than 8 thousand,
  //is sufficient resolution, you need to set values ​​of the power of two:
  //@exemple: 1024 -> 2048 -> 4096 -> 8192 -> 16384
  FFT_SIZE: 8192,
  MIN_FREQUENCY: 20,
  MAX_FREQUENCY: 20000,
  MIN_CLARITY: 0.8,
  TUNING_THRESHOLD: 0.1,
  SMOOTHING_TIME: 0.2,
  GAUGE_MAX_ROTATION: 90,
  TUNING_DELAY: 200,
  //Not recommended do less interval (bad for accuracy)
  UPDATE_INTERVAL: 100,
} as const;
