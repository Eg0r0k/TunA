import { type NoteWithOctave } from "./notes";

export interface Tuning {
  id: string;
  name: string;
  notes: NoteWithOctave[];
  custom?: boolean;
}

export interface Instrument {
  id: string;
  name: string;
  tunings: Tuning[];
}
