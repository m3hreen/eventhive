<template>
    <main class="auth-page">
      <div class="auth-container">
        <div class="auth-left">
          <h1>Create your account</h1>
          <p>Join EventSphere as an attendee or organizer and start exploring events today.</p>
        </div>
  
        <div class="auth-right">
          <form class="auth-form" @submit.prevent="handleSignup">
            <h2>Sign Up</h2>
  
            <label for="name">Full Name</label>
            <input id="name" v-model="form.name" type="text" placeholder="Enter your full name" required />
  
            <label for="email">Email</label>
            <input id="email" v-model="form.email" type="email" placeholder="Enter your email" required />
  
            <label for="password">Password</label>
            <input id="password" v-model="form.password" type="password" placeholder="Create a password" required />
  
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
  
            <button type="submit" class="primary-btn full-btn">Create Account</button>
  
            <p v-if="message" class="form-message">{{ message }}</p>
  
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
  
  const form = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  })
  
  const message = ref('')
  
  function handleSignup() {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.role
    ) {
      message.value = 'Please complete all fields.'
      return
    }
  
    if (form.password !== form.confirmPassword) {
      message.value = 'Passwords do not match.'
      return
    }
  
    message.value = 'Account created successfully.'
    console.log('Signup Data:', { ...form })
  }
  </script>