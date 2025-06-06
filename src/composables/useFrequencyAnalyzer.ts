import { computed, onUnmounted, ref, shallowRef, watch } from "vue";
import { useAudio } from "./useAudio";
import { getNoteName, getNoteFrequency } from "@/utils/noteUtils";
import { NoteWithOctave } from "@/types/tuner/notes";
import { INSTRUMENTS } from "@/data/tunings";
import { Tuning } from "@/types/tuner/instruments";
import { TUNER_CONFIG } from "@/constants/tuner";
import { PitchWorkerMessage } from "@/types/worker";

interface TunedString {
  note: string;
  timestamp: number;
  tuned: boolean;
  notes?: NoteWithOctave[];
}

export const useFrequencyAnalyzer = () => {
  const { analyser, isActive, start, stop } = useAudio();
  const frequency = ref(0);
  const clarity = ref(0);

  const suggestedNote = ref<NoteWithOctave | null>(null);

  //Select first string by default
  const currentTuning = ref<Tuning>(INSTRUMENTS[0].tunings[0]);
  const tunedStrings = shallowRef<Map<NoteWithOctave, TunedString>>(new Map());
  const selectedString = ref<NoteWithOctave | null>(null);

  const note = computed(() => getNoteName(frequency.value));

  const setTuning = (tuning: Tuning): void => {
    currentTuning.value = tuning;
    selectedString.value = null;
  };

  const resetTuning = (): void => {
    tunedStrings.value.clear();
  };

  const setSelectedString = (note: NoteWithOctave | null): void => {
    selectedString.value = note;
    resetTuning();
  };

  const updateStringState = (targetString: NoteWithOctave): void => {
    const now = performance.now();
    const stringState: TunedString = tunedStrings.value.get(targetString) || {
      note: targetString,
      timestamp: now,
      tuned: false,
    };

    if (
      now - stringState.timestamp >= TUNER_CONFIG.TUNING_DELAY &&
      !stringState.tuned
    ) {
      stringState.tuned = true;
    }
    tunedStrings.value.set(targetString, stringState);
  };

  const isNoteInTuning = (note: NoteWithOctave): boolean => {
    return !!currentTuning.value?.notes.includes(note);
  };
  const shouldMarkAsTuned = (accuracyValue: number): boolean => {
    return accuracyValue < TUNER_CONFIG.TUNING_THRESHOLD;
  };

  //! Looks not like 'GOOD' codding
  const checkTuning = (note: NoteWithOctave) => {
    if (!currentTuning.value || !note || !isNoteInTuning(note)) return false;
    if (selectedString.value && note !== selectedString.value) {
      resetTuning();
      return false;
    }

    const accuracyValue = Math.abs(accuracy.value);
    const targetString = currentTuning.value.notes.find((n) => n === note);

    if (!targetString) return false;
    if (shouldMarkAsTuned(accuracyValue)) {
      updateStringState(targetString);
      return tunedStrings.value.get(targetString)?.tuned ?? false;
    }
    tunedStrings.value.delete(targetString);
    return false;
  };

  const accuracy = computed(() => {
    if (frequency.value <= 0) return 0;

    const targetNote = selectedString.value || note.value;
    if (!targetNote) return 0;

    const targetFreq = getNoteFrequency(targetNote);
    const cents = 1200 * Math.log2(frequency.value / targetFreq);
    return Math.max(-0.5, Math.min(0.5, cents / 100));
  });

  let animationFrameId: number;
  let lastAnalysisTime = 0;

  // We use a worker because of the large number of constant frequency calculations,
  // the frequency of calculations is set in the tuner config `/constants/tuner.ts`

  const worker = shallowRef<Worker | null>(null);

  const initWorker = (): void => {
    if (worker.value) return;

    worker.value = new Worker(
      new URL("../workers/pitchWorker.ts", import.meta.url),
      { type: "module" }
    );

    worker.value.onmessage = (e: MessageEvent<PitchWorkerMessage>) => {
      const { pitch, clarity: clarityValue } = e.data;

      frequency.value = pitch;
      clarity.value = clarityValue;
      const newNote = getNoteName(pitch);

      if (newNote && newNote !== suggestedNote.value) {
        suggestedNote.value = newNote;
        checkTuning(newNote);
      }
    };
    worker.value.onerror = (e) => {
      console.error("Worker error:", e);
      stop();
    };
  };

  const analyze = (): void => {
    if (!analyser.value || !isActive.value || !worker.value) return;

    const now = performance.now();
    if (now - lastAnalysisTime < TUNER_CONFIG.UPDATE_INTERVAL) {
      animationFrameId = requestAnimationFrame(analyze);
      return;
    }
    lastAnalysisTime = now;

    const bufferLength = analyser.value.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyser.value.getFloatTimeDomainData(buffer);

    worker.value.postMessage({
      buffer,
      sampleRate: analyser.value.context.sampleRate,
    });

    animationFrameId = requestAnimationFrame(analyze);
  };

  const clean = (): void => {
    cancelAnimationFrame(animationFrameId);
    if (worker.value && worker.value instanceof Worker) {
      worker.value.terminate();
      worker.value = null;
    }
    frequency.value = 0;
    clarity.value = 0;
  };

  watch(isActive, (newVal) => {
    if (!newVal && worker.value) {
      clean();
    } else if (newVal) {
      initWorker();
      analyze();
    }
  });

  watch(() => currentTuning, resetTuning, { flush: "post" });

  onUnmounted(() => {
    clean();
  });

  return {
    frequency,
    note,
    accuracy,
    isActive,
    suggestedNote,
    currentTuning,
    tunedStrings,
    selectedString,

    start,
    stop,
    setTuning,
    resetTuning,
    setSelectedString,
  };
};
