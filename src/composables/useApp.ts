import { createPinia } from "pinia";
import { App } from "vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import router from "@/router";
import { i18n } from "@/i18n";

export const useApp = (app: App) =>{
    const pinia = createPinia();
    app.use(pinia);
    pinia.use(piniaPluginPersistedstate);
    app.use(router);
    app.use(i18n);
}