import type { Update } from "@tauri-apps/plugin-updater";
import { Updater } from "./types";

/**
 * Desktop updates via tauri-plugin-updater: the signed bundle is downloaded
 * from GitHub Releases (see `plugins.updater` in `tauri.conf.json`).
 */
export const createTauriUpdater = (): Updater => {
  let pending: Update | null = null;
  let downloaded = false;

  const check = async () => {
    const { check: checkUpdate } = await import("@tauri-apps/plugin-updater");
    const update = await checkUpdate();
    if (!update) return null;

    if (pending && pending.version !== update.version) {
      await pending.close().catch(() => undefined);
      downloaded = false;
    }
    pending = update;
    return { version: update.version, notes: update.body, date: update.date };
  };

  const download = async (onProgress: (progress: number | null) => void) => {
    if (!pending) throw new Error("No update to download");
    if (downloaded) return;

    let total = 0;
    let received = 0;
    await pending.download((event) => {
      switch (event.event) {
        case "Started":
          total = event.data.contentLength ?? 0;
          onProgress(total ? 0 : null);
          break;
        case "Progress":
          received += event.data.chunkLength;
          onProgress(total ? Math.min(1, received / total) : null);
          break;
        case "Finished":
          onProgress(1);
          break;
      }
    });
    downloaded = true;
  };

  const apply = async () => {
    if (!pending || !downloaded) throw new Error("Update is not downloaded");
    await pending.install();
    const { relaunch } = await import("@tauri-apps/plugin-process");
    await relaunch();
  };

  return { init: async () => undefined, check, download, apply };
};
