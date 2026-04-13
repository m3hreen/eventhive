<template>
  <main class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <h1>Create your account</h1>
        <p>Join EventHive as an attendee or organizer and start exploring events today.</p>
      </div>

      <div class="auth-right">
        <form class="auth-form" @submit.prevent="handleSignup">
          <h2>Sign Up</h2>

          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Enter your full name"
            required
          />

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
            placeholder="Create a password"
            required
          />

          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
          />

          <label for="role">Role</label>
          <select id="role" v-model="form.role" required>
            <option value="">Select your role</option>
            <option value="attendee">Attendee</option>
            <option value="organizer">Organizer</option>
          </select>

          <button type="submit" class="primary-btn full-btn" :disabled="loading">
            {{ loading ? 'Creating Account...' : 'Create Account' }}
          </button>

          <p v-if="message" class="form-message success-message">{{ message }}</p>
          <p v-if="errorMessage" class="form-message error-message">{{ errorMessage }}</p>

          <p class="switch-auth">
            Already have an account?
            <router-link to="/login">Login</router-link>
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const message = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function handleSignup() {
  message.value = ''
  errorMessage.value = ''

  if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.role) {
    errorMessage.value = 'Please complete all fields.'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  try {
    loading.value = true

    const response = await fetch('http://localhost:5001/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Signup failed.'
      return
    }

    message.value = 'Account created successfully. Redirecting to login...'

    form.name = ''
    form.email = ''
    form.password = ''
    form.confirmPassword = ''
    form.role = ''

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    errorMessage.value = 'Could not connect to the server.'
    console.error('Signup error:', error)
  } finally {
    loading.value = false
  }
}
</script>