import { registerSW } from "virtual:pwa-register";
import { UpdateInfo, Updater, UpdaterCallbacks } from "./types";

interface VersionManifest {
  version: string;
  buildTime: string;
}

/** Reads `version.json` emitted at build time, bypassing all caches */
const fetchRemoteVersion = async (): Promise<UpdateInfo> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}version.json`, {
      cache: "no-store",
    });
    if (!response.ok) return { version: null };
    const manifest = (await response.json()) as VersionManifest;
    return { version: manifest.version, date: manifest.buildTime };
  } catch {
    return { version: null };
  }
};

// How long `download` waits for the new service worker to install
const INSTALL_TIMEOUT = 60_000;

/**
 * PWA updates via the service worker. A new worker installs in the background
 * and waits; activating it requires a reload, which the user confirms.
 *
 * Waiting workers are tracked on the registration directly: workbox-window
 * treats a worker found by a manual `registration.update()` as "external" and
 * would neither report it reliably nor reload the page after activating it.
 */
export const createPwaUpdater = (callbacks: UpdaterCallbacks): Updater => {
  let registration: ServiceWorkerRegistration | undefined;
  let notifiedWorker: ServiceWorker | null = null;
  let waitingResolvers: Array<() => void> = [];

  const notifyReady = async () => {
    const waiting = registration?.waiting ?? null;
    // Without an active worker this is the first install, not an update
    if (!waiting || !registration?.active) return;
    waitingResolvers.forEach((resolve) => resolve());
    waitingResolvers = [];
    if (notifiedWorker === waiting) return;
    notifiedWorker = waiting;
    callbacks.onReady(await fetchRemoteVersion());
  };

  const trackRegistration = (reg: ServiceWorkerRegistration) => {
    registration = reg;
    reg.addEventListener("updatefound", () => {
      const installing = reg.installing;
      installing?.addEventListener("statechange", () => {
        if (installing.state === "installed") notifyReady();
      });
    });
    // An update may already be waiting from a previous visit
    notifyReady();
  };

  const init = async () => {
    if (!("serviceWorker" in navigator)) return;
    registerSW({
      immediate: true,
      onNeedRefresh: notifyReady,
      onOfflineReady: callbacks.onOfflineReady,
      onRegisteredSW(_url, reg) {
        if (reg) trackRegistration(reg);
      },
      onRegisterError(error) {
        console.error("Service worker registration failed:", error);
      },
    });
  };

  const check = async (): Promise<UpdateInfo | null> => {
    if (!registration) {
      const reg = await navigator.serviceWorker?.getRegistration();
      if (reg) trackRegistration(reg);
    }
    if (!registration) throw new Error("Service worker is not registered");

    await registration.update();
    if (!registration.installing && !registration.waiting) return null;
    return fetchRemoteVersion();
  };

  /** The browser downloads by itself; we only wait until the worker is installed */
  const download = (onProgress: (progress: number | null) => void) => {
    onProgress(null);
    if (registration?.waiting) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Service worker install timed out")),
        INSTALL_TIMEOUT
      );
      waitingResolvers.push(() => {
        clearTimeout(timeout);
        resolve();
      });
    });
  };

  const apply = async () => {
    const waiting = registration?.waiting;
    if (!waiting) {
      window.location.reload();
      return;
    }
    // An uncontrolled page (first visit) gets no `controllerchange`,
    // so wait for the new worker to activate instead
    waiting.addEventListener("statechange", () => {
      if (waiting.state === "activated") window.location.reload();
    });
    // Handled by the Workbox-generated service worker
    waiting.postMessage({ type: "SKIP_WAITING" });
  };

  return { init, check, download, apply };
};
