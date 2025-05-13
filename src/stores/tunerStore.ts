import { useFrequencyAnalyzer } from "@/composables/useFrequencyAnalyzer";
import { TUNER_CONFIG } from "@/constants/tuner";
import { INSTRUMENTS } from "@/data/tunings";
import { Instrument, Tuning } from "@/types/tuner/instruments";
import { getNextNote, getPrevNote, splitNote } from "@/utils/noteUtils";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useTunerStore = defineStore("tuner", () => {
  const {
    accuracy,
    isActive,
    start,
    stop,
    frequency,
    suggestedNote,
    currentTuning,
    setTuning,
    tunedStrings,
    selectedString,
    setSelectedString,
    resetTuning,
  } = useFrequencyAnalyzer();

  const currentInstrument = ref<Instrument>(INSTRUMENTS[0]);

  const noteParts = computed(() => splitNote(suggestedNote.value));
  const prevNote = computed(() => getPrevNote(noteParts.value.name));
  const nextNote = computed(() => getNextNote(noteParts.value.name));

  const accuracyTextColor = computed(() => {
    const acc = Math.abs(accuracy.value);
    if (acc < 0.1) return "text-primary";
    if (acc < 0.3) return "text-yellow-500";
    return "text-destructive";
  });

  const formatFrequency = computed(() =>
    frequency.value ? Math.round(frequency.value * 100) / 100 : "—"
  );

  const gaugeRotation = computed(() => {
    if (!frequency.value) return 0;
    return (
      Math.round(accuracy.value * TUNER_CONFIG.GAUGE_MAX_ROTATION * 100) / 100
    );
  });

  // We return the status as strings for i18n
  // exemple: tuneUp -> tuner.status.tuneUp = status in the required language
  const accuracyStatus = computed(() => {
    if (!frequency.value) return "default";
    if (selectedString.value) {
      if (suggestedNote.value !== selectedString.value) return "wrongString";
      if (Math.abs(accuracy.value) < TUNER_CONFIG.TUNING_THRESHOLD)
        return "inTune";
      return accuracy.value > 0 ? "tuneDown" : "tuneUp";
    }
    if (Math.abs(accuracy.value) < TUNER_CONFIG.TUNING_THRESHOLD)
      return "inTune";
    return accuracy.value > 0 ? "tooHigh" : "tooLow";
  });

  const memoizedTuningState = computed(() =>
    currentTuning.value.notes.map((note) => {
      const { name, octave } = splitNote(note);
      return {
        note,
        displayName: name,
        displayOctave: octave,
        isCurrent: suggestedNote.value === note,
        isTuned: tunedStrings.value.get(note)?.tuned ?? false,
        isSelected: selectedString.value === note,
      };
    })
  );

  const toggleTuner = () => {
    isActive ? stop() : start();
  };

  const handleInstrumentChange = (instrument: Instrument) => {
    currentInstrument.value = instrument;
    handleTuningChange(instrument.tunings[0]);
  };
  const handleTuningChange = (tuning: Tuning | null): void => {
    if (tuning && tuning.id !== currentTuning.value.id) {
      setTuning(tuning);
      resetTuning();
      setSelectedString(null);
    }
  };
  return {
    currentInstrument,
    selectedString,

    accuracy,
    isActive,
    frequency,
    suggestedNote,
    currentTuning,
    accuracyStatus,

    noteParts,
    prevNote,
    nextNote,
    accuracyTextColor,
    formatFrequency,
    gaugeRotation,
    memoizedTuningState,

    start,
    stop,
    handleInstrumentChange,
    handleTuningChange,
    setSelectedString,
    toggleTuner
  };
});
