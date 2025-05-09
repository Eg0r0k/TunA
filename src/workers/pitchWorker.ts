import { PitchDetector } from "pitchy";
import { TUNER_CONFIG } from "@/constants/tuner";

let detector: PitchDetector<Float32Array> | null = null;

self.onmessage = (
  e: MessageEvent<{ buffer: Float32Array; sampleRate: number }>
) => {
  const { buffer, sampleRate } = e.data;

  if (!detector) {
    detector = PitchDetector.forFloat32Array(buffer.length);
  }
  const [pitch, clarity] = detector.findPitch(buffer, sampleRate);

  if (
    clarity > TUNER_CONFIG.MIN_CLARITY &&
    pitch >= TUNER_CONFIG.MIN_FREQUENCY &&
    pitch <= TUNER_CONFIG.MAX_FREQUENCY
  ) {
    self.postMessage({ pitch, clarity });
  }
};

//Clean up after close wenworker
self.onclose = () => {
  detector = null;
};
