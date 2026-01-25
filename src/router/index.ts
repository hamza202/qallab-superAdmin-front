import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type NavigationGuardNext,
  type RouteLocationNormalized,
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
import { usersRoutes } from "./modules/users.routes";
import { financeRoutes } from "./modules/finance.routes";
import { usePermissions } from "@/composables/usePermissions";

// Auth check helper
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token')
}

// Public routes that don't require authentication
const publicRoutes = ['Login', 'Register', 'ForgotPassword', 'ResetPassword', 'NotFound', 'Forbidden', '404', '500', '403']

const routes: RouteRecordRaw[] = [
  ...dashboardRoutes,
  ...authRoutes,
  ...productsRoutes,
  ...settingsRoutes,
  ...suppliersRoutes,
  ...customersRoutes,
  ...projectsRoutes,
  ...usersRoutes,
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

// Authentication guard
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const routeName = to.name as string
  const { hasRoutePermission } = usePermissions()

  // Save sidebar scroll position
  const sidebar = document.querySelector('.q-sidebar-scroll');
  if (sidebar) {
    sidebarScrollTop = sidebar.scrollTop;
  }

  // Check if route requires authentication
  if (publicRoutes.includes(routeName)) {
    // If user is already authenticated and trying to access login page, redirect to home
    if (routeName === 'Login' && isAuthenticated()) {
      next({ name: 'Dashboard' })
      return
    }
    next()
    return
  }

  // Protected route - check authentication
  if (!isAuthenticated()) {
    next({ name: 'Login' })
    return
  }

  // Check permissions for the route
  if (!hasRoutePermission(to.path)) {
    next({ name: 'Forbidden' })
    return
  }

  next()
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
