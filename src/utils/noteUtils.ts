import { NOTES, TUNER_CONFIG } from "@/constants/tuner";
import { NoteName, NoteWithOctave } from "@/types/tuner/notes";

interface SplitedNote {
  name: NoteName | "—";
  octave: string;
}
const MIDI_A4 = 69;
const SEMITONES_IN_OCTAVE = 12;
const BASE_OCTAVE = 4;

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

export const getNoteFrequency = (note: NoteWithOctave, a4Frequency: number) => {
  const { name: noteName, octave } = splitNote(note);
  if (noteName === "—") {
    return 0;
  }

  const noteIndex = NOTES.indexOf(noteName);
  const a4Index = NOTES.indexOf("A");
  const semitonesFromA4 =
    noteIndex -
    a4Index +
    (parseInt(octave) - BASE_OCTAVE) * SEMITONES_IN_OCTAVE;
  return a4Frequency * Math.pow(2, semitonesFromA4 / SEMITONES_IN_OCTAVE);
};

export const getNoteName = (
  frequency: number,
  a4Frequency: number
): NoteWithOctave | null => {
  if (
    !frequency ||
    frequency < TUNER_CONFIG.MIN_FREQUENCY ||
    frequency > TUNER_CONFIG.MAX_FREQUENCY
  )
    return null;

  const semitonesFromA4 =
    Math.log2(frequency / a4Frequency) * SEMITONES_IN_OCTAVE;
  const midiNote = Math.round(semitonesFromA4 + MIDI_A4);
  const noteIndex = midiNote % SEMITONES_IN_OCTAVE;
  const octave = Math.floor(midiNote / SEMITONES_IN_OCTAVE) - 1;
  const noteName = NOTES[noteIndex];

  return `${noteName}${octave}` as NoteWithOctave;
};

const findNoteIndex = (noteName: string): number => {
  return NOTES.indexOf(noteName as NoteName);
};

export const getPrevNote = (note: string): NoteName | "—" => {
  const index = findNoteIndex(note);
  if (index === -1) return "—";
  return NOTES[(index - 1 + NOTES.length) % NOTES.length];
};

export const getNextNote = (note: string): NoteName | "—" => {
  const index = findNoteIndex(note);
  if (index === -1) return "—";
  return NOTES[(index + 1) % NOTES.length];
};
