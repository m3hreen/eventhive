<template>
  <main class="create-event-page">
    <div class="create-event-shell">
      <div class="create-event-left">
        <div class="create-event-overlay">
          <h1>Create an Event</h1>
          <p>Bring your idea to life and share it with the EventHive community.</p>
        </div>
      </div>

      <div class="create-event-right">
        <form class="create-event-form" @submit.prevent="handleSubmit">
          <h2>Create Event</h2>

          <label>Title</label>
          <input v-model="form.title" type="text" placeholder="Enter event title" />

          <label>Date</label>
          <input v-model="form.date" type="date" />

          <label>Location</label>
          <input v-model="form.location" type="text" placeholder="Enter location" />

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
          <textarea
            v-model="form.description"
            rows="5"
            placeholder="Write a short event description"
          ></textarea>

          <label>Event Image URL</label>
          <input
            v-model="form.image"
            type="text"
            placeholder="Paste an image URL"
          />

          <button type="submit" class="create-event-btn" :disabled="loading">
            {{ loading ? 'Creating...' : 'Create Event' }}
          </button>

          <p v-if="message" class="success-message">{{ message }}</p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
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
  title: '',
  date: '',
  location: '',
  category: '',
  description: '',
  image: ''
})

const loading = ref(false)
const message = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  message.value = ''
  errorMessage.value = ''

  if (!form.title || !form.date || !form.location || !form.category || !form.description) {
    errorMessage.value = 'Please complete all fields.'
    return
  }

  try {
    loading.value = true

    const savedUser = localStorage.getItem('eventhiveUser')
    const user = savedUser ? JSON.parse(savedUser) : null

    const response = await fetch('http://localhost:5001/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        createdBy: user?.email || null
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Could not create event.'
      return
    }

    message.value = 'Event created successfully.'

    form.title = ''
    form.date = ''
    form.location = ''
    form.category = ''
    form.description = ''
    form.image = ''

    setTimeout(() => {
      router.push('/my-events')
    }, 1200)
  } catch (error) {
    console.error('Create event error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-event-page {
  min-height: 100vh;
  color: #243047;
  position: relative;
  overflow: hidden;

  /* keep your soft base color */
  background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
}

.create-event-page::before {
  content: '';
  position: absolute;
  inset: 0;

  background: url('/hexagon-background.jpg') center/cover no-repeat;

  opacity: 0.50;
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
</style>