export interface PitchWorkerInput {
  buffer: Float32Array;
  sampleRate: number;
}

export interface PitchWorkerMessage {
  /** Detected pitch in Hz, 0 when no reliable pitch was found */
  pitch: number;
  clarity: number;
  /** Root mean square level of the input buffer (0-1) */
  rms: number;
}
