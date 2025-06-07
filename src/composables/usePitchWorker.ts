import { PitchWorkerMessage } from "@/types/worker";
import { shallowRef } from "vue";

export const usePitchWorker = () => {
  const worker = shallowRef<Worker | null>(null);

  const initWorker = (
    onMessageCallback: (data: PitchWorkerMessage) => void
  ): void => {
    if (worker.value) return;

    worker.value = new Worker(
      new URL("../workers/pitchWorker.ts", import.meta.url),
      { type: "module" }
    );

    worker.value.onmessage = (e: MessageEvent<PitchWorkerMessage>) => {
      onMessageCallback(e.data);
    };

    worker.value.onerror = (e) => {
      console.error("Worker error:", e);
    };
  };

  const terminateWorker = (): void => {
    if (worker.value && worker.value instanceof Worker) {
      worker.value.terminate();
      worker.value = null;
    }
  };

  return { worker, initWorker, terminateWorker };
};
