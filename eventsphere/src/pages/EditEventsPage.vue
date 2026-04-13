<template>
  <main class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <h1>Edit Event</h1>
        <p>Update your event details below.</p>
      </div>

      <div class="auth-right">
        <EventForm
          v-if="loaded"
          :initialData="event"
          :isEdit="true"
          @submit="updateEvent"
        />
        <p v-else>Loading event...</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EventForm from '../components/EventForm.vue'

const route = useRoute()
const router = useRouter()

const event = ref({})
const loaded = ref(false)

onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:3001/api/events/${route.params.id}`)
    event.value = await res.json()
    loaded.value = true
  } catch (error) {
    console.error('Error fetching event:', error)
  }
})

async function updateEvent(formData) {
  try {
    const res = await fetch(`http://localhost:3001/api/events/${route.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (!res.ok) {
      throw new Error('Failed to update event')
    }

    router.push('/events')
  } catch (error) {
    console.error('Error updating event:', error)
  }
}
</script>