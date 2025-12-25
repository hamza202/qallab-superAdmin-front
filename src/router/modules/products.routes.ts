import type { RouteRecordRaw } from "vue-router";

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: "/products",
    name: "Products",
    redirect: "/products/prices-list",
    children: [
      {
        path: "prices-list",
        name: "ProductsPriceList",
        component: () => import("@/views/products/price-lists/List.vue"),
        meta: {
          title: "pages.ProductsPriceLists.title",
        },
      },
      {
        path: "price-list-edit/:id",
        name: "ProductPriceListEdit",
        component: () => import("@/views/products/price-lists/Form.vue"),
        meta: {
          title: "pages.ProductsPriceList.title",
        },
      },
      {
        path: "price-list-create",
        name: "ProductPriceListCreate",
        component: () => import("@/views/products/price-lists/Form.vue"),
        meta: {
          title: "pages.ProductsPriceList.title",
        },
      },
      {
        path: "production-capacity-list",
        name: "ProductsProductionCapacityList",
        component: () =>
          import("@/views/products/production-capacity/List.vue"),
        meta: {
          title: "pages.productionCapacityLists.title",
        },
      },
      {
        path: "production-capacity-edit/:id",
        name: "ProductsProductionCapacityEdit",
        component: () =>
          import("@/views/products/production-capacity/Form.vue"),
        meta: {
          title: "pages.productionCapacityList.title",
        },
      },
      {
        path: "production-capacity-create",
        name: "ProductsProductionCapacityCreate",
        component: () =>
          import("@/views/products/production-capacity/Form.vue"),
        meta: {
          title: "pages.productionCapacityList.title",
        },
      },
    ],
  },
  {
    path: "/simple-products",
    name: "SimpleProducts",
    redirect: "/simple-products/list",
    children: [
      {
        path: "list",
        name: "SimpleProductsList",
        component: () => import("@/views/products/simple-products/List.vue"),
        meta: {
          title: "pages.simpleProducts.title",
        },
      },
      {
        path: "create",
        name: "SimpleProductsCreate",
        component: () => import("@/views/products/simple-products/Form.vue"),
        meta: {
          title: "pages.simpleProducts.title",
        },
      },
      {
        path: "edit/:id",
        name: "SimpleProductsEdit",
        component: () => import("@/views/products/simple-products/Form.vue"),
        meta: {
          title: "pages.simpleProducts.title",
        },
      },
    ],
  },
  {
    path: "/group-products",
    name: "GroupProducts",
    redirect: "/group-products/list",
    children: [
      {
        path: "list",
        name: "GroupProductsList",
        component: () => import("@/views/products/group-products/List.vue"),
        meta: {
          title: "pages.groupProducts.title",
        },
      },
      {
        path: "create",
        name: "GroupProductsCreate",
        component: () => import("@/views/products/group-products/Form.vue"),
        meta: {
          title: "pages.groupProducts.title",
        },
      },
      {
        path: "edit/:id",
        name: "GroupProductsEdit",
        component: () => import("@/views/products/group-products/Form.vue"),
        meta: {
          title: "pages.groupProducts.title",
        },
      },
    ],
  },
];
