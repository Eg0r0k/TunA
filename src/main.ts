import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import "./index.css";
import router from "@/router";
import { registerSW } from "virtual:pwa-register";

const pinia = createPinia();
const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#app");

registerSW({
  onNeedRefresh() {
    alert("need to refresh");
  },
  onOfflineReady() {
    alert("Ready to offline");
  },
});
