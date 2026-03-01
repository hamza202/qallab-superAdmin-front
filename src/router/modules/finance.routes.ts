import type { RouteRecordRaw } from 'vue-router'

export const financeRoutes: RouteRecordRaw[] = [
  {
    path: '/finance/vouchers',
    name: 'Vouchers',
    redirect: '/finance/vouchers/list',
    children: [
      {
        path: 'list',
        name: 'VouchersList',
        component: () => import('@/views/finance/vouchers/List.vue'),
        meta: {
          title: 'pages.vouchers.title',
        },
      },
      {
        path: 'create/:type',
        name: 'VouchersCreate',
        component: () => import('@/views/finance/vouchers/Form.vue'),
        meta: {
          title: 'pages.vouchers.create',
        },
      },
      {
        path: 'edit/:id',
        name: 'VouchersEdit',
        component: () => import('@/views/finance/vouchers/Form.vue'),
        meta: {
          title: 'pages.vouchers.edit',
        },
      },
    ],
  },
]
