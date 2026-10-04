import { readonly, ref } from "vue";
import { useAudio } from "./useAudio";
import { usePitchWorker } from "./usePitchWorker";
import { TUNER_CONFIG } from "@/constants/tuner";
import { PitchWorkerMessage } from "@/types/worker";
import { PitchSmoother } from "@/utils/pitchSmoother";

// Input level meter range (dBFS)
const LEVEL_FLOOR_DB = -60;
const LEVEL_CEIL_DB = -10;

const rmsToLevel = (rms: number): number => {
  if (rms <= 0) return 0;
  const db = 20 * Math.log10(rms);
  const level = (db - LEVEL_FLOOR_DB) / (LEVEL_CEIL_DB - LEVEL_FLOOR_DB);
  return Math.min(1, Math.max(0, level));
};

/**
 * Microphone → worker → smoothed pitch.
 *
 * Pitch detection runs in a worker because of the large number of constant
 * calculations; the rate is set by `UPDATE_INTERVAL` in `/constants/tuner.ts`.
 */
export const usePitchDetection = () => {
  const pitch = ref(0);
  const clarity = ref(0);
  const level = ref(0);
  /** While paused the input is ignored (e.g. a reference tone is playing) */
  const paused = ref(false);

  const smoother = new PitchSmoother();
  let lastValidAt = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  let awaitingWorker = false;

  const resetReadings = () => {
    pitch.value = 0;
    clarity.value = 0;
    level.value = 0;
    smoother.reset();
  };

  const stop = () => {
    clearInterval(timer);
    timer = undefined;
    awaitingWorker = false;
    terminateWorker();
    stopAudio();
    resetReadings();
  };

  const {
    analyser,
    isActive,
    start: startAudio,
    stop: stopAudio,
  } = useAudio({ onEnded: stop });
  const { initWorker, postBuffer, terminateWorker } = usePitchWorker();

  const handleResult = (data: PitchWorkerMessage) => {
    awaitingWorker = false;
    level.value = rmsToLevel(data.rms);

    const now = performance.now();
    if (data.pitch > 0 && !paused.value) {
      lastValidAt = now;
      clarity.value = data.clarity;
      pitch.value = smoother.push(data.pitch);
    } else if (pitch.value && now - lastValidAt > TUNER_CONFIG.SILENCE_HOLD) {
      // Hold the last reading for a moment so the display doesn't flicker
      pitch.value = 0;
      clarity.value = 0;
      smoother.reset();
    }
  };

  const tick = () => {
    const node = analyser.value;
    // Skip a frame instead of queueing work if the worker is still busy
    if (!node || awaitingWorker) return;

    const buffer = new Float32Array(node.fftSize);
    node.getFloatTimeDomainData(buffer);
    awaitingWorker = true;
    postBuffer({ buffer, sampleRate: node.context.sampleRate });
  };

  const start = async (): Promise<boolean> => {
    if (!(await startAudio())) return false;
    resetReadings();
    initWorker(handleResult);
    timer = setInterval(tick, TUNER_CONFIG.UPDATE_INTERVAL);
    return true;
  };

  const setPaused = (value: boolean) => {
    paused.value = value;
    if (value) {
      pitch.value = 0;
      smoother.reset();
    }
  };

  return {
    pitch: readonly(pitch),
    clarity: readonly(clarity),
    level: readonly(level),
    isActive,
    start,
    stop,
    setPaused,
  };
};
