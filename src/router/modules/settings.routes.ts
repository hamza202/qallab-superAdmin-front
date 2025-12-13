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
    ],
  },
  {
    path: "/factories",
    name: "Factories",
    redirect: "/factories/list",
    children: [
      {
        path: "list",
        name: "FactoriesList",
        component: () => import("@/views/settings/factories/List.vue"),
        meta: {
          title: "pages.factories.title",
        },
      },
    ],
  },
  {
    path: "/cities",
    name: "Cities",
    redirect: "/cities/list",
    children: [
      {
        path: "list",
        name: "CitiesList",
        component: () => import("@/views/settings/cities/List.vue"),
        meta: {
          title: "pages.cities.title",
        },
      },
    ],
  },
  {
    path: "/codes",
    name: "Codes",
    component: () => import("@/views/settings/codes/Form.vue"),
    meta: {
      title: "pages.codes.title",
    },
  },

];
