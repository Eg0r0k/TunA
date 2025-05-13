import { Instrument } from "@/types/tuner/instruments";

export const INSTRUMENTS: Instrument[] = [
  {
    id: "guitar",
    name: "Guitar",
    tunings: [
      {
        id: "standard",
        name: "Standard E",
        notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
      },
      {
        id: "drop-d",
        name: "Drop D",
        notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
      },
      {
        id: "drop-c",
        name: "Drop C",
        notes: ["C2", "G2", "C3", "F3", "A3", "D4"],
      },
      {
        id: "drop-b",
        name: "Drop B",
        notes: ["B1", "F#2", "B2", "E3", "G#3", "C#4"],
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
      {
        id: "open-c",
        name: "Open C",
        notes: ["C2", "G2", "C3", "G3", "C4", "E4"],
      },
      {
        id: "dadgad",
        name: "DADGAD",
        notes: ["D2", "A2", "D3", "G3", "A3", "D4"],
      },
      {
        id: "half-step-down",
        name: "Half Step Down",
        notes: ["D#2", "G#2", "C#3", "F#3", "A#3", "D#4"],
      },
    ],
  },
  {
    id: "bass",
    name: "Bass",
    tunings: [
      {
        id: "standard-bass",
        name: "Standard",
        notes: ["E1", "A1", "D2", "G2"],
      },
      {
        id: "drop-d-bass",
        name: "Drop D",
        notes: ["D1", "A1", "D2", "G2"],
      },
      {
        id: "five-string",
        name: "5-String",
        notes: ["B0", "E1", "A1", "D2", "G2"],
      },
      {
        id: "six-string",
        name: "6-String",
        notes: ["B0", "E1", "A1", "D2", "G2", "C3"],
      },
      {
        id: "half-step-down-bass",
        name: "Half Step Down",
        notes: ["D#1", "G#1", "C#2", "F#2"],
      },
    ],
  },
  {
    id: "ukulele",
    name: "Ukulele",
    tunings: [
      {
        id: "standard-ukulele",
        name: "Standard (GCEA)",
        notes: ["G4", "C4", "E4", "A4"],
      },
      {
        id: "low-g",
        name: "Low G",
        notes: ["G3", "C4", "E4", "A4"],
      },
      {
        id: "d-tuning",
        name: "D Tuning",
        notes: ["A4", "D4", "F#4", "B4"],
      },
      {
        id: "baritone",
        name: "Baritone",
        notes: ["D3", "G3", "B3", "E4"],
      },
    ],
  },
  {
    id: "classical-guitar",
    name: "Classical Guitar",
    tunings: [
      {
        id: "standard-classical",
        name: "Standard",
        notes: ["E2", "A2", "D3", "G3", "B3", "E4"],
      },
      {
        id: "dropped-d-classical",
        name: "Dropped D",
        notes: ["D2", "A2", "D3", "G3", "B3", "E4"],
      },
    ],
  },
  {
    id: "seven-string",
    name: "7-String Guitar",
    tunings: [
      {
        id: "standard-7string",
        name: "Standard B",
        notes: ["B1", "E2", "A2", "D3", "G3", "B3", "E4"],
      },
      {
        id: "drop-a-7string",
        name: "Drop A",
        notes: ["A1", "E2", "A2", "D3", "G3", "B3", "E4"],
      },
    ],
  },
  {
    id: "balalaika",
    name: "Balalaika",
    tunings: [
      {
        id: "standard-balalaika",
        name: "Standard (EEA)",
        notes: ["E4", "E4", "A4"],
      },
    ],
  },
  {
    id: "mandolin",
    name: "Mandolin",
    tunings: [
      {
        id: "standard-mandolin",
        name: "Standard",
        notes: ["G3", "D4", "A4", "E5"],
      },
    ],
  },
];
