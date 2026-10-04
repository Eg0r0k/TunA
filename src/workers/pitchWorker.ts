import { PitchDetector } from "pitchy";
import { TUNER_CONFIG } from "@/constants/tuner";
import { PitchWorkerInput, PitchWorkerMessage } from "@/types/worker";

let detector: PitchDetector<Float32Array> | null = null;

const getRms = (buffer: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
};

const isValidPitch = (pitch: number, clarity: number, rms: number): boolean =>
  rms >= TUNER_CONFIG.MIN_RMS &&
  clarity >= TUNER_CONFIG.MIN_CLARITY &&
  pitch >= TUNER_CONFIG.MIN_FREQUENCY &&
  pitch <= TUNER_CONFIG.MAX_FREQUENCY;

self.onmessage = (e: MessageEvent<PitchWorkerInput>) => {
  const { buffer, sampleRate } = e.data;

  if (!detector || detector.inputLength !== buffer.length) {
    detector = PitchDetector.forFloat32Array(buffer.length);
  }
  const rms = getRms(buffer);
  const [pitch, clarity] = detector.findPitch(buffer, sampleRate);

  // Always answer, so the UI knows when the signal is gone
  const message: PitchWorkerMessage = isValidPitch(pitch, clarity, rms)
    ? { pitch, clarity, rms }
    : { pitch: 0, clarity, rms };
  self.postMessage(message);
};
