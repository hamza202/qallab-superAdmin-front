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
    path: "/sales/price-offer-material-product",
    name: "PriceOfferMaterialProduct",
    redirect: "/sales/price-offer-material-product/list",
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
];
