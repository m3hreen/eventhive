<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="logo-container">
        <img :src="logo" alt="EventHive Logo" class="logo" />
        <span class="logo-text">EventHive</span>
      </router-link>

      <button
        class="burger-btn"
        type="button"
        @click="toggleMenu"
        :aria-expanded="isMenuOpen ? 'true' : 'false'"
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-links" :class="{ open: isMenuOpen }">
        <router-link v-if="user" to="/" class="nav-link" @click="closeMenu">Home</router-link>

      <template v-if="user">
        <router-link to="/suggestions" class="nav-link" @click="closeMenu">Suggestions</router-link>

        <!-- My dropdown -->
        <div class="nav-dropdown">
          <button class="nav-link dropdown-toggle" @click="toggleMyMenu">
            My Activity ▾
          </button>

          <div class="dropdown-menu" v-show="isMyOpen">
            <router-link to="/my-suggestions" class="dropdown-item" @click="closeAllMenus">
              My Suggestions
            </router-link>
            <router-link to="/saved-events" class="dropdown-item" @click="closeAllMenus">
              Saved Events
            </router-link>
            <router-link to="/rsvps" class="dropdown-item" @click="closeAllMenus">
              My RSVPs
            </router-link>
          </div>
        </div>

        <router-link to="/inbox" class="nav-link inbox-link" @click="closeMenu">
          <span class="inbox-text">Inbox</span>
          <img
            v-if="hasUnreadInbox"
            src="/bee-alert.svg"
            alt="Unread inbox messages"
            class="inbox-alert-icon"
          />
        </router-link>
      </template>

        <template v-if="user && user.role === 'organizer'">
          <router-link to="/my-events" class="nav-link" @click="closeMenu">My Events</router-link>
          <router-link to="/create-event" class="nav-link" @click="closeMenu">Create Event</router-link>
        </template>

        <template v-if="user">
          <router-link
  v-if="user.role === 'attendee'"
  to="/attendee-dashboard"
  class="user-greeting link"
>
  Hi, {{ user.name }}
</router-link>

<router-link
  v-else
  to="/organizer-dashboard"
  class="user-greeting link"
>
  Hi, {{ user.name }}
</router-link>          <button class="nav-outline-btn" @click="handleLogout">Logout</button>
        </template>

        <template v-else>
          <router-link to="/login" class="nav-outline-btn nav-link-btn">Login</router-link>
          <router-link to="/signup" class="nav-fill-btn nav-link-btn">Sign Up</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/logo.svg'

const router = useRouter()
const currentUser = ref(null)
const isMenuOpen = ref(false)
const isMyOpen = ref(false)
const hasUnreadInbox = ref(false)

async function checkUnreadInbox() {
  try {
    const savedUser = localStorage.getItem('eventhiveUser')
    const user = savedUser ? JSON.parse(savedUser) : null

    if (!user?.email) {
      hasUnreadInbox.value = false
      return
    }

    const res = await fetch(
      `http://localhost:5001/api/reminders?email=${encodeURIComponent(user.email)}`
    )

    const data = await res.json()

    if (!res.ok || !Array.isArray(data)) {
      hasUnreadInbox.value = false
      return
    }

    hasUnreadInbox.value = data.some(item => item.read === false)
  } catch (error) {
    console.error('Error checking unread inbox messages:', error)
    hasUnreadInbox.value = false
  }
}

function closeAllMenus() {
  isMyOpen.value = false
  closeMenu()
}

function toggleMyMenu() {
  isMyOpen.value = !isMyOpen.value
}

function handleClickOutside(event) {
  const dropdown = document.querySelector('.nav-dropdown')
  if (dropdown && !dropdown.contains(event.target)) {
    isMyOpen.value = false
  }
}

function loadUser() {
  const savedUser = localStorage.getItem('eventhiveUser')
  currentUser.value = savedUser ? JSON.parse(savedUser) : null
}

const user = computed(() => currentUser.value)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function handleResize() {
  if (window.innerWidth > 900) {
    closeMenu()
  }
}

function handleLogout() {
  localStorage.removeItem('eventhiveUser')
  currentUser.value = null
  closeMenu()
  window.dispatchEvent(new Event('user-auth-changed'))
  router.push('/login')
}

function handleStorageChange() {
  loadUser()
  checkUnreadInbox()
}

onMounted(() => {
  loadUser()
  checkUnreadInbox()

  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('user-auth-changed', handleStorageChange)
  window.addEventListener('resize', handleResize)
  window.addEventListener('inbox-updated', checkUnreadInbox)

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('user-auth-changed', handleStorageChange)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('inbox-updated', checkUnreadInbox)

  document.removeEventListener('click', handleClickOutside)
})
</script>
<style scoped>

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  gap: 18px;
  padding: 8px 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
}

.nav-link:hover {
  color: #f7d774;
  background: rgba(0, 0, 0, 0.25);
}

.inbox-link.nav-link:hover {
  background: transparent;
}

.inbox-text {
  padding: 4px 6px;
  border-radius: 6px;
  margin-right: -4px;
}

.inbox-link:hover .inbox-text {
  background: rgba(0, 0, 0, 0.25);
  color: #f7d774;
}

.user-greeting {
  color: #ffffff;
  font-weight: 700;
  text-decoration: none;
  margin-left: 16px;
  padding: 6px 10px;
  border-radius: 6px;
}

.user-greeting:hover {
  color: #f7d774; 
  background: rgba(0, 0, 0, 0.25);
}

.burger-btn {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  margin-left: auto;
}

.burger-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: #f5f4ed;
  margin: 5px 0;
  border-radius: 999px;
}

.nav-dropdown {
  position: relative;
}

.dropdown-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  min-width: 180px;
  background: #8b6ec7;
  border-radius: 12px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.18);
  padding: 8px;
  z-index: 1200;
}


.dropdown-item {
  display: block;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  padding: 10px 12px;
  border-radius: 8px;
}

.dropdown-item:hover {
  background: rgba(0, 0, 0, 0.25);
  color: #f7d774;
}

.inbox-link {
  gap: 0 !important;
}

.inbox-alert-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
  position: relative;
  top: -6px;
  animation: bee-bounce 1s infinite;
}

@keyframes bee-bounce {
  0%, 100% {
    transform: translateY(-3px);
  }
  30% {
    transform: translateY(-7px);
  }
  60% {
    transform: translateY(-1px);
  }
}

@media (max-width: 900px) {
  .burger-btn {
    display: block;
  }

  .nav-container {
    position: relative;
  }

  .nav-links {
    display: none;
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 320;
    padding: 16px;
    background: #8b6ec7;
    border-radius: 10px;
    box-shadow: 0 14px 34px rgba(72, 59, 102, 0.18);
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    z-index: 1100;
    margin-left: 0;
  }

  .nav-links.open {
    display: flex;
  }

  .nav-link,
  .user-greeting.link,
  .nav-link-btn,
  .nav-outline-btn,
  .nav-fill-btn {
    width: 100%;
    text-align: center;
    justify-content: center;
  }
}
</style>
