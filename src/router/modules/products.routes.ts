import type { RouteRecordRaw } from 'vue-router'

export const productsRoutes: RouteRecordRaw[] = [
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('@/views/Categories.vue'),
  },
]
