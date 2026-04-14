<template>
  <main class="create-event-page">
    <div class="create-event-shell">
      <div class="create-event-left">
        <div class="create-event-overlay">
          <h1>Edit Event</h1>
          <p>Update your event details and keep everything current.</p>
        </div>
      </div>

      <div class="create-event-right">
        <form class="create-event-form" @submit.prevent="handleUpdate">
          <h2>Edit Event</h2>

          <label>Title</label>
          <input v-model="form.title" type="text" />

          <label>Date</label>
          <input v-model="form.date" type="date" />

          <label>Location</label>
          <input v-model="form.location" type="text" />

          <label>Category</label>
          <select v-model="form.category">
            <option value="">Select a category</option>
            <option>Music</option>
            <option>Workshops</option>
            <option>Networking</option>
            <option>Sports</option>
            <option>Community</option>
            <option>Conferences</option>
          </select>

          <label>Description</label>
          <textarea v-model="form.description" rows="5"></textarea>

          <label>Event Image URL</label>
          <input
            v-model="form.image"
            type="text"
            placeholder="Paste an image URL"
          />

          <button type="submit" class="create-event-btn" :disabled="loading">
            {{ loading ? 'Updating...' : 'Update Event' }}
          </button>

          <p v-if="message" class="success-message">{{ message }}</p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const message = ref('')
const errorMessage = ref('')

const form = reactive({
  title: '',
  date: '',
  location: '',
  category: '',
  description: '',
  image: ''
})

async function fetchEvent() {
  try {
    loading.value = true
    errorMessage.value = ''

    const response = await fetch(`http://localhost:5001/api/events/${route.params.id}`)
    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to load event.'
      return
    }

    form.title = data.title || ''
    form.date = data.date || ''
    form.location = data.location || ''
    form.category = data.category || ''
    form.description = data.description || ''
    form.image = data.image || ''
  } catch (error) {
    console.error('Fetch single event error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    loading.value = false
  }
}

async function handleUpdate() {
  message.value = ''
  errorMessage.value = ''

  if (!form.title || !form.date || !form.location || !form.category || !form.description) {
    errorMessage.value = 'Please complete all fields.'
    return
  }

  try {
    loading.value = true

    const response = await fetch(`http://localhost:5001/api/events/${route.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to update event.'
      return
    }

    message.value = 'Event updated successfully.'

    setTimeout(() => {
      router.push('/my-events')
    }, 1200)
  } catch (error) {
    console.error('Update event error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEvent()
})
</script>

<style scoped>
.create-event-page {
  min-height: 100vh;
  color: #243047;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
}

.create-event-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/hexagon-background.jpg') center/cover no-repeat;
  opacity: 0.5;
  pointer-events: none;
}

.create-event-page::after {
  content: '';
  position: absolute;
  top: 520px;
  right: -70px;
  width: 280px;
  height: 280px;
  background: radial-gradient(
    circle,
    rgba(246, 169, 58, 0.1) 0%,
    rgba(166, 134, 210, 0.12) 42%,
    transparent 75%
  );
  filter: blur(22px);
  pointer-events: none;
}

.create-event-shell {
  position: relative;
  z-index: 2;
  max-width: 1180px;
  min-height: 640px;
  margin: 80px auto 0;
  display: grid;
  grid-template-columns: 1.8fr 2fr;
  overflow: hidden;
  border-radius: 38px;
  background: linear-gradient(
    115deg,
    rgba(162, 132, 217, 0.6),
    rgba(245, 198, 96, 0.5)
  );
  border: 1px solid rgba(139, 110, 199, 0.28);
  box-shadow:
    0 24px 60px rgba(95, 76, 146, 0.18),
    0 8px 22px rgba(72, 59, 102, 0.08);
  backdrop-filter: blur(12px);
}

.create-event-left {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
}

.create-event-overlay {
  max-width: 380px;
}

.create-event-overlay h1 {
  margin: 0 0 18px;
  font-size: 64px;
  line-height: 1;
  letter-spacing: -1.5px;
  color: #243047;
  font-weight: 700;
}

.create-event-overlay p {
  margin: 0;
  font-size: 17px;
  line-height: 1.65;
  color: #5b6475;
  max-width: 340px;
}

.create-event-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44px;
}

.create-event-form {
  width: 100%;
  max-width: 650px;
  background: rgba(255, 251, 244, 0.95);
  border-radius: 34px;
  padding: 38px 34px 30px;
  box-shadow:
    0 18px 42px rgba(72, 59, 102, 0.1),
    0 4px 12px rgba(255, 255, 255, 0.35) inset;
}

.create-event-form h2 {
  margin: 0 0 22px;
  font-size: 34px;
  line-height: 1;
  color: #6f54a8;
  font-weight: 800;
}

.create-event-form label {
  display: block;
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 700;
  color: #7a7694;
}

.create-event-form input,
.create-event-form select,
.create-event-form textarea {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 16px;
  border: 1px solid #ded9ea;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.82);
  padding: 15px 18px;
  font-size: 15px;
  color: #243047;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.create-event-form input::placeholder,
.create-event-form textarea::placeholder {
  color: #9b97ac;
}

.create-event-form input:focus,
.create-event-form select:focus,
.create-event-form textarea:focus {
  border-color: #b18ae0;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 0 0 4px rgba(139, 110, 199, 0.12),
    0 10px 20px rgba(139, 110, 199, 0.05);
}

.create-event-form textarea {
  min-height: 120px;
  resize: vertical;
}

.create-event-btn {
  width: 100%;
  border: none;
  border-radius: 999px;
  padding: 15px 20px;
  margin-top: 6px;
  background: linear-gradient(90deg, #8b6ec7 0%, #a686d2 52%, #d49a77 100%);
  color: white;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(139, 110, 199, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.create-event-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(139, 110, 199, 0.24);
}

.create-event-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.success-message,
.error-message {
  margin-top: 14px;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.success-message {
  color: #3c8a55;
}

.error-message {
  color: #c14b5a;
}

@media (max-width: 980px) {
  .create-event-shell {
    grid-template-columns: 1fr;
  }

  .create-event-left {
    min-height: 260px;
    padding: 48px 32px 20px;
  }

  .create-event-overlay h1 {
    font-size: 54px;
  }

  .create-event-right {
    padding: 20px 20px 28px;
  }
}

@media (max-width: 640px) {
  .create-event-page {
    padding: 24px 16px 40px;
  }

  .create-event-shell {
    border-radius: 24px;
    margin-top: 24px;
  }

  .create-event-left {
    padding: 36px 22px 12px;
  }

  .create-event-overlay h1 {
    font-size: 42px;
  }

  .create-event-overlay p {
    font-size: 16px;
  }

  .create-event-right {
    padding: 16px;
  }

  .create-event-form {
    border-radius: 24px;
    padding: 24px 20px;
  }

  .create-event-form h2 {
    font-size: 28px;
  }
}


</style>

