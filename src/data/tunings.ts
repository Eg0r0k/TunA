import { NoteWithOctave } from "@/constants/tuner";

export interface Tuning {
  id: string;
  name: string;
  notes: NoteWithOctave[];
}

export const GUITAR_TUNINGS: Tuning[] = [
  {
    id: "standard",
    name: "Standard",
    notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
  },
  {
    id: "drop-d",
    name: "Drop D",
    notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
  },
  {
    id: "open-d",
    name: "Open D",
    notes: ["D2", "A2", "D3", "F#3", "A3", "D4"],
  },
  {
    id: "open-g",
    name: "Open G",
    notes: ["D2", "G2", "D3", "G3", "B3", "D4"],
  },
];
