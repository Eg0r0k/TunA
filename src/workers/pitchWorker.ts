import { PitchDetector } from "pitchy";
import { TUNER_CONFIG } from "@/constants/tuner";
import { PitchWorkerInput } from "@/types/worker";

let detector: PitchDetector<Float32Array> | null = null;

const isValidPitch = (pitch: number, clarity: number): boolean => {
  return (
    clarity > TUNER_CONFIG.MIN_CLARITY &&
    pitch >= TUNER_CONFIG.MIN_FREQUENCY &&
    pitch <= TUNER_CONFIG.MAX_FREQUENCY
  );
};

self.onmessage = (e: MessageEvent<PitchWorkerInput>) => {
  const { buffer, sampleRate } = e.data;

  if (!detector) {
    detector = PitchDetector.forFloat32Array(buffer.length);
  }
  const [pitch, clarity] = detector.findPitch(buffer, sampleRate);

  if (isValidPitch(pitch, clarity)) {
    self.postMessage({ pitch, clarity });
  }
};

//Clean up after closewebworker
self.onclose = () => {
  detector = null;
};
