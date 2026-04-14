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
import LandingPage from '../pages/LandingPage.vue'
import RSVPs from '../pages/RSVPsPage.vue'

const routes = [
  { path: '/', name: 'Landing', component: LandingPage },
  { path: '/home', name: 'Home', component: HomePage, meta: { requiresAuth: true } }, // requires login
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
    path: '/suggestions',
    name: 'Suggestions',
    component: SuggestionsPage,
    meta: { requiresAuth: true, role: 'attendee' }
  },
  {
    path: '/my-suggestions',
    name: 'MySuggestions',
    component: () => import('../pages/MySuggestionsPage.vue'),
    meta: { requiresAuth: true, role: 'attendee' }
  },
  {
    path: '/inbox',
    name: 'Inbox',
    component: InboxPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/saved-events',
    name: 'SavedEvents',
    component: () => import('../pages/SavedEventsPage.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/rsvps',
    name: 'RSVPs',
    component: () => import('../pages/RSVPsPage.vue'),
    meta: { requiresAuth: true }
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const savedUser = localStorage.getItem('eventhiveUser')
  const user = savedUser ? JSON.parse(savedUser) : null

  // Redirect logged-in users away from landing/login/signup
  if (user && (to.path === '/' || to.path === '/login' || to.path === '/signup')) {
    return next('/home')
  }

  // Protect authenticated routes
  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  // Block users from routes meant for another role
  if (to.meta.role && user && to.meta.role !== user.role) {
    return next('/home')
  }

  next()
})

export default router