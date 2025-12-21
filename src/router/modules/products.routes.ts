import type { RouteRecordRaw } from 'vue-router'

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: '/products',
    name: 'Products',
    redirect: '/products/list',
    children: [
      {
        path: 'prices-list',
        name: 'ProductsPriceList',
        component: () => import('@/views/products/price-lists/List.vue'),
        meta: {
          title: 'pages.priceLists.title',
        },
      },
      {
        path: 'price-list-edit',
        name: 'ProductPriceListEdit',
        component: () => import('@/views/products/price-lists/Form.vue'),
        meta: {
          title: 'pages.priceList.title',
        },
      },
      {
        path: 'production-capacity-list',
        name: 'ProductsProductionCapacityList',
        component: () => import('@/views/products/production-capacity/List.vue'),
        meta: {
          title: 'pages.productionCapacity.title',
        },
      },
      {
        path: 'production-capacity-edit',
        name: 'ProductsProductionCapacityEdit',
        component: () => import('@/views/products/production-capacity/Form.vue'),
        meta: {
          title: 'pages.productionCapacity.title',
        },
      },
    ],
  },
]
