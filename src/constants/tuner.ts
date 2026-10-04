import { TunerConfig, TunerConstants } from "@/types/tuner/config";
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
  MIN_FREQUENCY: 25,
  MAX_FREQUENCY: 4200,
  MIN_CLARITY: 0.9,
  MIN_RMS: 0.005,
  SMOOTHING_TIME: 0,
  GAUGE_MAX_ROTATION: 90,
  MAX_DISPLAY_CENTS: 50,
  TUNING_DELAY: 500,
  UPDATE_INTERVAL: 50,
  SILENCE_HOLD: 600,
  SMOOTHING_WINDOW: 5,
  NOTE_CHANGE_CENTS: 80,
  NOTE_CHANGE_CONFIRM: 2,
  WARNING_CENTS: 20,
  DEFAULT_TOLERANCE_CENTS: 5,
  REFERENCE_TONE_DURATION: 2500,
} as const satisfies TunerConfig;

export const TUNER_CONSTANTS = {
  MIDI: {
    A4: 69,
    SEMITONES_IN_OCTAVE: 12,
  },
  OCTAVE: {
    BASE: 4,
    OFFSET: 1,
  },
  PITCH: {
    CENTS_PER_SEMITONE: 100,
  },
} as const satisfies TunerConstants;
