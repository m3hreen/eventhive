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