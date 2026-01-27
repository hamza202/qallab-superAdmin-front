import type { RouteRecordRaw } from "vue-router";

export const purchasesRoutes: RouteRecordRaw[] = [
  {
    path: "/purchases/request-for-quotations",
    name: "RequestForQuotations",
    redirect: "/purchases/request-for-quotations/list",
    children: [
      //   {
      //     path: 'list',
      //     name: 'RequestForQuotationList',
      //     component: () => import('@/views/purchases/price-offers/RequestForQuotation.vue'),
      //     meta: {
      //       title: 'pages.requestForQuotation.title',
      //     },
      //   },
      {
        path: "create",
        name: "RequestForQuotationCreate",
        component: () =>
          import("@/views/purchases/price-offers/tests/RequestForQuotation.vue"),
        meta: {
          title: "pages.requestForQuotation.create",
        },
      },
      {
        path: "edit/:id",
        name: "RequestForQuotationEdit",
        component: () =>
          import("@/views/purchases/price-offers/tests/RequestForQuotation.vue"),
        meta: {
          title: "pages.requestForQuotation.edit",
        },
      },
      {
        path: "view/:id",
        name: "RequestForQuotationView",
        component: () =>
          import("@/views/purchases/price-offers/tests/RequestForQuotation.vue"),
        meta: {
          title: "pages.requestForQuotation.view",
        },
      },
    ],
  },
  {
    path: "/purchases/request-for-quotations-material-product",
    name: "RequestForQuotationsMaterialProduct",
    redirect: "/purchases/request-for-quotations-material-product/list",
    children: [
      {
        path: "list",
        name: "RequestForQuotationMaterialProductList",
        component: () =>
          import("@/views/purchases/price-offers/material-building-products/List.vue"),
        meta: {
          title: "pages.requestForQuotationMaterialProduct.title",
        },
      },
      {
        path: "create",
        name: "RequestForQuotationMaterialProductCreate",
        component: () =>
          import("@/views/purchases/price-offers/material-building-products/Form.vue"),
        meta: {
          title: "pages.requestForQuotationMaterialProduct.title",
        },
      },
      {
        path: "edit/:id",
        name: "RequestForQuotationMaterialProductEdit",
        component: () =>
          import("@/views/purchases/price-offers/material-building-products/Form.vue"),
        meta: {
          title: "pages.requestForQuotationMaterialProduct.edit",
        },
      },
      {
        path: "view/:id",
        name: "RequestForQuotationMaterialProductView",
        component: () =>
          import("@/views/purchases/price-offers/material-building-products/View.vue"),
        meta: {
          title: "pages.requestForQuotationMaterialProduct.view",
        },
      },
    ],
  },
    {
    path: "/purchases/request-for-quotations-fuel",
    name: "RequestForQuotationsFuel",
    redirect: "/purchases/request-for-quotations-fuel/list",
    children: [
      {
        path: "list",
        name: "RequestForQuotationFuelList",
        component: () =>
          import("@/views/purchases/price-offers/fuel/List.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.title",
        },
      },
      {
        path: "create",
        name: "RequestForQuotationFuelCreate",
        component: () =>
          import("@/views/purchases/price-offers/fuel/Form.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.title",
        },
      },
      {
        path: "edit/:id",
        name: "RequestForQuotationFuelEdit",
        component: () =>
          import("@/views/purchases/price-offers/fuel/Form.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.edit",
        },
      },
      {
        path: "view/:id",
        name: "RequestForQuotationFuelView",
        component: () =>
          import("@/views/purchases/price-offers/fuel/View.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.view",
        },
      },
    ],
  },
];
