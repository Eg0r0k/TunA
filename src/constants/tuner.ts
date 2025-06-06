import { TunerConfig } from "@/types/tuner/config";
import { NoteName } from "@/types/tuner/notes";

export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["ru", "en", "es", "zh", "fr"] as const;

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
] as const satisfies readonly NoteName[];

export const TUNER_CONFIG = {
  FFT_SIZE: 8192,
  MIN_FREQUENCY: 20,
  MAX_FREQUENCY: 20000,
  MIN_CLARITY: 0.8,
  TUNING_THRESHOLD: 0.1,
  SMOOTHING_TIME: 0.2,
  GAUGE_MAX_ROTATION: 90,
  TUNING_DELAY: 200,
  UPDATE_INTERVAL: 100,
} as const satisfies TunerConfig;
