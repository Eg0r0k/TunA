import { computed, onUnmounted, ref, shallowRef, watch } from "vue";
import { useAudio } from "./useAudio";
import { INSTRUMENTS, type Tuning } from "@/data/tunings";
import { NoteWithOctave, TUNER_CONFIG } from "@/constants/tuner";
import { getNoteName, getNoteFrequency } from "@/utils/noteUtils";

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
  const tunedStrings = ref<Map<NoteWithOctave, TunedString>>(new Map());
  const selectedString = ref<NoteWithOctave | null>(null);

  const note = computed(() => getNoteName(frequency.value));

  const setTuning = (tuning: Tuning) => {
    currentTuning.value = tuning;
    selectedString.value = null;
  };

  const resetTuning = () => {
    tunedStrings.value.clear();
  };

  const setSelectedString = (note: NoteWithOctave | null) => {
    selectedString.value = note;
    resetTuning();
  };

  const checkTuning = (note: NoteWithOctave) => {
    if (!currentTuning.value || !note) return false;
    if (!currentTuning.value.notes.includes(note)) return false;

    if (selectedString.value && note !== selectedString.value) {
      resetTuning();
      return false;
    }

    const accuracyValue = Math.abs(accuracy.value);

    const targetString = currentTuning.value.notes.find((n) => n === note);

    if (!targetString) return false;

    if (accuracyValue < 0.1) {
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
      return stringState.tuned;
    } else {
      tunedStrings.value.delete(targetString);
      return false;
    }
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

  const worker = shallowRef<Worker | null>(null);

  const initWorker = () => {
    if (worker.value) return;

    worker.value = new Worker(
      new URL("../workers/pitchWorker.ts", import.meta.url),
      { type: "module" }
    );

    worker.value.onmessage = (
      e: MessageEvent<{ pitch: number; clarity: number }>
    ) => {
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

  const analyze = () => {
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

  const clean = () => {
    cancelAnimationFrame(animationFrameId);
    if (worker.value) {
      worker.value.terminate();
      worker.value = null;
    }
    frequency.value = 0;
    clarity.value = 0;
  };

  watch(isActive, (active) => {
    if (active) {
      initWorker();
      analyze();
    } else {
      clean();
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
    start,
    stop,
    suggestedNote,
    currentTuning,
    setTuning,
    tunedStrings,
    resetTuning,
    selectedString,
    setSelectedString,
  };
};
