import { titleMiddleware } from "@/middleware/titleMiddleware";
import MainPage from "@/pages/MainPage.vue";
import SettingsPage from "@/pages/SettingsPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
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
];

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
  routes,
});

router.beforeEach(titleMiddleware);

export default router;
