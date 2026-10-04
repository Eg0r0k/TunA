import { ref, shallowReactive, computed, readonly } from "vue";
import { useAppStore } from "@/stores/appStore";
import { TUNER_CONFIG } from "@/constants/tuner";
import { toast } from "vue-sonner";
import { i18n } from "@/i18n";
import { AudioService } from "@/services/audio/audioService";
import { AudioError, AudioState } from "@/services/audio";

const ERROR_MESSAGES: Record<AudioError, string> = {
  NotAllowedError: "errors.microphonePermissionDenied",
  NotFoundError: "errors.microphoneNotFound",
  OverconstrainedError: "errors.microphoneNotFound",
  NotReadableError: "errors.microphoneBusy",
  NotSupportedError: "errors.mediaApiError",
};

interface UseAudioOptions {
  /** Called when the input device disappears while recording */
  onEnded?: () => void;
}

/**
 * Microphone input. Has no component lifecycle hooks on purpose: it lives in
 * a store, so whoever owns the store decides when to stop it.
 */
export const useAudio = ({ onEnded }: UseAudioOptions = {}) => {
  const appStore = useAppStore();
  const { t } = i18n.global;
  const isActive = ref(false);

  const state = shallowReactive<AudioState>({
    context: null,
    stream: null,
    analyser: null,
    sourceNode: null,
  });

  const handleAudioError = (error: Error) => {
    console.error("Audio error:", error.name, error);
    const message =
      ERROR_MESSAGES[error.name as AudioError] ?? "errors.unknownError";
    toast.error(t(message));
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

  const handleTrackEnded = () => {
    if (!isActive.value) return;
    stop();
    toast.warning(t("errors.microphoneDisconnected"));
    onEnded?.();
  };

  /** Resolves to `true` when the microphone is running */
  const start = async (): Promise<boolean> => {
    if (!appStore.isSupported) {
      toast.error(t("errors.mediaApiError"));
      return false;
    }

    try {
      cleanup();

      const { stream, context, usedFallbackDevice } =
        await AudioService.initializeAudio(
          appStore.state.selectedDeviceId ?? undefined
        );

      if (usedFallbackDevice) {
        appStore.state.selectedDeviceId = null;
        toast.info(t("errors.deviceFallback"));
      }

      const source = context.createMediaStreamSource(stream);
      const analyser = initializeAnalyser(context, source);
      stream
        .getAudioTracks()
        .forEach((track) => track.addEventListener("ended", handleTrackEnded));

      Object.assign(state, {
        context,
        stream,
        analyser,
        sourceNode: source,
      });

      isActive.value = true;
      return true;
    } catch (error) {
      isActive.value = false;
      cleanup();
      if (error instanceof Error) {
        handleAudioError(error);
      }
      return false;
    }
  };

  const cleanup = () => {
    try {
      [state.sourceNode, state.analyser].forEach((node) => node?.disconnect());

      state.stream?.getTracks().forEach((track) => {
        track.removeEventListener("ended", handleTrackEnded);
        track.stop();
      });

      if (state.context && state.context.state !== "closed") {
        state.context.close().catch(console.error);
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

  return {
    analyser: computed(() => state.analyser),
    isActive: readonly(isActive),
    start,
    stop,
  };
};
