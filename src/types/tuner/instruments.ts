import { NoteWithOctave } from "./notes";

export interface Tuning {
  id: string;
  name: string;
  notes: NoteWithOctave[];
}

export interface Instrument {
  id: string;
  name: string;
  tunings: Tuning[];
}
