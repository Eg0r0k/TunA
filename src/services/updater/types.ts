export type UpdatePlatform = "web" | "desktop" | "unsupported";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "upToDate"
  | "available"
  | "downloading"
  | "ready"
  | "error";

export interface UpdateInfo {
  version: string | null;
  notes?: string | null;
  date?: string | null;
}

export interface Updater {
  /** Starts background work (service worker registration etc.) */
  init(): Promise<void>;
  /** Returns update info, or null when the app is up to date */
  check(): Promise<UpdateInfo | null>;
  /** Downloads the update, reporting progress in the 0-1 range when known */
  download(onProgress: (progress: number | null) => void): Promise<void>;
  /** Applies a downloaded update and restarts the app */
  apply(): Promise<void>;
}

export interface UpdaterCallbacks {
  /** The update was found and downloaded without an explicit check (web) */
  onReady(info: UpdateInfo): void;
  onOfflineReady(): void;
}
