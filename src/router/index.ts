import { titleMiddleware } from "@/middleware/titleMiddleware";
import PageNotFound from "@/PageNotFound.vue";
import MainPage from "@/pages/MainPage.vue";
import SettingsPage from "@/pages/SettingsPage.vue";
import { createRouter, createWebHashHistory } from "vue-router";

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
  {
    path: "/:pathMatch(.*)*",
    component: PageNotFound,
    meta: { title: "Not found" },
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),

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
