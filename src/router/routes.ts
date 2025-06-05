import MainPage from "@/pages/MainPage.vue";
import SettingsPage from "@/pages/SettingsPage.vue";
import PageNotFound from "@/PageNotFound.vue";

import { AppRoute } from "@/types/router";

const routes: AppRoute[] = [
  {
    path: "/",
    component: MainPage,
    meta: { title: "Main" },
  },
  {
    path: "/settings",
    component: SettingsPage,
    meta: { title: "Settings" },
  },
  {
    path: "/:pathMatch(.*)*",
    component: PageNotFound,
    meta: { title: "Not found" },
  },
];

export default routes;
