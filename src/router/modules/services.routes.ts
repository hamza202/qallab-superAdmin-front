import type { RouteRecordRaw } from "vue-router";

export const servicesRoutes: RouteRecordRaw[] = [
  {
    path: "/services",
    name: "Services",
    redirect: "/services/list",
    children: [
      {
        path: "list",
        name: "ServicesList",
        component: () => import("@/views/services/services/List.vue"),
        meta: {
          title: "pages.services.title",
        },
      },
      {
        path: "create",
        name: "ServicesCreate",
        component: () => import("@/views/services/services/Form.vue"),
        meta: {
          title: "pages.services.create",
        },
      },
      {
        path: "edit/:id",
        name: "ServicesEdit",
        component: () => import("@/views/services/services/Form.vue"),
        meta: {
          title: "pages.services.edit",
        },
      },
      {
        path: "view/:id",
        name: "ServicesView",
        component: () => import("@/views/services/services/view.vue"),
        meta: {
          title: "pages.services.view",
        },
      },

      {
        path: "prices-list",
        name: "ServicesPriceListsList",
        component: () => import("@/views/services/services-prices/List.vue"),
        meta: {
          title: "pages.servicesPricesList.title",
        },
      },
      {
        path: "price-list-edit/:id",
        name: "ServicesPriceListEdit",
        component: () => import("@/views/services/services-prices/Form.vue"),
        meta: {
          title: "pages.servicePricesList.title",
        },
      },
      {
        path: "price-list-create",
        name: "ServicesPriceListCreate",
        component: () => import("@/views/services/services-prices/Form.vue"),
        meta: {
          title: "pages.servicePricesList.title",
        },
      },
    ],
  },
];
