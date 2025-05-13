export interface PitchWorkerInput {
  buffer: Float32Array;
  sampleRate: number;
}

export interface PitchWorkerMessage {
  pitch: number;
  clarity: number;
}
