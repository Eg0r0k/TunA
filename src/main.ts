import "./index.css";
import App from "./App.vue";
import { createApp } from "vue";
import { useApp } from "./composables/useApp";

const app = createApp(App);

useApp(app);
app.mount("#app");
