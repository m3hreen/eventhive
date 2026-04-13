<template>
  <main class="featured-section">
    <h2>My Events</h2>

    <div v-if="events.length" class="event-grid">
      <div class="event-card" v-for="event in events" :key="event.id">
        <div class="event-card-body">
          <h3>{{ event.title }}</h3>
          <p>{{ event.date }}</p>
          <p>{{ event.location }}</p>
          <p>{{ event.category }}</p>
          <p>{{ event.description }}</p>

          <router-link
            :to="`/events/edit/${event.id}`"
            class="primary-btn small-btn"
          >
            Edit
          </router-link>
        </div>
      </div>
    </div>

    <p v-else>No events found.</p>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const events = ref([])

async function loadEvents() {
  try {
    const res = await fetch('http://localhost:3001/api/events')
    events.value = await res.json()
  } catch (error) {
    console.error('Error loading events:', error)
  }
}

onMounted(loadEvents)
</script>