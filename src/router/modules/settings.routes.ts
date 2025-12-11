import type { RouteRecordRaw } from "vue-router";

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: "/categories",
    name: "Categories",
    redirect: "/categories/list",
    children: [
      {
        path: "list",
        name: "CategoriesList",
        component: () => import("@/views/settings/categories/List.vue"),
        meta: {
          title: "pages.categories.title",
        },
      },
      {
        path: "create",
        name: "CategoriesCreate",
        component: () => import("@/views/settings/categories/Form.vue"),
        meta: {
          title: "pages.categories.title",
        },
      },
      {
        path: "edit/:id",
        name: "CategoriesEdit",
        component: () => import("@/views/settings/categories/Form.vue"),
        meta: {
          title: "pages.categories.title",
        },
      },
    ],
  },
  {
    path: "/units",
    name: "Units",
    redirect: "/units/list",
    children: [
      {
        path: "list",
        name: "UnitsList",
        component: () => import("@/views/settings/units/List.vue"),
        meta: {
          title: "pages.units.title",
        },
      },
      {
        path: "create",
        name: "UnitsCreate",
        component: () => import("@/views/settings/units/Form.vue"),
        meta: {
          title: "pages.units.title",
        },
      },
      {
        path: "edit/:id",
        name: "UnitsEdit",
        component: () => import("@/views/settings/units/Form.vue"),
        meta: {
          title: "pages.units.title",
        },
      },
    ],
  },
  {
    path: "/brands",
    name: "Brands",
    redirect: "/brands/list",
    children: [
      {
        path: "list",
        name: "BrandsList",
        component: () => import("@/views/settings/brands/List.vue"),
        meta: {
          title: "pages.brands.title",
        },
      },
      {
        path: "create",
        name: "BrandsCreate",
        component: () => import("@/views/settings/brands/Form.vue"),
        meta: {
          title: "pages.brands.title",
        },
      },
      {
        path: "edit/:id",
        name: "BrandsEdit",
        component: () => import("@/views/settings/brands/Form.vue"),
        meta: {
          title: "pages.brands.title",
        },
      },
    ],
  },

];
