import { useColorMode, useDevicesList } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, shallowReactive } from "vue";

interface AppStateI {
  selectedDeviceId: string | null;
  a4Frequency: number[];
}

export const useAppStore = defineStore(
  "app",
  () => {
    const state = shallowReactive<AppStateI>({
      selectedDeviceId: null,
      a4Frequency: [440],
    });

    const audioDevices = computed(() =>
      mediaDevices.value.filter(
        (device) => device.kind === "audioinput" && device.deviceId
      )
    );

    const selectedDevice = computed(
      () =>
        audioDevices.value.find((d) => d.deviceId === state.selectedDeviceId) ??
        null
    );

    const {
      devices: mediaDevices,
      isSupported,
      ensurePermissions,
    } = useDevicesList({
      requestPermissions: true,
      constraints: { audio: true },
      onUpdated() {
        if (!state.selectedDeviceId && audioDevices.value.length > 0) {
          state.selectedDeviceId = audioDevices.value[0].deviceId;
        } else if (audioDevices.value.length === 0) {
          state.selectedDeviceId = null;
        }
      },
    });

    const setDevice = async (deviceId: string) => {
      try {
        await ensurePermissions();
        if (
          !deviceId ||
          !audioDevices.value.some((d) => d.deviceId === deviceId)
        ) {
          throw new Error("Invalid audio device ID");
        }

        state.selectedDeviceId = deviceId;
      } catch (error) {
        console.error("Device selection error:", error);
        state.selectedDeviceId = null;
        throw error;
      }
    };

    const setA4Frequency = (frequency: number[]) => {
      if (frequency[0] < 400 || frequency[0] > 500) {
        throw new Error("Frequency out of valid range (400-500Hz)");
      }
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
      ensurePermissions,
      selectedDevice,
      setDevice,
      setA4Frequency,
      isSupported,
    };
  },
  {
    persist: {
      key: "app",
      storage: localStorage,
    },
  }
);
