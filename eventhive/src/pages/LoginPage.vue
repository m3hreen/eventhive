<template>
  <main class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <h1>Welcome back</h1>
        <p>Log in to manage your events, RSVPs, and tickets with EventHive.</p>
      </div>

      <div class="auth-right">
        <form class="auth-form" @submit.prevent="handleLogin">
          <h2>Login</h2>

          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Enter your email"
            required
          />

          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Enter your password"
            required
          />

          <div class="auth-options">
            <label class="remember-me">
              <input type="checkbox" v-model="form.remember" />
              Remember me
            </label>
            <a href="#">Forgot password?</a>
          </div>

          <button type="submit" class="primary-btn full-btn" :disabled="loading">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>

          <p v-if="message" class="form-message success-message">{{ message }}</p>
          <p v-if="errorMessage" class="form-message error-message">{{ errorMessage }}</p>

          <p class="switch-auth">
            Don't have an account?
            <router-link to="/signup">Sign up</router-link>
          </p>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const message = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function handleLogin() {
  message.value = ''
  errorMessage.value = ''

  if (!form.email || !form.password) {
    errorMessage.value = 'Please fill in all fields.'
    return
  }

  try {
    loading.value = true

    const response = await fetch('http://localhost:5001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Login failed.'
      return
    }

    localStorage.setItem('eventhiveUser', JSON.stringify(data.user))
    window.dispatchEvent(new Event('user-auth-changed'))

    message.value = 'Login successful. Redirecting...'

    form.email = ''
    form.password = ''
    form.remember = false

    setTimeout(() => {
      if (data.user.role === 'attendee') {
        router.push('/attendee-dashboard')
      } else if (data.user.role === 'organizer') {
        router.push('/organizer-dashboard')
      } else {
        router.push('/')
      }
    }, 1200)
  } catch (error) {
    errorMessage.value = 'Could not connect to the server.'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>