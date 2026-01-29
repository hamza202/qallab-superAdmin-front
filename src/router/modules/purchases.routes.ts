import type { RouteRecordRaw } from "vue-router";

export const purchasesRoutes: RouteRecordRaw[] = [
  {
    path: "/suppliers",
    name: "Suppliers",
    redirect: "/suppliers/list",
    children: [
      {
        path: "list",
        name: "SuppliersList",
        component: () => import("@/views/suppliers/List.vue"),
        meta: {
          title: "pages.suppliers.title",
        },
      },
      {
        path: "create",
        name: "SuppliersCreate",
        component: () => import("@/views/suppliers/Form.vue"),
        meta: {
          title: "pages.suppliers.create",
        },
      },
      {
        path: "edit/:id",
        name: "SuppliersEdit",
        component: () => import("@/views/suppliers/Form.vue"),
        meta: {
          title: "pages.suppliers.edit",
        },
      },
    ],
  },
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
        component: () => import("@/views/purchases/price-offers/fuel/List.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.title",
        },
      },
      {
        path: "create",
        name: "RequestForQuotationFuelCreate",
        component: () => import("@/views/purchases/price-offers/fuel/Form.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.title",
        },
      },
      {
        path: "edit/:id",
        name: "RequestForQuotationFuelEdit",
        component: () => import("@/views/purchases/price-offers/fuel/Form.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.edit",
        },
      },
      {
        path: "view/:id",
        name: "RequestForQuotationFuelView",
        component: () => import("@/views/purchases/price-offers/fuel/View.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.view",
        },
      },
    ],
  },
  {
    path: "/purchases/purchases-requests",
    name: "PurchasesRequests",
    redirect: "/purchases/purchases-requests/list",
    children: [
      {
        path: "list",
        name: "PurchasesRequestsList",
        component: () => import("@/views/purchases/purchases-requests/List.vue"),
        meta: {
          title: "pages.PurchasesRequests.title",
        },
      },
      {
        path: "create",
        name: "PurchasesRequestsCreate",
        component: () => import("@/views/purchases/purchases-requests/Form.vue"),
        meta: {
          title: "pages.PurchasesRequests.title",
        },
      },
      {
        path: "edit/:id",
        name: "PurchasesRequestsEdit",
        component: () => import("@/views/purchases/purchases-requests/Form.vue"),
        meta: {
          title: "pages.PurchasesRequests.edit",
        },
      },
      // {
      //   path: "view/:id",
      //   name: "RequestForQuotationFuelView",
      //   component: () => import("@/views/purchases/purchases-requests/View.vue"),
      //   meta: {
      //     title: "pages.requestForQuotationFuel.view",
      //   },
      // },
    ],
  },
  {
    path: "/purchases/receipt-vouchers",
    name: "ReceiptVouchers",
    redirect: "/purchases/receipt-vouchers/list",
    children: [
      {
        path: "list",
        name: "ReceiptVouchersList",
        component: () => import("@/views/purchases/receipt-vouchers/List.vue"),
        meta: {
          title: "pages.ReceiptVouchers.title",
        },
      },
      {
        path: "create",
        name: "ReceiptVouchersCreate",
        component: () => import("@/views/purchases/receipt-vouchers/Form.vue"),
        meta: {
          title: "pages.ReceiptVouchers.FormTitle",
        },
      },
      {
        path: "edit/:id",
        name: "ReceiptVouchersEdit",
        component: () => import("@/views/purchases/receipt-vouchers/Form.vue"),
        meta: {
          title: "pages.ReceiptVouchers.edit",
        },
      },
    ],
  },
];
