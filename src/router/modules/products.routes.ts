import type { RouteRecordRaw } from 'vue-router'

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: '/products',
    name: 'Products',
    redirect: '/products/price-list',
    children: [
      {
        path: 'price-list',
        name: 'ProductsPriceList',
        component: () => import('@/views/price-lists/PriceList.vue'),
        meta: {
          title: 'pages.priceLists.title',
        },
      },
      {
        path: 'production-capacity',
        name: 'ProductsProductionCapacity',
        component: () => import('@/views/production-capacity/ProductionCapacity.vue'),
        meta: {
          title: 'pages.productionCapacity.title',
        },
      },
    ],
  },
]
