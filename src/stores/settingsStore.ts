import { BasicColorSchema, useColorMode } from "@vueuse/core";
import { defineStore } from "pinia";
import { shallowReactive } from "vue";

interface SettingsStateI {
  a4Frequency: number[];
}
export const useSettingsStore = defineStore(
  "settings",
  () => {
    const state = shallowReactive<SettingsStateI>({
      a4Frequency: [440],
    });
    const mode = useColorMode({
      attribute: "class",
      modes: {
        auto: "auto",
        light: "light",
        dark: "dark",
      },
    });

    const changeTheme = (theme: BasicColorSchema) => {
      mode.value = theme;
    };

    //Select frequency[0] because Slider wants to get array into propts
    const setA4Frequency = (frequency: number[]) => {
      if (frequency[0] < 400 || frequency[0] > 500) {
        throw new Error("Frequency out of valid range (400-500Hz)");
      }
      state.a4Frequency = frequency;
    };
    // TODO: Make base object to reset it
    const resetSettings = (): void => {
      state.a4Frequency = [440];
    };
    return {
      state,
      mode,
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
