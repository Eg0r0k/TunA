import "./index.css";
import App from "./App.vue";
import router from "@/router";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { i18n } from "./i18n";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
pinia.use(piniaPluginPersistedstate);
app.use(router);
app.use(i18n);
app.mount("#app");
