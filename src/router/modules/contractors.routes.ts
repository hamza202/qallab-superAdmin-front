import type { RouteRecordRaw } from 'vue-router'

export const contractorsRoutes: RouteRecordRaw[] = [
  {
    path: '/contractors',
    name: 'Contractors',
    redirect: '/contractors/list',
    children: [
      {
        path: 'list',
        name: 'ContractorsList',
        component: () => import('@/views/contractors/List.vue'),
        meta: { title: 'pages.contractors.title' },
      },
      {
        path: 'edit/:id',
        name: 'ContractorsEdit',
        component: () => import('@/views/contractors/Form.vue'),
        meta: { title: 'pages.contractors.edit' },
      },
    ],
  },
]
