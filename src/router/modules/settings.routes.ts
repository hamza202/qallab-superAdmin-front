import type { RouteRecordRaw } from "vue-router";

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: "/add-categories",
    name: "Categories",
    component: () => import("@/views/settings/categories/Form.vue"),
  },
];
