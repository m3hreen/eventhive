<template>
  <main class="saved-page">
    <div class="saved-container">
      <div class="saved-header">
        <div>
          <p class="eyebrow">Saved Events</p>
          <h1>Your saved picks</h1>
          <p class="subtitle">
            Keep track of events you want to come back to later.
          </p>
        </div>

        <router-link :to="dashboardLink" class="back-btn">
          Back to Dashboard
        </router-link>
      </div>

      <div v-if="events.length" class="events-grid">
        <div
          class="event-card"
          v-for="event in events"
          :key="event._id"
        >
          <img
            v-if="event.image"
            :src="event.image"
            :alt="event.title"
            class="event-image"
          />
          <div v-else class="event-image fallback-image"></div>

          <div class="event-content">
            <span class="category-badge">{{ event.category }}</span>
            <h3>{{ event.title }}</h3>

            <p class="event-meta">
              <strong>Date:</strong> {{ formatDate(event.date) }}
            </p>
            <p class="event-meta">
              <strong>Location:</strong> {{ event.location || 'TBA' }}
            </p>

            <p class="event-description">
              {{ event.description }}
            </p>

            <div class="card-actions">
              <router-link
                :to="`/event/${event._id}`"
                class="view-btn"
              >
                View Event
              </router-link>

              <button
                class="remove-btn"
                @click="removeSavedEvent(event._id)"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-shell">
        <div class="empty-card">
          <h2>No saved events yet</h2>
          <p>
            Start exploring events and save the ones you want to revisit.
          </p>
          <router-link to="/" class="view-btn">
            Browse Events
          </router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const events = ref([])

const currentUser = ref(null)

const dashboardLink = computed(() => {
  if (currentUser.value?.role === 'organizer') return '/organizer-dashboard'
  return '/attendee-dashboard'
})

function getCurrentUser() {
  const savedUser = localStorage.getItem('eventhiveUser')
  return savedUser ? JSON.parse(savedUser) : null
}

function formatDate(value) {
  if (!value) return 'No date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

async function loadSaved() {
  try {
    const user = getCurrentUser()

    if (!user?.email) {
      events.value = []
      return
    }

    const res = await fetch(
      `http://localhost:5001/api/saved-events?email=${encodeURIComponent(user.email)}`
    )

    const data = await res.json()

    if (!res.ok) {
      console.error(data.message || 'Failed to load saved events.')
      events.value = []
      return
    }

    events.value = data
  } catch (e) {
    console.error('Load saved events error:', e)
    events.value = []
  }
}

async function removeSavedEvent(eventId) {
  try {
    const user = getCurrentUser()

    if (!user?.email) return

    const res = await fetch(
      `http://localhost:5001/api/events/${eventId}/save`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      }
    )

    const data = await res.json()

    if (!res.ok) {
      alert(data.message || 'Could not remove saved event.')
      return
    }

    events.value = events.value.filter(event => event._id !== eventId)
  } catch (e) {
    console.error('Remove saved event error:', e)
    alert('There was a connection error.')
  }
}

onMounted(() => {
  currentUser.value = getCurrentUser()
  loadSaved()
})
</script>

<style scoped>
.saved-page {
  min-height: 100vh;
  padding: 48px 24px 72px;
}

.saved-container {
  max-width: 1180px;
  margin: 0 auto;
}

.saved-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}

.eyebrow {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #8b6ec7;
  margin: 0 0 10px;
}


h1 {
  font-size: 64px;
  line-height: 0.95;
  letter-spacing: -2px;
  font-weight: 850;
  color: #243047;
  margin: 0 0 14px;
}

.subtitle {
  font-size: 21px;
  line-height: 1.6;
  color: #5b6475;
  margin: 0;
  max-width: 620px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.82);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  border-radius: 18px;
  padding: 14px 22px;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(72, 59, 102, 0.06);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 22px;
}

.event-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(72, 59, 102, 0.06);
}

.event-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.fallback-image {
  background: linear-gradient(135deg, #d9c8f4, #f4d7c8);
}

.event-content {
  padding: 20px;
}

.category-badge {
  display: inline-block;
  background: rgba(139, 110, 199, 0.12);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 12px;
}

.event-card h3 {
  font-size: 28px;
  color: #243047;
  margin: 0 0 12px;
}

.event-meta {
  font-size: 16px;
  color: #4a5568;
  margin: 0 0 8px;
}

.event-description {
  font-size: 16px;
  line-height: 1.6;
  color: #5b6475;
  margin: 14px 0 18px;
}

.card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.view-btn,
.remove-btn {
  border: none;
  border-radius: 16px;
  padding: 11px 18px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  text-decoration: none;
}

.view-btn {
  background: linear-gradient(135deg, #8b6ec7, #a686d2);
  color: white;
}

.remove-btn {
  background: rgba(255, 255, 255, 0.92);
  color: #8b5b46;
  border: 1px solid #e7cfc5;
}

.empty-shell {
  display: flex;
  justify-content: center;
  margin-top: 34px;
}

.empty-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  padding: 32px;
  text-align: center;
  max-width: 520px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.06);
}

.empty-card h2 {
  margin: 0 0 12px;
  color: #243047;
  font-size: 32px;
}

.empty-card p {
  margin: 0 0 20px;
  color: #5b6475;
  font-size: 17px;
}

@media (max-width: 768px) {
  .saved-header {
    flex-direction: column;
  }

  h1 {
    font-size: 42px;
  }
}
</style>