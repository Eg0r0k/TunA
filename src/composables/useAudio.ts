import { ref, onUnmounted, shallowRef } from "vue";
import { useAppStore } from "@/stores/appStore";
import { TUNER_CONFIG } from "@/constants/tuner";
import { toast } from "vue-sonner";
import { useI18n } from "vue-i18n";

export const useAudio = () => {
  const appStore = useAppStore();
  const { t } = useI18n();
  const audioContext = shallowRef<AudioContext | null>(null);
  const stream = shallowRef<MediaStream | null>(null);
  const analyser = shallowRef<AnalyserNode | null>(null);
  const isActive = ref(false);
  const sourceNode = shallowRef<MediaStreamAudioSourceNode | null>(null);

  //! Needs to improve !
  const start = async () => {
    if (!appStore.isSupported) {
      console.error("MediaDevices API is not supported");
      toast.error(t("errors.mediaApiError"));
      return;
    }
    try {
      cleanup();

      // I don't think this is the best place to call mediaDevices
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: appStore.state.selectedDeviceId
            ? { exact: appStore.state.selectedDeviceId }
            : undefined,
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });

      stream.value = newStream;

      // Create new AudioContext for analysis
      const context = new AudioContext();
      audioContext.value = context;

      // Continue the context if the browser has paused it
      if (context.state === "suspended") {
        await context.resume();
      }

      const source = context.createMediaStreamSource(newStream);
      sourceNode.value = source;

      const newAnalyser = context.createAnalyser();
      newAnalyser.fftSize = TUNER_CONFIG.FFT_SIZE;
      newAnalyser.smoothingTimeConstant = TUNER_CONFIG.SMOOTHING_TIME;

      source.connect(newAnalyser);
      analyser.value = newAnalyser;

      isActive.value = true;
    } catch (error: unknown) {
      isActive.value = false;
      cleanup();
      if (error instanceof Error) {
        switch (error.name) {
          case "NotAllowedError":
            toast.error(t("errors.microphonePermissionDenied"));
            break;
          case "NotFoundError":
            toast.error(t("errors.microphoneNotFound"));
            break;
          default:
            toast.error(t("errors.unknownError"), {
              description: error.message,
            });
        }
        console.error("Error accessing audio:", error);
      } else {
        toast.error(t("errors.unknownError"));
        console.error("Unknown error accessing audio:", error);
      }
      throw error;
    }
  };

  const cleanup = () => {
    try {
      // 1. Clean source node
      if (sourceNode.value) {
        sourceNode.value.disconnect();
        sourceNode.value = null;
      }
      // 2. Clean analyser 
      if (analyser.value) {
        analyser.value.disconnect();
        analyser.value = null;
      }
      // 3. Clean streams
      if (stream.value) {
        stream.value.getTracks().forEach((track) => track.stop());
        stream.value = null;
      }
      // 4. Clean audio context 
      if (audioContext.value && audioContext.value.state !== "closed") {
        audioContext.value.close().catch(console.error);
        audioContext.value = null;
      }
    } catch (error: unknown) {
      console.error("Cleanup error:", error);
    }
  };

  const stop = () => {
    isActive.value = false;
    cleanup();
  };

  onUnmounted(stop);

  return {
    analyser,
    isActive,
    start,
    stop,
  };
};
