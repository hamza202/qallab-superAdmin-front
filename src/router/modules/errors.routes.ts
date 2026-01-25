import type { RouteRecordRaw } from "vue-router";

export const errorRoutes: RouteRecordRaw[] = [
  {
    path: "/forbidden",
    name: "Forbidden",
    component: () => import("@/views/errors/Forbidden.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/errors/NotFound.vue"),
  },
];
