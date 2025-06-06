import { useDevicesList } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, shallowReactive } from "vue";

interface AppStateI {
  selectedDeviceId: string | null;
}

export const useAppStore = defineStore(
  "app",
  () => {
    const state = shallowReactive<AppStateI>({
      selectedDeviceId: null,
    });

    //TODO: Make this in composble because we dont need control it from here

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

    const selectedDeviceId = computed({
      get: () => state.selectedDeviceId || null,
      set: (value) => setDevice(value || ""),
    });

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

    return {
      state,
      audioDevices,
      selectedDevice,
      selectedDeviceId,
      isSupported,
      ensurePermissions,
      setDevice,
    };
  },
  {
    persist: {
      key: "app",
      storage: localStorage,
    },
  }
);
