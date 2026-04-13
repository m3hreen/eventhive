<template>
  <main class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <h1>Create an Event</h1>
        <p>Fill in the details below to publish your event.</p>
      </div>

      <div class="auth-right">
        <EventForm @submit="createEvent" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { useRouter } from 'vue-router'
import EventForm from '../components/EventForm.vue'

const router = useRouter()

async function createEvent(formData) {
  try {
    const res = await fetch('http://localhost:3001/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (!res.ok) {
      throw new Error('Failed to create event')
    }

    router.push('/events')
  } catch (error) {
    console.error('Error creating event:', error)
  }
}
</script>