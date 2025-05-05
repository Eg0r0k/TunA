import { ref, onUnmounted } from "vue";
import { useAppStore } from "@/stores/appStore";
import { TUNER_CONFIG } from "@/constants/tuner";

export const useAudio = () => {
  const appStore = useAppStore();

  const audioContext = ref<AudioContext | null>(null);
  const stream = ref<MediaStream | null>(null);
  const analyser = ref<AnalyserNode | null>(null);
  const isActive = ref(false);

  const start = async () => {
    if (!appStore.isSupported) {
      console.error("MediaDevices API is not supported");
      return;
    }

    try {
      if (stream.value) {
        stream.value.getTracks().forEach((track) => track.stop());
      }

      stream.value = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: appStore.state.selectedDeviceId
            ? { exact: appStore.state.selectedDeviceId }
            : undefined,
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });

      if (!audioContext.value) {
        audioContext.value = new AudioContext();
      }

      const source = audioContext.value.createMediaStreamSource(stream.value);
      analyser.value = audioContext.value.createAnalyser();
      analyser.value.fftSize = TUNER_CONFIG.FFT_SIZE;
      analyser.value.smoothingTimeConstant = 0.2;
      source.connect(analyser.value);

      isActive.value = true;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      isActive.value = false;
    }
  };

  const stop = () => {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop());
      stream.value = null;
    }

    if (analyser.value) {
      analyser.value.disconnect();
      analyser.value = null;
    }

    if (audioContext.value) {
      audioContext.value.close();
      audioContext.value = null;
    }

    isActive.value = false;
  };

  onUnmounted(() => {
    stop();
  });

  return {
    analyser,
    isActive,
    start,
    stop,
  };
};
