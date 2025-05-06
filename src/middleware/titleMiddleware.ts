import { useTitle } from "@vueuse/core";
import type { RouteLocationNormalized } from "vue-router";
export const titleMiddleware = (
  to: RouteLocationNormalized,
  _: RouteLocationNormalized
) => {
  const title = to.meta.title ? `${to.meta.title} - TunA` : "TunA";
  useTitle(title);
};
