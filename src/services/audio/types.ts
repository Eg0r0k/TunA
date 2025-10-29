export interface AudioState {
  context: AudioContext | null;
  stream: MediaStream | null;
  analyser: AnalyserNode | null;
  sourceNode: MediaStreamAudioSourceNode | null;
}
export type AudioError =
  | "NotAllowedError"
  | "NotFoundError"
  | "NotSupportedError";
