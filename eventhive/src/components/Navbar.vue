<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="logo-container">
        <img :src="logo" alt="EventHive Logo" class="logo" />
        <span class="logo-text">EventHive</span>
      </router-link>

      <div class="nav-links">
        <router-link to="/" class="nav-link">Home</router-link>

        <template v-if="user && user.role === 'attendee'">
          <router-link to="/suggestions" class="nav-link">Suggestions</router-link>
          <router-link to="/my-suggestions" class="nav-link">My Suggestions</router-link>
          <router-link to="/inbox" class="nav-link">Inbox</router-link>
        </template>

        <template v-if="user && user.role === 'organizer'">
          <router-link to="/my-events" class="nav-link">My Events</router-link>
          <router-link to="/create-event" class="nav-link">Create Event</router-link>
          <router-link to="/organizer-dashboard" class="nav-link">Dashboard</router-link>
        </template>

        <template v-if="user">
          <span class="user-greeting">Hi, {{ user.name }}</span>
          <button class="nav-outline-btn" @click="handleLogout">Logout</button>
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

function loadUser() {
  const savedUser = localStorage.getItem('eventhiveUser')
  currentUser.value = savedUser ? JSON.parse(savedUser) : null
}

const user = computed(() => currentUser.value)

function handleLogout() {
  localStorage.removeItem('eventhiveUser')
  currentUser.value = null
  window.dispatchEvent(new Event('user-auth-changed'))
  router.push('/login')
}

function handleStorageChange() {
  loadUser()
}

onMounted(() => {
  loadUser()
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener('user-auth-changed', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('user-auth-changed', handleStorageChange)
})
</script>