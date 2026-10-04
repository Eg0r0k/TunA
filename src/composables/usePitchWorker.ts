import { PitchWorkerInput, PitchWorkerMessage } from "@/types/worker";
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

  /** Sends the buffer to the worker, transferring (not copying) its memory */
  const postBuffer = (input: PitchWorkerInput): void => {
    worker.value?.postMessage(input, [input.buffer.buffer]);
  };

  const terminateWorker = (): void => {
    worker.value?.terminate();
    worker.value = null;
  };

  return { worker, initWorker, postBuffer, terminateWorker };
};
