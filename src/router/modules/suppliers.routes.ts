import type { RouteRecordRaw } from 'vue-router'

export const suppliersRoutes: RouteRecordRaw[] = [
  {
    path: '/suppliers',
    name: 'Suppliers',
    redirect: '/suppliers/list',
    children: [
      {
        path: 'list',
        name: 'SuppliersList',
        component: () => import('@/views/suppliers/List.vue'),
        meta: {
          title: 'pages.suppliers.title',
        },
      },
      {
        path: 'create',
        name: 'SuppliersCreate',
        component: () => import('@/views/suppliers/Form.vue'),
        meta: {
          title: 'pages.suppliers.create',
        },
      },
      {
        path: 'edit/:id',
        name: 'SuppliersEdit',
        component: () => import('@/views/suppliers/Form.vue'),
        meta: {
          title: 'pages.suppliers.edit',
        },
      },
    ],
  },
]
