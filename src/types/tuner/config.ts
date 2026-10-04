export interface TunerConfig {
  /**
   * Analysis window size (must be a power of two)
   */
  FFT_SIZE: number;
  /**
   * Minimum recognizable frequency (Hz)
   * @default 25Hz - slightly below the lowest string of a 5-string bass (B0 ≈ 30.9Hz)
   */
  MIN_FREQUENCY: number;
  /**
   * Maximum recognizable frequency (Hz)
   * @default 4200Hz - the top of a piano keyboard (C8 ≈ 4186Hz)
   */
  MAX_FREQUENCY: number;
  /**
   * Minimum threshold for signal clarity
   * @range 0-1
   * @default 0.9 - 90% confidence in tone determination
   */
  MIN_CLARITY: number;
  /**
   * Noise gate: signals quieter than this RMS level are treated as silence
   * @range 0-1
   */
  MIN_RMS: number;
  /**
   * Analyser smoothing time constant
   */
  SMOOTHING_TIME: number;
  /**
   * Indicator rotation angle (degrees) at the edge of the scale (±MAX_DISPLAY_CENTS)
   */
  GAUGE_MAX_ROTATION: number;
  /**
   * Deviation shown at the edge of the gauge (cents)
   */
  MAX_DISPLAY_CENTS: number;
  /**
   * How long a string must stay in (or out of) tune before its state flips (ms)
   */
  TUNING_DELAY: number;
  /**
   * Data update interval (ms)
   */
  UPDATE_INTERVAL: number;
  /**
   * How long the last detected pitch is held after the signal disappears (ms)
   */
  SILENCE_HOLD: number;
  /**
   * Number of readings used by the median filter
   */
  SMOOTHING_WINDOW: number;
  /**
   * A jump larger than this (cents) is treated as a new note instead of noise
   */
  NOTE_CHANGE_CENTS: number;
  /**
   * Consecutive readings required to confirm a new note
   */
  NOTE_CHANGE_CONFIRM: number;
  /**
   * Deviation (cents) up to which the status is shown as a warning instead of an error
   */
  WARNING_CENTS: number;
  /**
   * Default "in tune" tolerance (cents), user adjustable in settings
   */
  DEFAULT_TOLERANCE_CENTS: number;
  /**
   * Duration of the reference tone (ms)
   */
  REFERENCE_TONE_DURATION: number;
}

export interface TunerConstants {
  MIDI: {
    /**
     * MIDI note number for A4
     * @default 69
     */
    A4: number;
    /**
     * Number of semitones in an octave
     * @default 12
     */
    SEMITONES_IN_OCTAVE: number;
  };
  OCTAVE: {
    /**
     * Base octave number
     * @default 4 - corresponds to A4
     */
    BASE: number;
    /**
     * Offset between MIDI octaves and scientific pitch notation
     * @default 1 - MIDI note 0 is C-1
     */
    OFFSET: number;
  };
  PITCH: {
    /**
     * Number of cents in a semitone
     * @default 100 - standard tuning unit
     */
    CENTS_PER_SEMITONE: number;
  };
}
