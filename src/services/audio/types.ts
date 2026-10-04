export interface AudioState {
  context: AudioContext | null;
  stream: MediaStream | null;
  analyser: AnalyserNode | null;
  sourceNode: MediaStreamAudioSourceNode | null;
}

export type AudioError =
  | "NotAllowedError"
  | "NotFoundError"
  | "NotReadableError"
  | "OverconstrainedError"
  | "NotSupportedError";

export interface AudioInitResult {
  stream: MediaStream;
  context: AudioContext;
  /** The requested device was unavailable and the default one was used instead */
  usedFallbackDevice: boolean;
}
