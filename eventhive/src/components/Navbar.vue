<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/" class="logo">EventHive</router-link>

      <div class="nav-links">
        <router-link to="/">Home</router-link>

        <template v-if="user && user.role === 'attendee'">
          <router-link to="/attendee-dashboard">Dashboard</router-link>
        </template>

        <template v-if="user && user.role === 'organizer'">
          <router-link to="/organizer-dashboard">Dashboard</router-link>
        </template>

        <template v-if="user">
          <span class="user-greeting">Hi, {{ user.name }}</span>
          <button class="nav-btn secondary logout-btn" @click="handleLogout">Logout</button>
        </template>

        <template v-else>
          <router-link to="/login" class="nav-btn secondary">Login</router-link>
          <router-link to="/signup" class="nav-btn primary">Sign Up</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

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