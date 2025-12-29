import type { RouteRecordRaw } from 'vue-router'

export const crushersRoutes: RouteRecordRaw[] = [
  {
    path: '/crushers',
    name: 'Crushers',
    redirect: '/crushers/list',
    children: [
      {
        path: 'list',
        name: 'CrushersList',
        component: () => import('@/views/crushers/List.vue'),
        meta: {
          title: 'pages.crushers.title',
        },
      },
      {
        path: 'create',
        name: 'CrushersCreate',
        component: () => import('@/views/crushers/Form.vue'),
        meta: {
          title: 'pages.crushers.create',
        },
      },
      {
        path: 'edit/:id',
        name: 'CrushersEdit',
        component: () => import('@/views/crushers/Form.vue'),
        meta: {
          title: 'pages.crushers.edit',
        },
      },
    ],
  },
]
