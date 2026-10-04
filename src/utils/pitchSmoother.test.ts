import { describe, expect, it } from "vitest";
import { PitchSmoother } from "./pitchSmoother";

describe("PitchSmoother", () => {
  it("returns the first reading as is", () => {
    expect(new PitchSmoother().push(440)).toBe(440);
  });

  it("filters out a single outlier within the note", () => {
    const smoother = new PitchSmoother(5, 80, 2);
    [440, 441, 439, 440].forEach((p) => smoother.push(p));
    expect(smoother.push(446)).toBe(440);
  });

  it("ignores a one-frame octave error", () => {
    const smoother = new PitchSmoother(5, 80, 2);
    [110, 110, 110].forEach((p) => smoother.push(p));
    expect(smoother.push(220)).toBe(110);
    expect(smoother.push(110)).toBe(110);
  });

  it("switches to a new note once it is confirmed", () => {
    const smoother = new PitchSmoother(5, 80, 2);
    [110, 110, 110].forEach((p) => smoother.push(p));
    expect(smoother.push(147)).toBe(110);
    expect(smoother.push(147)).toBe(147);
  });

  it("starts over after reset", () => {
    const smoother = new PitchSmoother();
    smoother.push(110);
    smoother.reset();
    expect(smoother.push(330)).toBe(330);
  });
});
