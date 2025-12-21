import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import { dashboardRoutes } from "./modules/dashboard.routes";
import { productsRoutes } from "./modules/products.routes";
import { simpleProductsRoutes } from "./modules/simple-products.routes";
import { groupProductsRoutes } from "./modules/group-products.routes";
import { settingsRoutes } from "./modules/settings.routes";
import { suppliersRoutes } from "./modules/suppliers.routes";
import { customersRoutes } from "./modules/customers.routes";
import { projectsRoutes } from "./modules/projects.routes";
import { authRoutes } from "./modules/auth.routes";
import { errorRoutes } from "./modules/errors.routes";
import { servicesRoutes } from "./modules/services.routes";

const routes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...authRoutes,
  ...productsRoutes,
  ...simpleProductsRoutes,
  ...groupProductsRoutes,
  ...settingsRoutes,
  ...suppliersRoutes,
  ...customersRoutes,
  ...projectsRoutes,
  ...errorRoutes,
  ...servicesRoutes,
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
