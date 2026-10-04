import { NOTES, TUNER_CONFIG, TUNER_CONSTANTS } from "@/constants/tuner";
import { NoteName, NoteWithOctave } from "@/types/tuner/notes";

const { A4: A4_MIDI, SEMITONES_IN_OCTAVE } = TUNER_CONSTANTS.MIDI;
const { CENTS_PER_SEMITONE } = TUNER_CONSTANTS.PITCH;

interface SplitedNote {
  name: NoteName | "—";
  octave: string;
}

export const splitNote = (
  note: NoteWithOctave | null | undefined
): SplitedNote => {
  if (!note || typeof note !== "string") {
    return { name: "—", octave: "" };
  }
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) {
    return { name: "—", octave: "" };
  }
  const [, name, octave] = match;
  return {
    name: NOTES.includes(name as NoteName) ? (name as NoteName) : "—",
    octave,
  };
};

/** MIDI number of a note (A4 = 69), or null for an unparsable note */
export const noteToMidi = (note: NoteWithOctave): number | null => {
  const { name, octave } = splitNote(note);
  if (name === "—") return null;
  return (
    (parseInt(octave) + TUNER_CONSTANTS.OCTAVE.OFFSET) * SEMITONES_IN_OCTAVE +
    NOTES.indexOf(name)
  );
};

export const midiToNote = (midi: number): NoteWithOctave => {
  const noteIndex =
    ((midi % SEMITONES_IN_OCTAVE) + SEMITONES_IN_OCTAVE) % SEMITONES_IN_OCTAVE;
  const octave =
    Math.floor(midi / SEMITONES_IN_OCTAVE) - TUNER_CONSTANTS.OCTAVE.OFFSET;
  return `${NOTES[noteIndex]}${octave}` as NoteWithOctave;
};

export const midiToFrequency = (midi: number, a4Frequency: number): number =>
  a4Frequency * Math.pow(2, (midi - A4_MIDI) / SEMITONES_IN_OCTAVE);

/** Fractional MIDI number of a frequency */
export const frequencyToMidi = (frequency: number, a4Frequency: number) =>
  Math.log2(frequency / a4Frequency) * SEMITONES_IN_OCTAVE + A4_MIDI;

export const getNoteFrequency = (note: NoteWithOctave, a4Frequency: number) => {
  const midi = noteToMidi(note);
  return midi === null ? 0 : midiToFrequency(midi, a4Frequency);
};

const isInRange = (frequency: number) =>
  frequency >= TUNER_CONFIG.MIN_FREQUENCY &&
  frequency <= TUNER_CONFIG.MAX_FREQUENCY;

export const getNoteName = (
  frequency: number,
  a4Frequency: number
): NoteWithOctave | null => {
  if (!frequency || !isInRange(frequency)) return null;
  return midiToNote(Math.round(frequencyToMidi(frequency, a4Frequency)));
};

/** Deviation of `frequency` from `targetFrequency` in cents */
export const getCents = (frequency: number, targetFrequency: number) => {
  if (frequency <= 0 || targetFrequency <= 0) return 0;
  return SEMITONES_IN_OCTAVE * CENTS_PER_SEMITONE * Math.log2(frequency / targetFrequency);
};

/**
 * The note from `notes` closest to `frequency` (by absolute cents distance).
 * Used for automatic string detection.
 */
export const findClosestNote = (
  frequency: number,
  notes: readonly NoteWithOctave[],
  a4Frequency: number
): NoteWithOctave | null => {
  if (!frequency || notes.length === 0) return null;
  let closest: NoteWithOctave | null = null;
  let minDistance = Infinity;
  for (const note of notes) {
    const distance = Math.abs(
      getCents(frequency, getNoteFrequency(note, a4Frequency))
    );
    if (distance < minDistance) {
      minDistance = distance;
      closest = note;
    }
  }
  return closest;
};

/** Neighbouring semitones of a note, with correct octaves (B3 → C4) */
export const getAdjacentNotes = (
  note: NoteWithOctave | null
): { prev: NoteWithOctave | null; next: NoteWithOctave | null } => {
  const midi = note ? noteToMidi(note) : null;
  if (midi === null) return { prev: null, next: null };
  return { prev: midiToNote(midi - 1), next: midiToNote(midi + 1) };
};
