import type { RouteRecordRaw } from 'vue-router'

export const groupProductsRoutes: RouteRecordRaw[] = [
  {
    path: '/group-products',
    name: 'GroupProducts',
    redirect: '/group-products/list',
    children: [
      {
        path: 'list',
        name: 'GroupProductsList',
        component: () => import('@/views/group-products/List.vue'),
        meta: {
          title: 'pages.groupProducts.title',
        },
      },
      {
        path: 'create',
        name: 'GroupProductsCreate',
        component: () => import('@/views/group-products/Form.vue'),
        meta: {
          title: 'pages.groupProducts.title',
        },
      },
      {
        path: 'edit/:id',
        name: 'GroupProductsEdit',
        component: () => import('@/views/group-products/Form.vue'),
        meta: {
          title: 'pages.groupProducts.title',
        },
      },
    ],
  },
]
