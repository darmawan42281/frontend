const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { guest: true }
      },
      {
        path: 'transactions',
        name: 'transactions',
        component: () => import('pages/TransactionsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'accounts',
        name: 'accounts',
        component: () => import('pages/AccountsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('pages/CategoriesPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'bills',
        name: 'bills',
        component: () => import('pages/BillsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('pages/ReportsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('pages/UsersPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
