import type { RouteRecordRaw } from "vue-router";

export const errorRoutes: RouteRecordRaw[] = [
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/errors/NotFound.vue"),
  },
];
