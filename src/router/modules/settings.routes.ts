import type { RouteRecordRaw } from "vue-router";

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: "/settings/products-categories",
    name: "ProductsCategories",
    redirect: "/settings/products-categories/list",
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
        path: "tree",
        name: "ProductsCategoriesTree",
        component: () => import("@/views/settings/products-categories/tree.vue"),
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
      {
        path: "view/:id",
        name: "ProductsCategoriesView",
        component: () => import("@/views/settings/products-categories/view.vue"),
        meta: {
          title: "pages.ProductsCategories.title",
        },
      },
    ],
  },
  {
    path: "/settings/services-categories",
    name: "ServicesCategories",
    redirect: "/settings/services-categories/list",
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
        path: "tree",
        name: "ServicesCategoriesTree",
        component: () => import("@/views/settings/services-categories/tree.vue"),
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
      {
        path: "view/:id",
        name: "ServicesCategoriesView",
        component: () => import("@/views/settings/services-categories/view.vue"),
        meta: {
          title: "pages.ServicesCategories.title",
        },
      },
    ],
  },
  {
    path: "/settings/units",
    name: "Units",
    redirect: "/settings/units/list",
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
    path: "/settings/brands",
    name: "Brands",
    redirect: "/settings/brands/list",
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
    path: "/settings/factories",
    name: "Factories",
    redirect: "/settings/factories/list",
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
    path: "/settings/cities",
    name: "Cities",
    redirect: "/settings/cities/list",
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
    path: "/settings/countries",
    name: "Countries",
    redirect: "/settings/Countries/list",
    children: [
      {
        path: "list",
        name: "CountriesList",
        component: () => import("@/views/settings/countries/List.vue"),
        meta: {
          title: "pages.countries.title",
        },
      },
    ],
  },
  {
    path: "/settings/taxes",
    name: "Taxes",
    redirect: "/settings/taxes/list",
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
    path: "/settings/geo-areas",
    name: "GeoAreas",
    redirect: "/settings/geo-areas/list",
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
    path: "/settings/geo-segments",
    name: "GeoSegments",
    redirect: "/settings/geo-segments/list",
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
    path: "/settings/account-types",
    name: "AccountTypes",
    redirect: "/settings/account-types/list",
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
    path: "/settings/tax-rules",
    name: "TaxRules",
    redirect: "/settings/tax-rules/list",
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
    path: "/settings/codes",
    name: "Codes",
    component: () => import("@/views/settings/codes/Form.vue"),
    meta: {
      title: "pages.codes.title",
    },
  },
  {
    path: "/settings/test-group",
    name: "TestGroup",
    redirect: "/settings/test-group/list",
    children: [
      {
        path: "list",
        name: "TestGroupList",
        component: () => import("@/views/settings/test-group/List.vue"),
        meta: {
          title: "pages.testGroup.title",
        },
      },
      {
        path: "create",
        name: "TestGroupCreate",
        component: () => import("@/views/settings/test-group/Form.vue"),
        meta: {
          title: "pages.testGroup.title",
        },
      },
      {
        path: "edit/:id",
        name: "TestGroupEdit",
        component: () => import("@/views/settings/test-group/Form.vue"),
        meta: {
          title: "pages.testGroup.title",
        },
      },
    ],
  },
  {
    path: "/settings/tests",
    name: "Tests",
    redirect: "/settings/tests/list",
    children: [
      {
        path: "list",
        name: "TestsList",
        component: () => import("@/views/settings/tests/List.vue"),
        meta: {
          title: "pages.tests.title",
        },
      },
      {
        path: "create",
        name: "TestsCreate",
        component: () => import("@/views/settings/tests/Form.vue"),
        meta: {
          title: "pages.tests.title",
        },
      },
      {
        path: "edit/:id",
        name: "TestsEdit",
        component: () => import("@/views/settings/tests/Form.vue"),
        meta: {
          title: "pages.tests.title",
        },
      },
    ],
  },
  {
    path: "/settings/test-methodology",
    name: "TestMethodology",
    redirect: "/settings/test-methodology/list",
    children: [
      {
        path: "list",
        name: "TestMethodologyList",
        component: () => import("@/views/settings/test-methodology/List.vue"),
        meta: {
          title: "pages.testMethodology.title",
        },
      },
      {
        path: "create",
        name: "TestMethodologyCreate",
        component: () => import("@/views/settings/test-methodology/Form.vue"),
        meta: {
          title: "pages.testMethodology.title",
        },
      },
      {
        path: "edit/:id",
        name: "TestMethodologyEdit",
        component: () => import("@/views/settings/test-methodology/Form.vue"),
        meta: {
          title: "pages.testMethodology.title",
        },
      },
    ],
  },
  {
    path: "/settings/sample-types",
    name: "SampleTypes",
    redirect: "/settings/sample-types/list",
    children: [
      {
        path: "list",
        name: "SampleTypesList",
        component: () => import("@/views/settings/sample-types/List.vue"),
        meta: {
          title: "pages.sampleTypes.title",
        },
      },
      {
        path: "create",
        name: "SampleTypesCreate",
        component: () => import("@/views/settings/sample-types/Form.vue"),
        meta: {
          title: "pages.sampleTypes.title",
        },
      },
      {
        path: "edit/:id",
        name: "SampleTypesEdit",
        component: () => import("@/views/settings/sample-types/Form.vue"),
        meta: {
          title: "pages.sampleTypes.title",
        },
      },
    ],
  },
  {
    path: "/settings/system-statuses",
    name: "SystemStatuses",
    redirect: "/settings/system-statuses/list",
    children: [
      {
        path: "list",
        name: "SystemStatusesList",
        component: () => import("@/views/settings/system-statuses/List.vue"),
        meta: {
          title: "pages.systemStatuses.title",
        },
      },
    ],
  },
  {
    path: "/settings/doc-status-transitions",
    name: "DocStatusTransitions",
    redirect: "/settings/doc-status-transitions/list",
    children: [
      {
        path: "list",
        name: "DocStatusTransitionsList",
        component: () => import("@/views/settings/doc-status-transitions/List.vue"),
        meta: {
          title: "pages.docStatusTransitions.title",
        },
      },
      {
        path: "create",
        name: "DocStatusTransitionsCreate",
        component: () => import("@/views/settings/doc-status-transitions/Form.vue"),
        meta: {
          title: "pages.docStatusTransitions.title",
        },
      },
      {
        path: "edit/:id",
        name: "DocStatusTransitionsEdit",
        component: () => import("@/views/settings/doc-status-transitions/Form.vue"),
        meta: {
          title: "pages.docStatusTransitions.title",
        },
      },
      {
        path: "status-transition/:id",
        name: "DocStatusTransitionsStatusTransition",
        component: () => import("@/views/settings/doc-status-transitions/StatusTransitions.vue"),
        meta: {
          title: "pages.docStatusTransitions.title",
        },
      },
    ],
  },
];

export default settingsRoutes;
