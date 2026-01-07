import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import { dashboardRoutes } from "./modules/dashboard.routes";
import { productsRoutes } from "./modules/products.routes";
import { settingsRoutes } from "./modules/settings.routes";
import { suppliersRoutes } from "./modules/suppliers.routes";
import { customersRoutes } from "./modules/customers.routes";
import { projectsRoutes } from "./modules/projects.routes";
import { authRoutes } from "./modules/auth.routes";
import { errorRoutes } from "./modules/errors.routes";
import { servicesRoutes } from "./modules/services.routes";
import { crushersRoutes } from "./modules/crushers.routes";
import { contractorsRoutes } from "./modules/contractors.routes";
import { financeRoutes } from "./modules/finance.routes";

const routes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...authRoutes,
  ...productsRoutes,
  ...settingsRoutes,
  ...suppliersRoutes,
  ...customersRoutes,
  ...projectsRoutes,
  ...crushersRoutes,
  ...contractorsRoutes,
  ...errorRoutes,
  ...servicesRoutes,
  ...financeRoutes,
  {
    path: "/form-and-validation",
    name: "FormAndValidation",
    component: () => import("@/views/FormAndValidation.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    // Prevent automatic scroll - keep current position
    return false;
  },
});

// Store sidebar scroll position
let sidebarScrollTop = 0;

// Save sidebar scroll position before each navigation
router.beforeEach(() => {
  const sidebar = document.querySelector(".q-sidebar-scroll");
  if (sidebar) {
    sidebarScrollTop = sidebar.scrollTop;
  }
  return true;
});

// Restore sidebar scroll position after each navigation
router.afterEach(() => {
  setTimeout(() => {
    const sidebar = document.querySelector(".q-sidebar-scroll");
    if (sidebar && sidebarScrollTop > 0) {
      sidebar.scrollTop = sidebarScrollTop;
    }
  }, 0);
});

export default router;
