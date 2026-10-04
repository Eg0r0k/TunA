import { BasicColorSchema, useColorMode } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, shallowReactive } from "vue";
import { TUNER_CONFIG } from "@/constants/tuner";

interface SettingsState {
  // Arrays because the Slider component works with arrays
  a4Frequency: number[];
  toleranceCents: number[];
  /** Select the next untuned string once the selected one is in tune */
  autoAdvance: boolean;
  /** Keep the screen awake while the tuner is running */
  keepScreenOn: boolean;
}

const createDefaultState = (): SettingsState => ({
  a4Frequency: [440],
  toleranceCents: [TUNER_CONFIG.DEFAULT_TOLERANCE_CENTS],
  autoAdvance: true,
  keepScreenOn: true,
});

export const useSettingsStore = defineStore(
  "settings",
  () => {
    const state = shallowReactive<SettingsState>(createDefaultState());
    const mode = useColorMode({
      attribute: "class",
      modes: {
        auto: "auto",
        light: "light",
        dark: "dark",
      },
    });

    const a4 = computed(() => state.a4Frequency[0]);
    const tolerance = computed(() => state.toleranceCents[0]);

    const changeTheme = (theme: BasicColorSchema) => {
      mode.value = theme;
    };

    const setA4Frequency = (frequency: number[]) => {
      if (frequency[0] < 400 || frequency[0] > 500) {
        throw new Error("Frequency out of valid range (400-500Hz)");
      }
      state.a4Frequency = frequency;
    };

    const resetSettings = (): void => {
      Object.assign(state, createDefaultState());
    };

    return {
      state,
      mode,
      a4,
      tolerance,
      changeTheme,
      setA4Frequency,
      resetSettings,
    };
  },
  {
    persist: {
      key: "settings",
      storage: localStorage,
    },
  }
);
