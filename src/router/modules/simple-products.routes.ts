import type { RouteRecordRaw } from 'vue-router'

export const simpleProductsRoutes: RouteRecordRaw[] = [
  {
    path: '/simple-products',
    name: 'SimpleProducts',
    redirect: '/simple-products/list',
    children: [
      {
        path: 'list',
        name: 'SimpleProductsList',
        component: () => import('@/views/simple-products/List.vue'),
        meta: {
          title: 'pages.simpleProducts.title',
        },
      },
      {
        path: 'create',
        name: 'SimpleProductsCreate',
        component: () => import('@/views/simple-products/Form.vue'),
        meta: {
          title: 'pages.simpleProducts.title',
        },
      },
      {
        path: 'edit/:id',
        name: 'SimpleProductsEdit',
        component: () => import('@/views/simple-products/Form.vue'),
        meta: {
          title: 'pages.simpleProducts.title',
        },
      },
    ],
  },
]
