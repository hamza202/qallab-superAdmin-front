import type { RouteRecordRaw } from "vue-router";

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: "/products/building-material-products-prices",
    name: "ProductsBuildingMaterialPriceLists",
    redirect: "/products/building-material-products-prices/list",
    children: [
      {
        path: "list",
        name: "ProductsBuildingMaterialPriceList",
        component: () =>
          import(
            "@/views/products/building-material-products-price-lists/List.vue"
          ),
        meta: {
          title: "pages.ProductsBuildingMaterialPriceLists.title",
        },
      },
      {
        path: "edit/:id",
        name: "ProductsBuildingMaterialPriceListEdit",
        component: () =>
          import(
            "@/views/products/building-material-products-price-lists/Form.vue"
          ),
        meta: {
          title: "pages.ProductsBuildingMaterialPriceList.title",
        },
      },
    ],
  },
  {
    path: "/products/general-products-prices",
    name: "GeneralProductPriceLists",
    redirect: "/products/general-products-prices/list",
    children: [
      {
        path: "list",
        name: "GeneralProductPriceList",
        component: () =>
          import("@/views/products/general-products-prices-list/List.vue"),
        meta: {
          title: "pages.GeneralProductsPriceLists.title",
        },
      },
      {
        path: "edit/:id",
        name: "GeneralProductPriceListEdit",
        component: () =>
          import("@/views/products/general-products-prices-list/Form.vue"),
        meta: {
          title: "pages.GeneralProductPriceList.title",
        },
      },
    ],
  },
  {
    path: "/products/production-capacity",
    name: "ProductsProductionCapacityList",
    redirect: "/products/production-capacity/list",
    children: [
      {
        path: "list",
        name: "ProductProductionCapacityList",
        component: () =>
          import("@/views/products/production-capacity/List.vue"),
        meta: {
          title: "pages.productionCapacityLists.title",
        },
      },
      {
        path: "edit/:id",
        name: "ProductsProductionCapacityEdit",
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
      {
        path: "view/:id",
        name: "SimpleProductView",
        component: () => import("@/views/products/simple-products/View.vue"),
        meta: {
          title: "pages.simpleProducts.view",
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
  {
    path: "/product-variables",
    name: "ProductVariables",
    redirect: "/product-variables/list",
    children: [
      {
        path: "list",
        name: "ProductVariableList",
        component: () => import("@/views/products/product-variables/List.vue"),
        meta: {
          title: "pages.productVariables.title",
        },
      },
      {
        path: "create",
        name: "ProductVariableCreate",
        component: () => import("@/views/products/product-variables/Form.vue"),
        meta: {
          title: "pages.productVariables.create",
        },
      },
      {
        path: "edit/:id",
        name: "ProductVariableEdit",
        component: () => import("@/views/products/product-variables/Form.vue"),
        meta: {
          title: "pages.productVariables.edit",
        },
      },
    ],
  },
];
