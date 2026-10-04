import { AudioInitResult } from "./types";

// Errors meaning the requested device is gone, but another one may work
const DEVICE_UNAVAILABLE_ERRORS = ["OverconstrainedError", "NotFoundError"];

export class AudioService {
  private static createAudioStream(deviceId?: string): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
      },
    });
  }

  static async initializeAudio(deviceId?: string): Promise<AudioInitResult> {
    // The context is created before any `await`, while we are still inside the
    // user gesture, otherwise Safari/iOS keeps it suspended
    const context = new AudioContext();
    const resumed = context.resume();

    try {
      let usedFallbackDevice = false;
      let stream: MediaStream;
      try {
        stream = await this.createAudioStream(deviceId);
      } catch (error) {
        if (
          !deviceId ||
          !(error instanceof Error) ||
          !DEVICE_UNAVAILABLE_ERRORS.includes(error.name)
        ) {
          throw error;
        }
        stream = await this.createAudioStream();
        usedFallbackDevice = true;
      }

      await resumed;
      return { stream, context, usedFallbackDevice };
    } catch (error) {
      context.close().catch(console.error);
      throw error;
    }
  }
}
