import { createRouter, createWebHistory } from 'vue-router'
import { initAuth, useAuth } from '@/composables/useAuth'
import { loadMemberships } from '@/composables/useHerd'

declare module 'vue-router' {
  interface RouteMeta {
    /** Reachable without signing in. */
    public?: boolean
    /** Reachable when signed in but not yet in a herd. */
    noHerd?: boolean
  }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/pages/LoginPage.vue'), meta: { public: true } },
    { path: '/welcome', component: () => import('@/pages/OnboardingPage.vue'), meta: { noHerd: true } },
    {
      path: '/',
      component: () => import('@/components/AppLayout.vue'),
      children: [
        { path: '', component: () => import('@/pages/TodayPage.vue') },
        { path: 'settings', component: () => import('@/pages/HerdSettingsPage.vue') },
        { path: 'goats', component: () => import('@/pages/goats/GoatsPage.vue') },
        { path: 'goats/new', component: () => import('@/pages/goats/GoatFormPage.vue') },
        { path: 'goats/:id', component: () => import('@/pages/goats/GoatDetailPage.vue') },
        { path: 'goats/:id/edit', component: () => import('@/pages/goats/GoatFormPage.vue') },
        { path: 'milk', component: () => import('@/pages/milk/MilkPage.vue') },
        { path: 'milk/history', component: () => import('@/pages/milk/MilkHistoryPage.vue') },
        { path: 'milk/production', component: () => import('@/pages/milk/ProductionPage.vue') },
        { path: 'breeding', component: () => import('@/pages/breeding/BreedingPage.vue') },
        { path: 'breeding/kidding', component: () => import('@/pages/breeding/KiddingPage.vue') },
        {
          path: ':section(health|calendar|finances)',
          component: () => import('@/pages/ComingSoonPage.vue'),
        },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  await initAuth()
  const { user } = useAuth()

  if (!user.value) {
    return to.meta.public ? true : { path: '/login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } }
  }
  if (to.meta.public) return '/'
  if (to.meta.noHerd) return true

  const memberships = await loadMemberships(user.value.id)
  return memberships.length ? true : '/welcome'
})
