import { describe, expect, it } from "vitest";
import {
  findClosestNote,
  getAdjacentNotes,
  getCents,
  getNoteFrequency,
  getNoteName,
  midiToNote,
  noteToMidi,
  splitNote,
} from "./noteUtils";

describe("splitNote", () => {
  it("splits name and octave", () => {
    expect(splitNote("C#4")).toEqual({ name: "C#", octave: "4" });
    expect(splitNote("B-1")).toEqual({ name: "B", octave: "-1" });
  });

  it("returns a placeholder for empty input", () => {
    expect(splitNote(null)).toEqual({ name: "—", octave: "" });
  });
});

describe("midi conversion", () => {
  it.each([
    ["A4", 69],
    ["C4", 60],
    ["E2", 40],
    ["C-1", 0],
  ] as const)("%s ↔ %i", (note, midi) => {
    expect(noteToMidi(note)).toBe(midi);
    expect(midiToNote(midi)).toBe(note);
  });
});

describe("getNoteFrequency", () => {
  it.each([
    ["A4", 440, 440],
    ["A3", 440, 220],
    ["E2", 440, 82.4069],
    ["C4", 440, 261.6256],
    ["A4", 432, 432],
  ] as const)("%s at A4=%i Hz is %f Hz", (note, a4, expected) => {
    expect(getNoteFrequency(note, a4)).toBeCloseTo(expected, 3);
  });
});

describe("getNoteName", () => {
  it("maps frequencies to the nearest note", () => {
    expect(getNoteName(440, 440)).toBe("A4");
    expect(getNoteName(82.41, 440)).toBe("E2");
    expect(getNoteName(445, 440)).toBe("A4");
    expect(getNoteName(261.63, 440)).toBe("C4");
  });

  it("respects the A4 calibration", () => {
    // 440 Hz is ~+31 cents above A4 when A4 = 432 Hz, still A4
    expect(getNoteName(440, 432)).toBe("A4");
    // with A4 = 466.16 Hz, 440 Hz is a semitone lower
    expect(getNoteName(440, 466.16)).toBe("G#4");
  });

  it("ignores frequencies out of range", () => {
    expect(getNoteName(0, 440)).toBeNull();
    expect(getNoteName(10, 440)).toBeNull();
    expect(getNoteName(10000, 440)).toBeNull();
  });
});

describe("getCents", () => {
  it("is zero for equal frequencies", () => {
    expect(getCents(440, 440)).toBe(0);
  });

  it("is 1200 per octave", () => {
    expect(getCents(880, 440)).toBeCloseTo(1200);
    expect(getCents(220, 440)).toBeCloseTo(-1200);
  });

  it("is 100 per semitone", () => {
    expect(getCents(getNoteFrequency("A#4", 440), 440)).toBeCloseTo(100);
  });
});

describe("findClosestNote", () => {
  const standard = ["E2", "A2", "D3", "G3", "B3", "E4"] as const;

  it("finds the string being played", () => {
    expect(findClosestNote(110.5, standard, 440)).toBe("A2");
    expect(findClosestNote(329, standard, 440)).toBe("E4");
  });

  it("picks the closest string for a detuned one", () => {
    // D3 tuned a semitone flat is still closer to D3 than to A2
    expect(findClosestNote(138.6, standard, 440)).toBe("D3");
  });

  it("returns null without a pitch", () => {
    expect(findClosestNote(0, standard, 440)).toBeNull();
  });
});

describe("getAdjacentNotes", () => {
  it("crosses octave boundaries correctly", () => {
    expect(getAdjacentNotes("B3")).toEqual({ prev: "A#3", next: "C4" });
    expect(getAdjacentNotes("C4")).toEqual({ prev: "B3", next: "C#4" });
  });

  it("handles a missing note", () => {
    expect(getAdjacentNotes(null)).toEqual({ prev: null, next: null });
  });
});
