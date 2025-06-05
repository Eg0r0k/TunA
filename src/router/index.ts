import { createRouter, createWebHashHistory } from "vue-router";
import routes from "./routes";
import { titleMiddleware } from "@/middleware/titleMiddleware";

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
