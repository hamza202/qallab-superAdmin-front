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
    path: "/purchases/requests/request-for-quotation",
    name: "RequestForQuotations",
    redirect: "/purchases/requests/request-for-quotation/create",
    children: [
      {
        path: "create",
        name: "RequestForQuotationCreate",
        component: () =>
          import("@/views/purchases/requests/tests/RequestForQuotation.vue"),
        meta: {
          title: "pages.requestForQuotation.create",
        },
      },
      {
        path: "edit/:id",
        name: "RequestForQuotationEdit",
        component: () =>
          import("@/views/purchases/requests/tests/RequestForQuotation.vue"),
        meta: {
          title: "pages.requestForQuotation.edit",
        },
      },
      {
        path: "view/:id",
        name: "RequestForQuotationView",
        component: () =>
          import("@/views/purchases/requests/tests/RequestForQuotation.vue"),
        meta: {
          title: "pages.requestForQuotation.view",
        },
      },
    ],
  },
  {
    path: "/purchases/quotations/material-product",
    name: "QuotationsMaterialProduct",
    redirect: "/purchases/quotations/material-product/list",
    children: [
      {
        path: "list",
        name: "QuotationsMaterialProductList",
        component: () =>
          import("@/views/purchases/quotations/material-product/List.vue"),
        meta: {
          title: "pages.QuotationsMaterialProduct.title",
        },
      },
      {
        path: "view/:id",
        name: "QuotationsMaterialProductView",
        component: () =>
          import("@/views/purchases/quotations/material-product/View.vue"),
        meta: {
          title: "pages.QuotationsMaterialProduct.view",
        },
      },
    ],
  },
  {
    path: "/purchases/requests/material-product",
    name: "RequestForQuotationsMaterialProduct",
    redirect: "/purchases/requests/material-product/list",
    children: [
      {
        path: "list",
        name: "RequestForQuotationMaterialProductList",
        component: () =>
          import("@/views/purchases/requests/material-product/List.vue"),
        meta: {
          title: "pages.requestForQuotationMaterialProduct.title",
        },
      },
      {
        path: "create",
        name: "RequestForQuotationMaterialProductCreate",
        component: () =>
          import("@/views/purchases/requests/material-product/Form.vue"),
        meta: {
          title: "pages.requestForQuotationMaterialProduct.title",
        },
      },
      {
        path: "edit/:id",
        name: "RequestForQuotationMaterialProductEdit",
        component: () =>
          import("@/views/purchases/requests/material-product/Form.vue"),
        meta: {
          title: "pages.requestForQuotationMaterialProduct.edit",
        },
      },
      {
        path: "view/:id",
        name: "RequestForQuotationMaterialProductView",
        component: () =>
          import("@/views/purchases/requests/material-product/View.vue"),
        meta: {
          title: "pages.requestForQuotationMaterialProduct.view",
        },
      },
    ],
  },
  {
    path: "/purchases/requests/fuels",
    name: "RequestForQuotationsFuel",
    redirect: "/purchases/requests/fuels/list",
    children: [
      {
        path: "list",
        name: "RequestForQuotationFuelList",
        component: () => import("@/views/purchases/requests/fuels/List.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.title",
        },
      },
      {
        path: "create",
        name: "RequestForQuotationFuelCreate",
        component: () => import("@/views/purchases/requests/fuels/Form.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.title",
        },
      },
      {
        path: "edit/:id",
        name: "RequestForQuotationFuelEdit",
        component: () => import("@/views/purchases/requests/fuels/Form.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.edit",
        },
      },
      {
        path: "view/:id",
        name: "RequestForQuotationFuelView",
        component: () => import("@/views/purchases/requests/fuels/View.vue"),
        meta: {
          title: "pages.requestForQuotationFuel.view",
        },
      },
    ],
  },
  {
    path: "/purchases/orders/material-product",
    name: "OrdersMaterialProduct",
    redirect: "/purchases/orders/material-product/list",
    children: [
      {
        path: "list",
        name: "OrdersMaterialProductList",
        component: () =>
          import("@/views/purchases/orders/material-product/List.vue"),
        meta: {
          title: "pages.OrdersMaterialProduct.title",
        },
      },
      {
        path: "create",
        name: "OrdersMaterialProductCreate",
        component: () =>
          import("@/views/purchases/orders/material-product/Form.vue"),
        meta: {
          title: "pages.OrdersMaterialProduct.title",
        },
      },
      {
        path: "edit/:id",
        name: "OrdersMaterialProductEdit",
        component: () =>
          import("@/views/purchases/orders/material-product/Form.vue"),
        meta: {
          title: "pages.OrdersMaterialProduct.edit",
        },
      },
      {
        path: "view/:id",
        name: "OrdersMaterialProductView",
        component: () =>
          import("@/views/purchases/orders/material-product/View.vue"),
        meta: {
          title: "pages.OrdersMaterialProduct.view",
        },
      },
    ],
  },
  {
    path: "/purchases/receiving-docs",
    name: "ReceivingDocs",
    redirect: "/purchases/receiving-docs/list",
    children: [
      {
        path: "list",
        name: "ReceivingDocsList",
        component: () => import("@/views/purchases/receiving-docs/List.vue"),
        meta: {
          title: "pages.ReceivingDocs.title",
        },
      },
      {
        path: "create",
        name: "ReceivingDocsCreate",
        component: () => import("@/views/purchases/receiving-docs/Form.vue"),
        meta: {
          title: "pages.ReceivingDocs.title",
        },
      },
      {
        path: "edit/:id",
        name: "ReceivingDocsEdit",
        component: () => import("@/views/purchases/receiving-docs/Form.vue"),
        meta: {
          title: "pages.ReceivingDocs.edit",
        },
      },
    ],
  },
  {
    path: "/purchases/purchase-invoices",
    name: "PurchaseInvoices",
    redirect: "/purchases/purchase-invoices/list",
    children: [
      {
        path: "list",
        name: "PurchaseInvoicesList",
        component: () => import("@/views/purchases/purchase-invoices/List.vue"),
        meta: {
          title: "pages.PurchaseInvoices.title",
        },
      },
      {
        path: "create",
        name: "PurchaseInvoicesCreate",
        component: () => import("@/views/purchases/purchase-invoices/Form.vue"),
        meta: {
          title: "pages.PurchaseInvoices.create",
        },
      },
      {
        path: "edit/:id",
        name: "PurchaseInvoicesEdit",
        component: () => import("@/views/purchases/purchase-invoices/Form.vue"),
        meta: {
          title: "pages.PurchaseInvoices.edit",
        },
      },
    ],
  },
];
