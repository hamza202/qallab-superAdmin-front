import type { RouteRecordRaw } from 'vue-router'

export const servicesRoutes: RouteRecordRaw[] = [
  {
    path: '/services',
    name: 'Services',
    redirect: '/services/prices-list',
    children: [
      {
        path: 'prices-list',
        name: 'ServicesPriceList',
        component: () => import('@/views/services/services-prices/List.vue'),
        meta: {
          title: 'pages.servicesPrices.title',
        },
      },
      {
        path: 'price-list-edit',
        name: 'ServicesPriceListEdit',
        component: () => import('@/views/services/services-prices/Form.vue'),
        meta: {
          title: 'pages.servicesPrices.title',
        },
      },
    ],
  },
]
