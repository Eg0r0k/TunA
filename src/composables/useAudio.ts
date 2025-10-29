import { ref, onUnmounted, shallowReactive, computed, readonly } from "vue";
import { useAppStore } from "@/stores/appStore";
import { TUNER_CONFIG } from "@/constants/tuner";
import { toast } from "vue-sonner";
import { useI18n } from "vue-i18n";
import { AudioService } from "@/services/audio/audioService";
import { AudioError, AudioState } from "@/services/audio";

export const useAudio = () => {
  const appStore = useAppStore();
  const { t } = useI18n();
  const isActive = ref(false);

  const state = shallowReactive<AudioState>({
    context: null,
    stream: null,
    analyser: null,
    sourceNode: null,
  });

  const handleAudioError = (error: Error) => {
    const errorType = error.name as AudioError;
    console.log("Audio error:", errorType, error);
    const errorMessages = {
      NotAllowedError: "errors.microphonePermissionDenied",
      NotFoundError: "errors.microphoneNotFound",
      NotSupportedError: "errors.mediaApiError",
    };
    const errorMessage = errorMessages[errorType] || "errors.unknownError";
    toast.error(t(errorMessage));
  };

  const initializeAnalyser = (
    context: AudioContext,
    source: MediaStreamAudioSourceNode
  ) => {
    const analyser = context.createAnalyser();
    analyser.fftSize = TUNER_CONFIG.FFT_SIZE;
    analyser.smoothingTimeConstant = TUNER_CONFIG.SMOOTHING_TIME;
    source.connect(analyser);
    return analyser;
  };

  const start = async () => {
    if (!appStore.isSupported) {
      toast.error(t("errors.mediaApiError"));
      return;
    }

    try {
      cleanup();

      const { stream, context } = await AudioService.initializeAudio(
        appStore.state.selectedDeviceId ?? undefined
      );

      const source = context.createMediaStreamSource(stream);
      const analyser = initializeAnalyser(context, source);

      Object.assign(state, {
        context,
        stream,
        analyser,
        sourceNode: source,
      });

      isActive.value = true;
    } catch (error) {
      isActive.value = false;
      cleanup();
      if (error instanceof Error) {
        handleAudioError(error);
      }
      throw error;
    }
  };

  const cleanup = () => {
    try {
      [state.sourceNode, state.analyser].forEach((node) => {
        if (node) {
          node.disconnect();
        }
      });

      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }

      if (state.context?.state !== "closed") {
        state.context?.close().catch(console.error);
      }

      Object.assign(state, {
        context: null,
        stream: null,
        analyser: null,
        sourceNode: null,
      });
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  const stop = () => {
    isActive.value = false;
    cleanup();
  };

  onUnmounted(stop);

  return {
    analyser: computed(() => state.analyser),
    isActive: readonly(isActive),
    start,
    stop,
  };
};
