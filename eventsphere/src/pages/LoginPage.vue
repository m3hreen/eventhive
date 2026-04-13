<template>
    <main class="auth-page">
      <div class="auth-container">
        <div class="auth-left">
          <h1>Welcome back</h1>
          <p>Log in to manage your events, RSVPs, and tickets with EventSphere.</p>
        </div>
  
        <div class="auth-right">
          <form class="auth-form" @submit.prevent="handleLogin">
            <h2>Login</h2>
  
            <label for="email">Email</label>
            <input id="email" v-model="form.email" type="email" placeholder="Enter your email" required />
  
            <label for="password">Password</label>
            <input id="password" v-model="form.password" type="password" placeholder="Enter your password" required />
  
            <div class="auth-options">
              <label class="remember-me">
                <input type="checkbox" v-model="form.remember" />
                Remember me
              </label>
              <a href="#">Forgot password?</a>
            </div>
  
            <button type="submit" class="primary-btn full-btn">Login</button>
  
            <p v-if="message" class="form-message">{{ message }}</p>
  
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
  
  const form = reactive({
    email: '',
    password: '',
    remember: false
  })
  
  const message = ref('')
  
  function handleLogin() {
    if (!form.email || !form.password) {
      message.value = 'Please fill in all fields.'
      return
    }
  
    message.value = 'Login submitted successfully.'
    console.log('Login Data:', { ...form })
  }
  </script>