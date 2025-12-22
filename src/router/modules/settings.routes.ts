import type { RouteRecordRaw } from "vue-router";

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: "/products-categories",
    name: "ProductsCategories",
    redirect: "/products-categories/list",
    children: [
      {
        path: "list",
        name: "ProductsCategoriesList",
        component: () => import("@/views/settings/products-categories/List.vue"),
        meta: {
          title: "pages.ProductsCategories.title",
        },
      },
      {
        path: "create",
        name: "ProductsCategoriesCreate",
        component: () => import("@/views/settings/products-categories/Form.vue"),
        meta: {
          title: "pages.ProductsCategories.title",
        },
      },
      {
        path: "edit/:id",
        name: "ProductsCategoriesEdit",
        component: () => import("@/views/settings/products-categories/Form.vue"),
        meta: {
          title: "pages.ProductsCategories.title",
        },
      },
    ],
  },
  {
    path: "/services-categories",
    name: "ServicesCategories",
    redirect: "/services-categories/list",
    children: [
      {
        path: "list",
        name: "ServicesCategoriesList",
        component: () => import("@/views/settings/services-categories/List.vue"),
        meta: {
          title: "pages.ServicesCategories.title",
        },
      },
      {
        path: "create",
        name: "ServicesCategoriesCreate",
        component: () => import("@/views/settings/services-categories/Form.vue"),
        meta: {
          title: "pages.ServicesCategories.title",
        },
      },
      {
        path: "edit/:id",
        name: "ServicesCategoriesEdit",
        component: () => import("@/views/settings/services-categories/Form.vue"),
        meta: {
          title: "pages.ServicesCategories.title",
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
    path: "/taxes",
    name: "Taxes",
    redirect: "/taxes/list",
    children: [
      {
        path: "list",
        name: "TaxesList",
        component: () => import("@/views/settings/taxes/List.vue"),
        meta: {
          title: "pages.taxes.title",
        },
      },
    ],
  },
  {
    path: "/geo-areas",
    name: "GeoAreas",
    redirect: "/geo-areas/list",
    children: [
      {
        path: "list",
        name: "GeoAreasList",
        component: () => import("@/views/settings/geo-areas/List.vue"),
        meta: {
          title: "pages.geoAreas.title",
        },
      },
    ],
  },
  {
    path: "/geo-segments",
    name: "GeoSegments",
    redirect: "/geo-segments/list",
    children: [
      {
        path: "list",
        name: "GeoSegmentsList",
        component: () => import("@/views/settings/geo-segments/List.vue"),
        meta: {
          title: "pages.geoSegments.title",
        },
      },
      {
        path: "create",
        name: "GeoSegmentsCreate",
        component: () => import("@/views/settings/geo-segments/Form.vue"),
        meta: {
          title: "pages.geoSegments.title",
        },
      },
      {
        path: "edit/:id",
        name: "GeoSegmentsEdit",
        component: () => import("@/views/settings/geo-segments/Form.vue"),
        meta: {
          title: "pages.geoSegments.title",
        },
      },
    ],
  },
  {
    path: "/account-types",
    name: "AccountTypes",
    redirect: "/account-types/list",
    children: [
      {
        path: "list",
        name: "AccountTypesList",
        component: () => import("@/views/settings/account-types/List.vue"),
        meta: {
          title: "pages.accountTypes.title",
        },
      },
    ],
  },
  {
    path: "/tax-rules",
    name: "TaxRules",
    redirect: "/tax-rules/list",
    children: [
      {
        path: "list",
        name: "TaxRulesList",
        component: () => import("@/views/settings/tax-rules/List.vue"),
        meta: {
          title: "pages.taxRules.title",
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
