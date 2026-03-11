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
  {
    path: '/banks',
    name: 'Banks',
    redirect: '/banks/list',
    children: [
      {
        path: 'list',
        name: 'BanksList',
        component: () => import('@/views/finance/banks-and-treasuries/banks/List.vue'),
        meta: {
          title: 'pages.banks.title',
        },
      },
      {
        path: 'create',
        name: 'BanksCreate',
        component: () => import('@/views/finance/banks-and-treasuries/banks/Form.vue'),
        meta: {
          title: 'pages.banks.create',
        },
      },
      {
        path: 'edit/:id',
        name: 'BanksEdit',
        component: () => import('@/views/finance/banks-and-treasuries/banks/Form.vue'),
        meta: {
          title: 'pages.banks.edit',
        },
      },
    ],
  },
  {
    path: '/treasuries',
    name: 'Treasuries',
    redirect: '/treasuries/list',
    children: [
      {
        path: 'list',
        name: 'TreasuriesList',
        component: () => import('@/views/finance/banks-and-treasuries/treasuries/List.vue'),
        meta: {
          title: 'pages.treasuries.title',
        },
      },
      {
        path: 'create',
        name: 'TreasuriesCreate',
        component: () => import('@/views/finance/banks-and-treasuries/treasuries/Form.vue'),
        meta: {
          title: 'pages.treasuries.create',
        },
      },
      {
        path: 'edit/:id',
        name: 'TreasuriesEdit',
        component: () => import('@/views/finance/banks-and-treasuries/treasuries/Form.vue'),
        meta: {
          title: 'pages.treasuries.edit',
        },
      },
    ],
  },
]
