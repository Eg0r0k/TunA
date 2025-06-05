import { RouteRecordRaw } from "vue-router";

export interface RouteMeta {
  title: string;
}

export type AppRoute = RouteRecordRaw & {
  meta: RouteMeta;
};
