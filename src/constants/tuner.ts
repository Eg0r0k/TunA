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
  FFT_SIZE: 8192,
  MIN_FREQUENCY: 20,
  MAX_FREQUENCY: 20000,
  MIN_CLARITY: 0.8,
  TUNING_THRESHOLD: 0.1,
  GAUGE_MAX_ROTATION: 90,
  //Not recommended do less interval (bad for accuracy)
  UPDATE_INTERVAL: 100,
} as const;
