import { readonly, ref } from "vue";
import { TUNER_CONFIG } from "@/constants/tuner";
import { NoteWithOctave } from "@/types/tuner/notes";

// Harmonic amplitudes of a soft, slightly "plucked" timbre
const HARMONICS = [0, 1, 0.45, 0.25, 0.12, 0.06];
const PEAK_GAIN = 0.35;
const ATTACK = 0.015;

/** Plays a reference pitch through the speakers */
export const useReferenceTone = () => {
  const playingNote = ref<NoteWithOctave | null>(null);

  let context: AudioContext | null = null;
  let wave: PeriodicWave | null = null;
  let current: { oscillator: OscillatorNode; gain: GainNode } | null = null;

  const getContext = (): AudioContext => {
    if (!context || context.state === "closed") {
      context = new AudioContext();
      const real = new Float32Array(HARMONICS.length);
      const imag = new Float32Array(HARMONICS);
      wave = context.createPeriodicWave(real, imag);
    }
    return context;
  };

  const stop = () => {
    if (!current || !context) return;
    const { oscillator, gain } = current;
    const now = context.currentTime;
    // Quick fade out avoids an audible click
    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(0, now, 0.02);
    oscillator.stop(now + 0.1);
    current = null;
    playingNote.value = null;
  };

  const play = async (
    frequency: number,
    note: NoteWithOctave,
    durationMs: number = TUNER_CONFIG.REFERENCE_TONE_DURATION
  ) => {
    stop();
    const ctx = getContext();
    await ctx.resume();

    const now = ctx.currentTime;
    const duration = durationMs / 1000;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    if (wave) oscillator.setPeriodicWave(wave);
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(PEAK_GAIN, now + ATTACK);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);

    const playing = { oscillator, gain };
    current = playing;
    playingNote.value = note;

    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
      if (current === playing) {
        current = null;
        playingNote.value = null;
      }
    };
  };

  const dispose = () => {
    stop();
    context?.close().catch(console.error);
    context = null;
  };

  return {
    playingNote: readonly(playingNote),
    play,
    stop,
    dispose,
  };
};
