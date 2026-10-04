import { usePitchDetection } from "@/composables/usePitchDetection";
import { useReferenceTone } from "@/composables/useReferenceTone";
import { TUNER_CONFIG } from "@/constants/tuner";
import { INSTRUMENTS } from "@/data/tunings";
import {
  addCustomTuning,
  deleteTuning,
  getTunings,
  updateTuning,
} from "@/db/tuningService";
import { i18n } from "@/i18n";
import { Instrument, Tuning } from "@/types/tuner/instruments";
import { NoteWithOctave } from "@/types/tuner/notes";
import {
  findClosestNote,
  getAdjacentNotes,
  getCents,
  getNoteFrequency,
  getNoteName,
  splitNote,
} from "@/utils/noteUtils";
import { useWakeLock } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";
import { useSettingsStore } from "./settingsStore";

export type TunerMode = "instrument" | "chromatic";

export type TuningStatus =
  | "default"
  | "inTune"
  | "tuneUp"
  | "tuneDown"
  | "wrongString";

const CUSTOM_TUNING_PREFIX = "custom-";

// If the selected string is further than this, the user is most likely
// playing another string rather than a badly detuned one
const WRONG_STRING_CENTS = 250;

interface StringTracker {
  inTune: boolean;
  since: number;
}

export const useTunerStore = defineStore(
  "tuner",
  () => {
    const settingsStore = useSettingsStore();
    const detection = usePitchDetection();
    const referenceTone = useReferenceTone();
    const wakeLock = useWakeLock();

    const { pitch, level, isActive } = detection;

    // ---- Instruments & tunings ----

    const mode = ref<TunerMode>("instrument");
    const instruments = ref<Instrument[]>(structuredClone(INSTRUMENTS));
    const currentInstrumentId = ref(INSTRUMENTS[0].id);
    const currentTuningId = ref(INSTRUMENTS[0].tunings[0].id);

    const currentInstrument = computed(
      () =>
        instruments.value.find((i) => i.id === currentInstrumentId.value) ??
        instruments.value[0]
    );
    const currentTuning = computed<Tuning>(
      () =>
        currentInstrument.value.tunings.find(
          (t) => t.id === currentTuningId.value
        ) ?? currentInstrument.value.tunings[0]
    );

    const selectedString = ref<NoteWithOctave | null>(null);
    const tunedStrings = ref<Partial<Record<NoteWithOctave, boolean>>>({});
    const trackers = new Map<NoteWithOctave, StringTracker>();

    const resetTuning = (): void => {
      tunedStrings.value = {};
      trackers.clear();
    };

    // ---- Pitch analysis ----

    const a4 = computed(() => settingsStore.a4);
    const tolerance = computed(() => settingsStore.tolerance);

    const detectedNote = computed(() => getNoteName(pitch.value, a4.value));

    /** The string of the current tuning closest to the played pitch */
    const closestString = computed(() =>
      mode.value === "instrument"
        ? findClosestNote(pitch.value, currentTuning.value.notes, a4.value)
        : null
    );

    /** The note the deviation is measured against */
    const targetNote = computed<NoteWithOctave | null>(() => {
      if (!pitch.value) return null;
      if (mode.value === "chromatic") return detectedNote.value;
      return selectedString.value ?? closestString.value;
    });

    const cents = computed(() =>
      targetNote.value
        ? getCents(pitch.value, getNoteFrequency(targetNote.value, a4.value))
        : 0
    );

    const isInTune = computed(
      () => !!targetNote.value && Math.abs(cents.value) <= tolerance.value
    );

    const isWrongString = computed(
      () =>
        mode.value === "instrument" &&
        !!selectedString.value &&
        !!closestString.value &&
        closestString.value !== selectedString.value &&
        Math.abs(cents.value) > WRONG_STRING_CENTS
    );

    // We return the status as strings for i18n
    // example: tuneUp -> tuner.status.tuneUp = status in the required language
    const accuracyStatus = computed<TuningStatus>(() => {
      if (!targetNote.value) return "default";
      if (isWrongString.value) return "wrongString";
      if (isInTune.value) return "inTune";
      return cents.value > 0 ? "tuneDown" : "tuneUp";
    });

    const accuracyTextColor = computed(() => {
      if (accuracyStatus.value === "default") return "text-muted-foreground";
      if (accuracyStatus.value === "inTune") return "text-primary";
      if (
        !isWrongString.value &&
        Math.abs(cents.value) < TUNER_CONFIG.WARNING_CENTS
      )
        return "text-yellow-500";
      return "text-destructive";
    });

    /** The note in the centre of the display */
    const displayNote = computed(
      () => (mode.value === "chromatic" ? detectedNote.value : targetNote.value)
    );
    const noteParts = computed(() => splitNote(displayNote.value));
    const adjacentNotes = computed(() => {
      const { prev, next } = getAdjacentNotes(displayNote.value);
      return { prev: splitNote(prev), next: splitNote(next) };
    });

    const formatFrequency = computed(() =>
      pitch.value ? pitch.value.toFixed(1) : "—"
    );

    const formatCents = computed(() => {
      if (!targetNote.value) return "—";
      const rounded = Math.round(cents.value);
      return `${rounded > 0 ? "+" : ""}${rounded}`;
    });

    const gaugeRotation = computed(() => {
      if (!targetNote.value) return 0;
      const max = TUNER_CONFIG.MAX_DISPLAY_CENTS;
      const clamped = Math.max(-max, Math.min(max, cents.value));
      return (clamped / max) * TUNER_CONFIG.GAUGE_MAX_ROTATION;
    });

    const memoizedTuningState = computed(() =>
      currentTuning.value.notes.map((note) => {
        const { name, octave } = splitNote(note);
        return {
          note,
          displayName: name,
          displayOctave: octave,
          isCurrent: targetNote.value === note,
          isTuned: tunedStrings.value[note] ?? false,
          isSelected: selectedString.value === note,
        };
      })
    );

    // ---- Tuned strings tracking ----

    const advanceToNextString = (from: NoteWithOctave) => {
      const notes = currentTuning.value.notes;
      const start = notes.indexOf(from);
      for (let i = 1; i < notes.length; i++) {
        const candidate = notes[(start + i) % notes.length];
        if (!tunedStrings.value[candidate]) {
          selectedString.value = candidate;
          return;
        }
      }
      selectedString.value = null;
      toast.success(i18n.global.t("tuner.allTuned"));
    };

    /**
     * A string's tuned flag flips only after its state (in or out of
     * tolerance) has been stable for `TUNING_DELAY`, so a pluck's attack
     * transient doesn't count.
     */
    const updateTunedStrings = () => {
      const note = targetNote.value;
      if (mode.value !== "instrument" || !note || isWrongString.value) return;

      const now = performance.now();
      const inTune = isInTune.value;
      const tracker = trackers.get(note);

      if (!tracker || tracker.inTune !== inTune) {
        trackers.set(note, { inTune, since: now });
        return;
      }
      if (
        now - tracker.since < TUNER_CONFIG.TUNING_DELAY ||
        (tunedStrings.value[note] ?? false) === inTune
      )
        return;

      tunedStrings.value = { ...tunedStrings.value, [note]: inTune };
      if (
        inTune &&
        note === selectedString.value &&
        settingsStore.state.autoAdvance
      ) {
        advanceToNextString(note);
      }
    };

    // `level` changes with every analysed frame, so the hold timer keeps running
    // even when the smoothed pitch is momentarily identical
    watch([pitch, level], updateTunedStrings);

    // ---- Actions ----

    const start = async () => {
      resetTuning();
      await detection.start();
    };

    const stop = () => {
      detection.stop();
      referenceTone.stop();
    };

    const toggleTuner = () => (isActive.value ? stop() : start());

    const setMode = (value: TunerMode) => {
      mode.value = value;
      selectedString.value = null;
      resetTuning();
    };

    const toggleStringSelection = (note: NoteWithOctave) => {
      selectedString.value = note === selectedString.value ? null : note;
    };

    const setSelectedString = (note: NoteWithOctave | null) => {
      selectedString.value = note;
    };

    const handleTuningChange = (tuningId: string): void => {
      if (tuningId === currentTuning.value.id) return;
      currentTuningId.value = tuningId;
      selectedString.value = null;
      resetTuning();
    };

    const handleInstrumentChange = (instrumentId: string): void => {
      const instrument = instruments.value.find((i) => i.id === instrumentId);
      if (!instrument) return;
      currentInstrumentId.value = instrument.id;
      handleTuningChange(instrument.tunings[0].id);
    };

    /** Merges the custom tunings stored in IndexedDB into the instrument list */
    const loadCustomTunings = async () => {
      try {
        const custom = await getTunings();
        instruments.value = INSTRUMENTS.map((instrument) => ({
          ...instrument,
          tunings: [
            ...structuredClone(instrument.tunings),
            ...custom
              .filter((t) => t.instrument_id === instrument.id && t.id != null)
              .map((t) => ({
                id: `${CUSTOM_TUNING_PREFIX}${t.id}`,
                name: t.name,
                notes: t.notes,
                custom: true,
              })),
          ],
        }));
      } catch (error) {
        console.error("Failed to load custom tunings:", error);
      }
    };

    const createCustomTuning = async (
      name: string,
      notes: NoteWithOctave[]
    ) => {
      const id = await addCustomTuning(currentInstrument.value.id, name, notes);
      await loadCustomTunings();
      handleTuningChange(`${CUSTOM_TUNING_PREFIX}${id}`);
    };

    const toDbId = (tuningId: string) =>
      Number(tuningId.slice(CUSTOM_TUNING_PREFIX.length));

    const updateCustomTuning = async (
      tuningId: string,
      name: string,
      notes: NoteWithOctave[]
    ) => {
      if (!tuningId.startsWith(CUSTOM_TUNING_PREFIX)) return;
      await updateTuning(toDbId(tuningId), { name, notes });
      await loadCustomTunings();
      if (currentTuning.value.id === tuningId) {
        selectedString.value = null;
        resetTuning();
      }
    };

    const deleteCustomTuning = async (tuningId: string) => {
      if (!tuningId.startsWith(CUSTOM_TUNING_PREFIX)) return;
      await deleteTuning(toDbId(tuningId));
      if (currentTuning.value.id === tuningId) {
        handleTuningChange(currentInstrument.value.tunings[0].id);
      }
      await loadCustomTunings();
    };

    /** The note the reference tone button plays */
    const referenceNote = computed<NoteWithOctave>(() => {
      if (mode.value === "chromatic") return detectedNote.value ?? "A4";
      return (
        selectedString.value ??
        targetNote.value ??
        currentTuning.value.notes[0]
      );
    });

    const playReference = (note: NoteWithOctave = referenceNote.value) => {
      if (referenceTone.playingNote.value === note) {
        referenceTone.stop();
        return;
      }
      referenceTone.play(getNoteFrequency(note, a4.value), note);
    };

    // The microphone would pick up the reference tone, so ignore it meanwhile
    watch(referenceTone.playingNote, (note) => detection.setPaused(!!note));

    watch(
      [isActive, () => settingsStore.state.keepScreenOn],
      async ([active, keepOn]) => {
        if (!wakeLock.isSupported.value) return;
        try {
          if (active && keepOn) await wakeLock.request("screen");
          else await wakeLock.release();
        } catch (error) {
          console.warn("Wake lock error:", error);
        }
      }
    );

    loadCustomTunings();

    return {
      mode,
      instruments,
      currentInstrumentId,
      currentTuningId,
      currentInstrument,
      currentTuning,
      selectedString,

      pitch,
      level,
      cents,
      isActive,
      detectedNote,
      targetNote,
      accuracyStatus,
      isInTune,

      noteParts,
      adjacentNotes,
      accuracyTextColor,
      formatFrequency,
      formatCents,
      gaugeRotation,
      memoizedTuningState,
      referenceNote,
      playingReferenceNote: referenceTone.playingNote,

      toggleStringSelection,
      start,
      stop,
      setMode,
      handleInstrumentChange,
      handleTuningChange,
      setSelectedString,
      toggleTuner,
      resetTuning,
      createCustomTuning,
      updateCustomTuning,
      deleteCustomTuning,
      playReference,
    };
  },
  {
    persist: {
      key: "tuner",
      storage: localStorage,
      pick: ["mode", "currentInstrumentId", "currentTuningId"],
    },
  }
);
