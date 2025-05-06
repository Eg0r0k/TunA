export type NoteName = (typeof NOTES)[number];
export type NoteWithOctave = `${NoteName}${number}`;

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
  MIN_FREQUENCY: 40,
  MAX_FREQUENCY: 1200,
  MIN_CLARITY: 0.8,
  TUNING_THRESHOLD: 0.1,
  TUNING_DELAY: 200,   //? MB add
  GAUGE_MAX_ROTATION: 90,
  UPDATE_INTERVAL: 100,
} as const;

