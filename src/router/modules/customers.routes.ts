import type { RouteRecordRaw } from 'vue-router'

export const customersRoutes: RouteRecordRaw[] = [
  {
    path: '/customers',
    name: 'Customers',
    redirect: '/customers/list',
    children: [
      {
        path: 'list',
        name: 'CustomersList',
        component: () => import('@/views/customers/List.vue'),
        meta: {
          title: 'pages.customers.title',
        },
      },
      {
        path: 'create',
        name: 'CustomersCreate',
        component: () => import('@/views/customers/Form.vue'),
        meta: {
          title: 'pages.customers.create',
        },
      },
      {
        path: 'edit/:id',
        name: 'CustomersEdit',
        component: () => import('@/views/customers/Form.vue'),
        meta: {
          title: 'pages.customers.edit',
        },
      },
    ],
  },
]
