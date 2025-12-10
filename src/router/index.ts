import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import { dashboardRoutes } from "./modules/dashboard.routes";
import { productsRoutes } from "./modules/products.routes";
import { simpleProductsRoutes } from "./modules/simple-products.routes";
import { settingsRoutes } from "./modules/settings.routes";
import { authRoutes } from "./modules/auth.routes";
import { errorRoutes } from "./modules/errors.routes";

const routes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...authRoutes,
  ...productsRoutes,
  ...simpleProductsRoutes,
  ...settingsRoutes,
  ...errorRoutes,

  {
    path: "/form-and-validation",
    name: "FormAndValidation",
    component: () => import("@/views/FormAndValidation.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
