import "./index.css";
import App from "./App.vue";
import router from "@/router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { registerSW } from "virtual:pwa-register";
import { i18n } from "./i18n";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
pinia.use(piniaPluginPersistedstate);
app.use(router);
app.use(i18n);
app.mount("#app");
//TODO: Add later info about refresh and offline
registerSW({
  onNeedRefresh() {
    alert("need to refresh");
  },
  onOfflineReady() {
    alert("Ready to offline");
  },
});
