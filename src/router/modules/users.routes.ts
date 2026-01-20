import type { RouteRecordRaw } from "vue-router";

export const usersRoutes: RouteRecordRaw[] = [
  {
    path: "/contractors",
    name: "Contractors",
    redirect: "/contractors/list",
    children: [
      {
        path: "list",
        name: "ContractorsList",
        component: () => import("@/views/users/contractors/List.vue"),
        meta: { title: "pages.contractors.title" },
      },
      {
        path: "edit/:id",
        name: "ContractorsEdit",
        component: () => import("@/views/users/contractors/Form.vue"),
        meta: { title: "pages.contractors.edit" },
      },
    ],
  },
  {
    path: "/crushers",
    name: "Crushers",
    redirect: "/crushers/list",
    children: [
      {
        path: "list",
        name: "CrushersList",
        component: () => import("@/views/users/crushers/List.vue"),
        meta: {
          title: "pages.crushers.title",
        },
      },
      {
        path: "edit/:id",
        name: "CrushersEdit",
        component: () => import("@/views/users/crushers/Form.vue"),
        meta: {
          title: "pages.crushers.edit",
        },
      },
    ],
  },
  {
    path: "/logistics",
    name: "Logistics",
    redirect: "/logistics/list",
    children: [
      {
        path: "list",
        name: "LogisticsList",
        component: () => import("@/views/users/logistics/List.vue"),
        meta: {
          title: "pages.logistics.title",
        },
      },
      {
        path: "edit/:id",
        name: "LogisticsEdit",
        component: () => import("@/views/users/logistics/Form.vue"),
        meta: {
          title: "pages.logistics.edit",
        },
      },
    ],
  },
];
