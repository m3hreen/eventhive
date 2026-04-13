import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import AttendeeDashboard from '../pages/AttendeeDashboard.vue'
import OrganizerDashboard from '../pages/OrganizerDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupPage
  },
  {
    path: '/attendee-dashboard',
    name: 'AttendeeDashboard',
    component: AttendeeDashboard,
    meta: { requiresAuth: true, role: 'attendee' }
  },
  {
    path: '/organizer-dashboard',
    name: 'OrganizerDashboard',
    component: OrganizerDashboard,
    meta: { requiresAuth: true, role: 'organizer' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const savedUser = localStorage.getItem('eventsphereUser')
  const user = savedUser ? JSON.parse(savedUser) : null

  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  if (to.meta.role && user && to.meta.role !== user.role) {
    if (user.role === 'attendee') {
      return next('/attendee-dashboard')
    }

    if (user.role === 'organizer') {
      return next('/organizer-dashboard')
    }

    return next('/')
  }

  next()
})

export default router