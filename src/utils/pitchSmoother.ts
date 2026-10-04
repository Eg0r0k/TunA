import { TUNER_CONFIG } from "@/constants/tuner";
import { getCents } from "./noteUtils";

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/**
 * Median filter for pitch readings.
 *
 * Small fluctuations are smoothed out, while a sustained jump (a new note)
 * replaces the history once it is confirmed by several consecutive readings,
 * so single-frame octave errors don't move the needle.
 */
export class PitchSmoother {
  private history: number[] = [];
  private candidate: number[] = [];

  constructor(
    private readonly windowSize: number = TUNER_CONFIG.SMOOTHING_WINDOW,
    private readonly jumpCents: number = TUNER_CONFIG.NOTE_CHANGE_CENTS,
    private readonly confirmCount: number = TUNER_CONFIG.NOTE_CHANGE_CONFIRM
  ) {}

  push(pitch: number): number {
    if (this.history.length === 0) {
      this.history = [pitch];
      return pitch;
    }

    const current = median(this.history);
    if (Math.abs(getCents(pitch, current)) <= this.jumpCents) {
      this.history.push(pitch);
      if (this.history.length > this.windowSize) this.history.shift();
      this.candidate = [];
      return median(this.history);
    }

    const sameCandidate =
      this.candidate.length > 0 &&
      Math.abs(getCents(pitch, this.candidate[0])) <= this.jumpCents;
    this.candidate = sameCandidate ? [...this.candidate, pitch] : [pitch];

    if (this.candidate.length >= this.confirmCount) {
      this.history = this.candidate;
      this.candidate = [];
      return median(this.history);
    }
    return current;
  }

  reset(): void {
    this.history = [];
    this.candidate = [];
  }
}
