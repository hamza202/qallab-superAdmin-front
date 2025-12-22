import type { RouteRecordRaw } from 'vue-router'

export const projectsRoutes: RouteRecordRaw[] = [
  {
    path: '/projects',
    name: 'Projects',
    redirect: '/projects/list',
    children: [
      {
        path: 'list',
        name: 'ProjectsList',
        component: () => import('@/views/projects/List.vue'),
        meta: {
          title: 'pages.projects.title',
        },
      },
      {
        path: 'create',
        name: 'ProjectsCreate',
        component: () => import('@/views/projects/Form.vue'),
        meta: {
          title: 'pages.projects.create',
        },
      },
      {
        path: 'edit/:id',
        name: 'ProjectsEdit',
        component: () => import('@/views/projects/Form.vue'),
        meta: {
          title: 'pages.projects.edit',
        },
      },
    ],
  },
]
