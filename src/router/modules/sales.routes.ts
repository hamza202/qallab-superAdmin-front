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
        path: "edit/:id",
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
    path: "/sales/so-pickups",
    name: "SalesSoPickups",
    redirect: "/sales/so-pickups/list",
    children: [
      {
        path: "list",
        name: "SalesSoPickupsList",
        component: () => import("@/views/sales/so-pickups/List.vue"),
        meta: {
          title: "pages.SalesSoPickups.title",
        },
      },
      {
        path: "pickup/:orderId",
        name: "SalesSoPickupsPickup",
        component: () => import("@/views/sales/so-pickups/PickupForm.vue"),
        meta: {
          title: "pages.SalesOrdersMaterialProduct.pickup",
        },
      },
      {
        path: "edit/:id",
        name: "SalesSoPickupsEdit",
        component: () => import("@/views/sales/so-pickups/PickupForm.vue"),
        meta: {
          title: "pages.SalesSoPickups.edit",
        },
      },
      {
        path: "view/:id",
        name: "SalesSoPickupsView",
        component: () => import("@/views/sales/so-pickups/View.vue"),
        meta: {
          title: "pages.SalesSoPickups.view",
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
        component: () =>
          import("@/views/sales/orders/material-product/List.vue"),
        meta: {
          title: "pages.SalesRequests.title",
        },
      },
      {
        path: "create",
        name: "SalesOrdersMaterialProductCreate",
        component: () =>
          import("@/views/sales/orders/material-product/Form.vue"),
        meta: {
          title: "pages.SalesRequests.title",
        },
      },
      {
        path: "edit/:id",
        name: "SalesOrdersMaterialProductEdit",
        component: () =>
          import("@/views/sales/orders/material-product/Form.vue"),
        meta: {
          title: "pages.SalesRequests.edit",
        },
      },
    ],
  },
  {
    path: "/sales/trips",
    name: "SalesTrips",
    redirect: "/sales/trips/list",
    children: [
      {
        path: "list",
        name: "SalesTripslist",
        component: () => import("@/views/sales/trips/List.vue"),
        meta: {
          title: "pages.SalesTrips.title",
        },
      },
      {
        path: "create/:pickupId",
        name: "SalesTripsCreate",
        component: () => import("@/views/sales/trips/Form.vue"),
        meta: {
          title: "pages.SalesTrips.title",
        },
      },
      {
        path: "edit/:id",
        name: "SalesTripsEdit",
        component: () => import("@/views/sales/trips/Form.vue"),
        meta: {
          title: "pages.SalesTrips.edit",
        },
      },
      {
        path: "view/:id",
        name: "SalesTripsView",
        component: () => import("@/views/sales/trips/View.vue"),
        meta: {
          title: "pages.SalesTrips.title",
        },
      },
    ],
  },

  // Sales Requests Fuels
  {
    path: "/sales/requests/fuels",
    name: "SalesRequestsFuels",
    redirect: "/sales/requests/fuels/list",
    children: [
      {
        path: "list",
        name: "SalesRequestsFuelsList",
        component: () => import("@/views/sales/requests/fuels/List.vue"),
        meta: {
          title: "pages.SalesRequestsFuels.title",
        },
      },
      {
        path: "create",
        name: "SalesRequestsFuelsCreate",
        component: () => import("@/views/sales/requests/fuels/Form.vue"),
        meta: {
          title: "pages.SalesRequestsFuels.FormTitle",
        },
      },
      {
        path: "edit/:id",
        name: "SalesRequestsFuelsEdit",
        component: () => import("@/views/sales/requests/fuels/Form.vue"),
        meta: {
          title: "pages.SalesRequestsFuels.FormTitle",
        },
      },
      {
        path: "view/:id",
        name: "SalesRequestsFuelsView",
        component: () => import("@/views/sales/requests/fuels/View.vue"),
        meta: {
          title: "pages.SalesRequestsFuels.title",
        },
      },
    ],
  },
  // Sales Quotations Fuels
  {
    path: "/sales/quotations/fuels",
    name: "SalesQuotationsFuels",
    redirect: "/sales/quotations/fuels/list",
    children: [
      {
        path: "list",
        name: "SalesQuotationsFuelsList",
        component: () => import("@/views/sales/quotations/fuels/List.vue"),
        meta: {
          title: "pages.SalesQuotationsFuels.title",
        },
      },
      {
        path: "create",
        name: "SalesQuotationsFuelsCreate",
        component: () => import("@/views/sales/quotations/fuels/Form.vue"),
        meta: {
          title: "pages.SalesQuotationsFuels.FormTitle",
        },
      },
      {
        path: "edit/:id",
        name: "SalesQuotationsFuelsEdit",
        component: () => import("@/views/sales/quotations/fuels/Form.vue"),
        meta: {
          title: "pages.SalesQuotationsFuels.FormTitle",
        },
      },
      {
        path: "view/:id",
        name: "SalesQuotationsFuelsView",
        component: () => import("@/views/sales/quotations/fuels/View.vue"),
        meta: {
          title: "pages.SalesQuotationsFuels.title",
        },
      },
    ],
  },
  {
    path: "/sales/invoices",
    name: "SalesInvoices",
    redirect: "/sales/invoices/list",
    children: [
      {
        path: "list",
        name: "SalesInvoicesList",
        component: () => import("@/views/sales/invoices/List.vue"),
        meta: {
          title: "pages.SalesInvoices.title",
        },
      },
      {
        path: "create",
        name: "SalesInvoicesCreate",
        component: () => import("@/views/sales/invoices/Form.vue"),
        meta: {
          title: "pages.SalesInvoices.FormTitle",
        },
      },
      {
        path: "edit/:id",
        name: "SalesInvoicesEdit",
        component: () => import("@/views/sales/invoices/Form.vue"),
        meta: {
          title: "pages.SalesInvoices.FormTitle",
        },
      },
      {
        path: "view/:id",
        name: "SalesInvoicesView",
        component: () => import("@/views/sales/invoices/View.vue"),
        meta: {
          title: "pages.SalesInvoices.title",
        },
      },
    ],
  },
];
