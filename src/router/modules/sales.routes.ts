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
    path: "/sales/requests/material-product",
    name: "SalesRequestsMaterialProduct",
    redirect: "/sales/requests/material-product/list",
    children: [
      {
        path: "list",
        name: "SalesRequestsMaterialProductList",
        component: () =>
          import("@/views/sales/requests/material-product/List.vue"),
        meta: {
          title: "pages.SalesRequestsMaterialProduct.title",
        },
      },
      {
        path: "create",
        name: "SalesRequestsMaterialProductCreate",
        component: () =>
          import("@/views/sales/requests/material-product/Form.vue"),
        meta: {
          title: "pages.SalesRequestsMaterialProduct.title",
        },
      },
      {
        path: "edit/:uuid",
        name: "SalesRequestsMaterialProductEdit",
        component: () =>
          import("@/views/sales/requests/material-product/Form.vue"),
        meta: {
          title: "pages.SalesRequestsMaterialProduct.edit",
        },
      },
    ],
  },
  {
    path: "/sales/quotations/material-product",
    name: "PriceOfferMaterialProduct",
    redirect: "/sales/quotations/material-product/list",
    children: [
      {
        path: "list",
        name: "PriceOfferMaterialProductList",
        component: () =>
          import("@/views/sales/quotations/material-product/List.vue"),
        meta: {
          title: "pages.PriceOfferMaterialProduct.title",
        },
      },
      {
        path: "create",
        name: "PriceOfferMaterialProductCreate",
        component: () =>
          import("@/views/sales/quotations/material-product/Form.vue"),
        meta: {
          title: "pages.PriceOfferMaterialProduct.title",
        },
      },
      {
        path: "edit/:id",
        name: "PriceOfferMaterialProductEdit",
        component: () =>
          import("@/views/sales/quotations/material-product/Form.vue"),
        meta: {
          title: "pages.PriceOfferMaterialProduct.edit",
        },
      },
      {
        path: "view/:id",
        name: "PriceOfferMaterialProductView",
        component: () =>
          import("@/views/sales/quotations/material-product/View.vue"),
        meta: {
          title: "pages.PriceOfferMaterialProduct.view",
        },
      },
    ],
  },
    {
    path: "/sales/orders/material-product",
    name: "SalesRequests",
    redirect: "/sales/orders/material-product/list",
    children: [
      {
        path: "list",
        name: "SalesOrdersMaterialProductList",
        component: () => import("@/views/sales/orders/material-product/List.vue"),
        meta: {
          title: "pages.SalesRequests.title",
        },
      },
      {
        path: "create",
        name: "SalesOrdersMaterialProductCreate",
        component: () => import("@/views/sales/orders/material-product/Form.vue"),
        meta: {
          title: "pages.SalesRequests.title",
        },
      },
      {
        path: "edit/:id",
        name: "SalesOrdersMaterialProductEdit",
        component: () => import("@/views/sales/orders/material-product/Form.vue"),
        meta: {
          title: "pages.SalesRequests.edit",
        },
      },
    ],
  },
];
