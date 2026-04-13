<template>
  <main class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <h1>
          <span class="welcome">Welcome</span><br />
          <span class="back">back</span>
        </h1>
        <p>Manage your events, RSVPs, and tickets all in one place.</p>
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
    router.push('/home')
    }, 1200)
  } catch (error) {
    errorMessage.value = 'Could not connect to the server.'
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>

.auth-page {
  min-height: 100vh; 
  background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%); 
  position: relative;
  overflow: hidden; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 40px 20px; 
}

.auth-page::before {
  content: ''; 
  position: absolute; 
  top: 90px; 
  left: -60px; 
  width: 320px; 
  height: 320px; 
  background: radial-gradient(
    circle,
    rgba(139, 110, 199, 0.16) 0%,
    rgba(247, 236, 141, 0.1) 45%,
    transparent 75%
  );
  filter: blur(24px); 
  pointer-events: none; 
}

.auth-page::after {
  content: '';
  position: absolute;
  bottom: 40px;
  right: -50px;
  width: 280px;
  height: 280px;
  background: radial-gradient(
    circle,
    rgba(246, 169, 58, 0.1) 0%,
    rgba(166, 134, 210, 0.12) 42%,
    transparent 75%
  );
  filter: blur(24px);
  pointer-events: none;
}

.auth-container {
  width: 100%;
  max-width: 1150px;
  display: grid;
  grid-template-columns: 1fr 520px;
  gap: 34px;
  align-items: center;
  position: relative;
  z-index: 1;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.74) 0%, rgba(248, 243, 255, 0.78) 100%);
  border: 1px solid rgba(139, 110, 199, 0.12);
  border-radius: 34px;
  box-shadow: 0 18px 45px rgba(72, 59, 102, 0.08);
  padding: 42px;
}


.auth-left {
  position: relative;
  padding: 10px 10px 10px 30px;
  max-width: 470px;
  margin: 0 auto;
}

.auth-left::after {
  content: '';
  display: block;
  width: 72px;
  height: 5px;
  margin-top: 22px;
  border-radius: 999px;
  opacity: 0.85;
}

.auth-left::before {
  content: '';
  position: absolute; 
  top: 30px; 
  left: -50px; 
  width: 300px; 
  height: 300px; 
  background: radial-gradient(
    circle,
    rgba(139, 110, 199, 0.16) 0%,
    rgba(247, 236, 141, 0.08) 48%,
    transparent 75%
  );
  filter: blur(30px);
  z-index: -1;
}

.auth-left h1 .accent {
  background: linear-gradient(135deg, #8b6ec7, #f6a93a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.auth-left h1 {
  font-size: 82px;
  line-height: 0.9;
  letter-spacing: -2.5px;
  margin: 0 0 22px;
  font-weight: 800;
  color: #7a5bc2;
}

.auth-left .welcome {
  color: #6f54a8;
}

.auth-left .back {
  color: #6f54a8;
}

.auth-left p {
  font-size: 21px;
  line-height: 1.75;
  color: #7b718f;
  max-width: 400px;
  margin: 0;
}

.auth-right {
  display: flex;
  justify-content: center;
}

.auth-form {
  width: 100%;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 110, 199, 0.14);
  border-radius: 32px;
  box-shadow: 0 18px 42px rgba(105, 84, 168, 0.10);
  padding: 36px 32px;
}


.auth-form h2 {
  margin: 0 0 22px;
  font-size: 36px;
  letter-spacing: -1px;
  color: #7a5bc2;
}

.auth-form label {
  display: block;
  margin: 14px 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #7a738f;
}

.auth-form input,
.auth-form select {
  width: 100%;
  border: 1px solid rgba(139, 110, 199, 0.14);
  background: #fffdfb;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 15px;
  color: #243047;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  box-sizing: border-box;
}

.auth-form input:hover {
  border-color: rgba(139, 110, 199, 0.3);
}

.auth-form input:focus,
.auth-form select:focus {
  border-color: rgba(139, 110, 199, 0.42);
  box-shadow: 0 0 0 4px rgba(139, 110, 199, 0.08);
}

.auth-form input::placeholder {
  color: #8b8f9d;
}

.auth-options {
  margin-top: 14px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.remember-me {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #5b6475;
  margin: 0;
}

.remember-me input {
  width: auto;
  margin: 0;
}

.auth-options a,
.switch-auth a {
  color: #8b6ec7; 
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.auth-options a:hover,
.switch-auth a:hover {
  color: #d49a77;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  padding: 14px 24px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
  border: none;
  background: linear-gradient(135deg, #8b6ec7 0%, #a686d2 55%, #d49a77 100%);
  color: white;
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 14px 28px rgba(139, 110, 199, 0.2);
}

.primary-btn:hover {
  transform: translateY(-2px);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.full-btn {
  width: 100%;
  margin-top: 8px;
}

.form-message {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
}

.success-message {
  background: rgba(78, 170, 120, 0.1);
  color: #2d7a4d;
  border: 1px solid rgba(78, 170, 120, 0.18);
}

.error-message {
  background: rgba(220, 96, 96, 0.1);
  color: #b14444;
  border: 1px solid rgba(220, 96, 96, 0.18);
}

.switch-auth {
  margin: 18px 0 0;
  text-align: center;
  color: #5b6475;
  font-size: 15px;
}

@media (max-width: 960px) {
  .auth-container {
    grid-template-columns: 1fr;
    max-width: 620px;
  }

  .auth-left {
    text-align: center;
    padding: 0;
  }

  .auth-left h1 {
    font-size: 52px;
    max-width: none;
  }

  .auth-left p {
    font-size: 19px;
    max-width: none;
  }
}

@media (max-width: 640px) {
  .auth-page {
    padding: 24px 14px;
  }

  .auth-form {
    padding: 24px 18px;
    border-radius: 24px;
  }

  .auth-left h1 {
    font-size: 42px;
    line-height: 1;
  }

  .auth-form h2 {
    font-size: 28px;
  }
}
</style>