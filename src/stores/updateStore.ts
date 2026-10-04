import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";
import { toast } from "vue-sonner";
import { isTauri } from "@tauri-apps/api/core";
import { useEventListener, useIntervalFn } from "@vueuse/core";
import { i18n } from "@/i18n";
import { createPwaUpdater } from "@/services/updater/pwaUpdater";
import { createTauriUpdater } from "@/services/updater/tauriUpdater";
import type {
  UpdateInfo,
  UpdatePlatform,
  UpdateStatus,
  Updater,
} from "@/services/updater/types";

const CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour
const MIN_RECHECK_INTERVAL = 15 * 60 * 1000; // when the app regains focus
const STARTUP_CHECK_DELAY = 5_000;
const LAST_VERSION_KEY = "tuna-last-version";
const UPDATE_TOAST_ID = "app-update";

export const useUpdateStore = defineStore("update", () => {
  const { t } = i18n.global;

  const platform = ref<UpdatePlatform>("unsupported");
  const status = ref<UpdateStatus>("idle");
  const currentVersion = ref<string>(__APP_VERSION__);
  const available = ref<UpdateInfo | null>(null);
  const progress = ref<number | null>(null);
  const error = ref<string | null>(null);
  const lastChecked = ref<Date | null>(null);
  const updater = shallowRef<Updater | null>(null);

  const isBusy = computed(() =>
    ["checking", "downloading"].includes(status.value)
  );
  const canInstall = computed(() =>
    ["available", "ready"].includes(status.value)
  );

  const versionLabel = (info: UpdateInfo | null) =>
    info?.version ? `v${info.version}` : "";

  const showUpdateToast = () => {
    const desktop = platform.value === "desktop";
    toast.info(
      t(desktop ? "updates.availableDesktop" : "updates.readyWeb", {
        version: versionLabel(available.value),
      }),
      {
        id: UPDATE_TOAST_ID,
        duration: Infinity,
        action: {
          label: t(desktop ? "updates.install" : "general.refresh"),
          onClick: () => install(),
        },
      }
    );
  };

  /** Shows "updated to vX" once after the app version changes */
  const announceInstalledVersion = () => {
    try {
      const previous = localStorage.getItem(LAST_VERSION_KEY);
      if (previous && previous !== currentVersion.value) {
        toast.success(t("updates.updated", { version: currentVersion.value }));
      }
      localStorage.setItem(LAST_VERSION_KEY, currentVersion.value);
    } catch {
      // Storage may be unavailable (private mode); nothing to announce then
    }
  };

  const fail = (err: unknown, silent: boolean) => {
    console.error("Update error:", err);
    if (silent) {
      status.value = "idle";
      return;
    }
    error.value = err instanceof Error ? err.message : String(err);
    status.value = "error";
    toast.error(t("updates.error"));
  };

  const download = async () => {
    if (!updater.value) return;
    status.value = "downloading";
    progress.value = null;
    await updater.value.download((value) => (progress.value = value));
    status.value = "ready";
  };

  const check = async ({ silent = false } = {}) => {
    if (!updater.value || isBusy.value || status.value === "ready") return;

    status.value = "checking";
    error.value = null;
    try {
      const info = await updater.value.check();
      lastChecked.value = new Date();

      if (!info) {
        status.value = "upToDate";
        return;
      }
      available.value = info;

      if (platform.value === "web") {
        // The browser is already fetching the new service worker
        await download();
      } else {
        status.value = "available";
      }
      showUpdateToast();
    } catch (err) {
      fail(err, silent);
    }
  };

  const install = async () => {
    if (!updater.value) return;
    toast.dismiss(UPDATE_TOAST_ID);
    try {
      if (status.value !== "ready") await download();
      await updater.value.apply();
    } catch (err) {
      fail(err, false);
    }
  };

  let initialized = false;

  const init = async () => {
    if (initialized) return;
    initialized = true;

    if (isTauri()) {
      platform.value = "desktop";
      try {
        const { getVersion } = await import("@tauri-apps/api/app");
        currentVersion.value = await getVersion();
      } catch (err) {
        console.error("Failed to read app version:", err);
      }
      updater.value = createTauriUpdater();
    } else if (import.meta.env.PROD && "serviceWorker" in navigator) {
      platform.value = "web";
      updater.value = createPwaUpdater({
        onReady(info) {
          available.value = info.version ? info : available.value;
          status.value = "ready";
          showUpdateToast();
        },
        onOfflineReady() {
          toast.success(t("tuner.readyToOffline"));
        },
      });
    }

    announceInstalledVersion();
    if (!updater.value) return;

    await updater.value.init();
    setTimeout(() => check({ silent: true }), STARTUP_CHECK_DELAY);
    useIntervalFn(() => check({ silent: true }), CHECK_INTERVAL);

    const checkIfStale = () => {
      const last = lastChecked.value?.getTime() ?? 0;
      if (Date.now() - last > MIN_RECHECK_INTERVAL) check({ silent: true });
    };
    useEventListener(document, "visibilitychange", () => {
      if (document.visibilityState === "visible") checkIfStale();
    });
    useEventListener(window, "online", checkIfStale);
  };

  return {
    platform,
    status,
    currentVersion,
    available,
    progress,
    error,
    lastChecked,
    isBusy,
    canInstall,
    init,
    check,
    install,
  };
});
