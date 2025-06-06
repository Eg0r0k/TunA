import { NOTES, TUNER_CONFIG } from "@/constants/tuner";
import { useSettingsStore } from "@/stores/settingsStore";
import { NoteName, NoteWithOctave } from "@/types/tuner/notes";

interface SplitedNote {
  name: NoteName | "—";
  octave: string;
}


//TODO: Bad practics to import stores into utils funcs
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

export const getNoteFrequency = (note: NoteWithOctave) => {
  const { name: noteName, octave } = splitNote(note);
  if (noteName === "—") {
    return 0;
  }
  const settingsStore = useSettingsStore();

  const noteIndex = NOTES.indexOf(noteName);
  const a4Index = NOTES.indexOf("A");
  const semitonesFromA4 = noteIndex - a4Index + (parseInt(octave) - 4) * 12;
  return settingsStore.state.a4Frequency[0] * Math.pow(2, semitonesFromA4 / 12);
};

export const getNoteName = (frequency: number): NoteWithOctave | null => {
  if (
    !frequency ||
    frequency < TUNER_CONFIG.MIN_FREQUENCY ||
    frequency > TUNER_CONFIG.MAX_FREQUENCY
  )
    return null;

  const settingsStore = useSettingsStore();

  const semitonesFromA4 =
    12 * Math.log2(frequency / settingsStore.state.a4Frequency[0]);
  const midiNote = Math.round(semitonesFromA4 + 69);
  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = NOTES[noteIndex];

  return `${noteName}${octave}` as NoteWithOctave;
};

export const getPrevNote = (note: string) => {
  const index = NOTES.indexOf(note as NoteName);
  if (index === -1) return "—";
  return NOTES[(index - 1 + NOTES.length) % NOTES.length];
};

export const getNextNote = (note: string) => {
  const index = NOTES.indexOf(note as NoteName);
  if (index === -1) return "—";
  return NOTES[(index + 1) % NOTES.length];
};
