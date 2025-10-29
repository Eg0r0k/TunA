export interface TunerConfig {
  /**
   * FFT window size (must be a power of two)
   */
  FFT_SIZE: number;
  /**
   * Minimum recognizable frequency (Hz)
   * @default 20Hz - the lower limit of human hearing
   */
  MIN_FREQUENCY: number;
  /**
   * Maximum recognizable frequency (Hz)
   *@default 20000Hz - the upper limit of human hearing
   */
  MAX_FREQUENCY: number;
  /**
   * Minimum threshold for signal clarity
   * @range 0-1
   * @default 0.8 - 80% confidence in tone determination
   */
  MIN_CLARITY: number;
  /**
   * Permissible deviation for tuning (in fractions of a semitone)
   * @example 0.1 - a deviation of ±10% of a halftone is allowed
   */
  TUNING_THRESHOLD: number;
  /**
   * Frequency smoothing time (seconds)
   * @default 0.2 - 200 ms to stabilize readings
   */
  SMOOTHING_TIME: number;
  /**
   * Maximum indicator rotation angle (degrees)
   * @default 90° - from -45° to +45°
   */
  GAUGE_MAX_ROTATION: number;
  /**
   * Delay analysis starts (ms)
   * @default 200
   */
  TUNING_DELAY: number;
  /**
   * Data update interval (ms)
   * @default 100 - optimal balance between accuracy and responsiveness
   */
  UPDATE_INTERVAL: number;
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
     * Offset for the octave
     * @default 1 - used for calculations
     * @example If BASE is 4, then the first octave is 3 (4 - 1)
     */
    OFFSET: number;
  };
  ACCURACY: {
    /**
     * Minimum accuracy value
     * @default -0.5 - corresponds to a significant deviation
     */
    MIN: number;
    /**
     * Maximum accuracy value
     * @default 0.5 - corresponds to a perfect pitch
     */
    MAX: number;
    /**
     * Low threshold for accuracy
     * @default 0.1 - corresponds to a small deviation
     */
    THRESHOLD_LOW: number;
    /**
     * High threshold for accuracy
     * @default 0.3 - corresponds to a moderate deviation
     */
    THRESHOLD_HIGH: number;
  };
  PITCH: {
    /**
     * Number of cents in a semitone
     * @default 100 - standard tuning unit
     */
    CENTS_PER_SEMITONE: number;
  };
}
