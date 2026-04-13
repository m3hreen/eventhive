import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import AttendeeDashboard from '../pages/AttendeeDashboard.vue'
import OrganizerDashboard from '../pages/OrganizerDashboard.vue'
import CreateEventsPage from '../pages/CreateEventsPage.vue'
import MyEventsPage from '../pages/MyEventsPage.vue'
import EditEventsPage from '../pages/EditEventsPage.vue'
import EventDetailsPage from '../pages/EventDetailsPage.vue'
import GuestListPage from '../pages/GuestListPage.vue'
import InboxPage from '../pages/InboxPage.vue'
import SuggestionsPage from '../pages/SuggestionsPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/signup', name: 'Signup', component: SignupPage },
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
  },
  {
    path: '/create-event',
    name: 'CreateEvent',
    component: CreateEventsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-events',
    name: 'MyEvents',
    component: MyEventsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/edit-event/:id',
    name: 'EditEvent',
    component: EditEventsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/event/:id',
    name: 'EventDetails',
    component: EventDetailsPage
  },
  {
    path: '/event/:id/guests',
    name: 'GuestList',
    component: GuestListPage,
    meta: { requiresAuth: true, role: 'organizer' }
  },
  {
    path: '/inbox',
    name: 'Inbox',
    component: InboxPage,
    meta: { requiresAuth: true, role: 'attendee' }
  },
  {
    path: '/suggestions',
    name: 'Suggestions',
    component: SuggestionsPage,
    meta: { requiresAuth: true, role: 'attendee' }
  },
  {
    path: '/my-suggestions',
    name: 'MySuggestions',
    component: () => import('../pages/MySuggestionsPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const savedUser = localStorage.getItem('eventhiveUser')
  const user = savedUser ? JSON.parse(savedUser) : null

  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  if (to.meta.role && user && to.meta.role !== user.role) {
    if (user.role === 'attendee') return next('/attendee-dashboard')
    if (user.role === 'organizer') return next('/organizer-dashboard')
    return next('/')
  }

  next()
})

export default router