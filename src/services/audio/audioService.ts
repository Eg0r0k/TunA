export class AudioService {
  private static async createAudioStream(
    deviceId?: string
  ): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
      },
    });
  }

  private static async setupAudioContext() {
    const context = new AudioContext();
    if (context.state === "suspended") {
      await context.resume();
    }
    return context;
  }

  static async initializeAudio(deviceId?: string) {
    const stream = await this.createAudioStream(deviceId);
    const context = await this.setupAudioContext();
    return { stream, context };
  }
}
