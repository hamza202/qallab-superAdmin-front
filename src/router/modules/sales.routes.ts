import type { RouteRecordRaw } from "vue-router";

export const salesRoutes: RouteRecordRaw[] = [
  {
    path: "/customers",
    name: "Customers",
    redirect: "/customers/list",
    children: [
      {
        path: "list",
        name: "CustomersList",
        component: () => import("@/views/customers/List.vue"),
        meta: {
          title: "pages.customers.title",
        },
      },
      {
        path: "create",
        name: "CustomersCreate",
        component: () => import("@/views/customers/Form.vue"),
        meta: {
          title: "pages.customers.create",
        },
      },
      {
        path: "edit/:id",
        name: "CustomersEdit",
        component: () => import("@/views/customers/Form.vue"),
        meta: {
          title: "pages.customers.edit",
        },
      },
    ],
  },
  {
    path: "/sales/quotations-material-product",
    name: "PriceOfferMaterialProduct",
    redirect: "/sales/quotations-material-product/list",
    children: [
      {
        path: "list",
        name: "PriceOfferMaterialProductList",
        component: () =>
          import("@/views/sales/price-offers/material-building-products/List.vue"),
        meta: {
          title: "pages.PriceOfferMaterialProduct.title",
        },
      },
      {
        path: "create",
        name: "PriceOfferMaterialProductCreate",
        component: () =>
          import("@/views/sales/price-offers/material-building-products/Form.vue"),
        meta: {
          title: "pages.PriceOfferMaterialProduct.title",
        },
      },
      {
        path: "edit/:id",
        name: "PriceOfferMaterialProductEdit",
        component: () =>
          import("@/views/sales/price-offers/material-building-products/Form.vue"),
        meta: {
          title: "pages.PriceOfferMaterialProduct.edit",
        },
      },
      {
        path: "view/:id",
        name: "PriceOfferMaterialProductView",
        component: () =>
          import("@/views/sales/price-offers/material-building-products/View.vue"),
        meta: {
          title: "pages.PriceOfferMaterialProduct.view",
        },
      },
    ],
  },
    {
    path: "/sales/sales-requests",
    name: "SalesRequests",
    redirect: "/sales/sales-requests/list",
    children: [
      {
        path: "list",
        name: "SalesRequestsList",
        component: () => import("@/views/sales/sales-requests/List.vue"),
        meta: {
          title: "pages.SalesRequests.title",
        },
      },
      {
        path: "create",
        name: "SalesRequestsCreate",
        component: () => import("@/views/sales/sales-requests/Form.vue"),
        meta: {
          title: "pages.SalesRequests.title",
        },
      },
      {
        path: "edit/:id",
        name: "SalesRequestsEdit",
        component: () => import("@/views/sales/sales-requests/Form.vue"),
        meta: {
          title: "pages.SalesRequests.edit",
        },
      },
      // {
      //   path: "view/:id",
      //   name: "RequestForQuotationFuelView",
      //   component: () => import("@/views/sales/sales-requests/View.vue"),
      //   meta: {
      //     title: "pages.requestForQuotationFuel.view",
      //   },
      // },
    ],
  },
];
