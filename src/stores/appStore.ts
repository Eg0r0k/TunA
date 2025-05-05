import { useColorMode, useDevicesList } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, reactive } from "vue";

interface AppStateI {
  selectedDeviceId: string | null;
  a4Frequency: number[];
}

export const useAppStore = defineStore("app", () => {
  const state = reactive<AppStateI>({
    selectedDeviceId: null,
    a4Frequency: [440],
  });

  const { devices: mediaDevices, isSupported } = useDevicesList({
    requestPermissions: true,
    constraints: { audio: true },
  });

  const audioDevices = computed(
    () =>
      mediaDevices.value?.filter((device) => device.kind === "audioinput") ?? []
  );

  const selectedDevice = computed(
    () =>
      audioDevices.value.find((d) => d.deviceId === state.selectedDeviceId) ||
      null
  );

  const setDevice = (deviceId: string) => {
    state.selectedDeviceId = deviceId;
  };

  const setA4Frequency = (frequency: number[]) => {
    state.a4Frequency = frequency;
  };

  const mode = useColorMode({
    attribute: "class",
    modes: {
      auto: "auto",
      light: "light",
      dark: "dark",
    },
  });

  return {
    mode,
    state,
    audioDevices,
    selectedDevice,
    setDevice,
    setA4Frequency,
    isSupported,
  };
});
