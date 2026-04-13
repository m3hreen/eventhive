<template>
  <main class="my-events-page">
    <div class="my-events-container">
      <div class="my-events-header">
        <h1>My Events</h1>
        <router-link to="/create-event" class="create-new-btn">Create New Event</router-link>
      </div>

      <p class="my-events-subtitle">A curated space for the experiences you’ve created and shared.</p>

      <div v-if="loading" class="status-text">Loading events...</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-else-if="events.length === 0" class="status-text">No events found yet.</div>

      <div v-else class="my-events-grid">
        <div class="my-event-card" v-for="event in events" :key="event._id">
          <img
            v-if="event.image"
            :src="event.image"
            :alt="event.title"
            class="event-image"
          />

          <div class="event-card-top">
            <div class="event-card-main">
              <h3>{{ event.title }}</h3>
              <span class="category-badge">{{ event.category }}</span>
            </div>

            <div class="date-pill">
              {{ event.date }}
            </div>
          </div>

          <div class="event-meta">
            <p><strong>Location:</strong> {{ event.location }}</p>
          </div>

          <p class="event-description">{{ event.description }}</p>

          <div class="event-card-actions">
            <router-link :to="`/edit-event/${event._id}`" class="edit-btn">Edit</router-link>
            <router-link :to="`/event/${event._id}`" class="details-btn">View Details</router-link>
            <router-link :to="`/event/${event._id}/guests`" class="guest-list-btn">View Guest List</router-link>
            <button class="delete-btn" @click="deleteEvent(event._id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const events = ref([])
const loading = ref(true)
const errorMessage = ref('')

async function fetchEvents() {
  try {
    loading.value = true
    errorMessage.value = ''

    const savedUser = localStorage.getItem('eventhiveUser')
    const user = savedUser ? JSON.parse(savedUser) : null

    if (!user?.email) {
      errorMessage.value = 'You must be logged in to view your events.'
      events.value = []
      return
    }

    const response = await fetch(
      `http://localhost:5001/api/events?createdBy=${encodeURIComponent(user.email)}`
    )

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to fetch events.'
      events.value = []
      return
    }

    events.value = data
  } catch (error) {
    console.error('Fetch events error:', error)
    errorMessage.value = 'Could not connect to the server.'
    events.value = []
  } finally {
    loading.value = false
  }
}

async function deleteEvent(id) {
  const confirmed = window.confirm('Are you sure you want to delete this event?')
  if (!confirmed) return

  try {
    const response = await fetch(`http://localhost:5001/api/events/${id}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to delete event.'
      return
    }

    events.value = events.value.filter(event => event._id !== id)
  } catch (error) {
    console.error('Delete event error:', error)
    errorMessage.value = 'Could not connect to the server.'
  }
}

onMounted(() => {
  fetchEvents()
})
</script>

<style scoped>
.my-events-page {
  min-height: 100vh;
  padding: 48px 24px 72px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
}

.my-events-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/hexagon-background.jpg') center/cover no-repeat;
  opacity: 0.5;
  pointer-events: none;
}

.my-events-container {
  position: relative;
  z-index: 1;
}

.my-events-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.my-events-header h1 {
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -1.8px;
  line-height: 1.02;
  color: #243047;
  margin: 0;
}

.my-events-subtitle {
  font-size: 20px;
  color: #5b6475;
  margin-bottom: 34px;
  max-width: 620px;
  line-height: 1.35;
}

.create-new-btn {
  background: linear-gradient(135deg, #8b6ec7 0%, #a686d2 55%, #d49a77 100%);
  color: white;
  text-decoration: none;
  padding: 15px 28px;
  border-radius: 18px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(139, 110, 199, 0.16);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.create-new-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(139, 110, 199, 0.22);
}

.status-text {
  font-size: 18px;
  color: #5b6475;
  margin-top: 20px;
}

.error-message {
  font-size: 18px;
  color: #8d5b46;
  background: #fff3ef;
  border: 1px solid #f0d4ca;
  padding: 14px 16px;
  border-radius: 14px;
  margin-top: 20px;
  display: inline-block;
}

.my-events-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 26px;
}

.my-event-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  padding: 24px 26px 22px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.07);
  position: relative;
  overflow: hidden;
}

.my-event-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #8b6ec7 0%, #f7ec8d 55%, #f6a93a 100%);
}

.event-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 20px;
  margin-bottom: 18px;
  display: block;
}

.event-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 16px;
}

.event-card-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.my-event-card h3 {
  font-size: 30px;
  font-weight: 800;
  color: #243047;
  margin: 6px 0 0;
  letter-spacing: -0.6px;
}

.category-badge {
  display: inline-block;
  width: fit-content;
  background: rgba(139, 110, 199, 0.12);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.date-pill {
  background: linear-gradient(135deg, #f7ec8d, #f8dfb3);
  color: #6c5a22;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.event-meta p {
  font-size: 18px;
  color: #3f4a5e;
  margin: 0 0 10px;
}

.event-meta strong {
  color: #2e3750;
}

.event-description {
  margin: 8px 0 18px;
  color: #5b6475;
  font-size: 18px;
  line-height: 1.6;
  max-width: 760px;
}

.event-card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.edit-btn,
.details-btn,
.guest-list-btn,
.delete-btn {
  border: none;
  border-radius: 16px;
  padding: 11px 20px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.edit-btn {
  background: linear-gradient(135deg, #8b6ec7, #a686d2);
  color: white;
  box-shadow: 0 8px 18px rgba(139, 110, 199, 0.16);
}

.details-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  box-shadow: 0 8px 18px rgba(139, 110, 199, 0.08);
}

.guest-list-btn {
  background: linear-gradient(135deg, #f7ec8d, #f8dfb3);
  color: #6c5a22;
  box-shadow: 0 8px 18px rgba(247, 236, 141, 0.16);
}

.delete-btn {
  background: linear-gradient(135deg, #b78367, #c99779);
  color: white;
  box-shadow: 0 8px 18px rgba(141, 91, 70, 0.12);
}

.edit-btn:hover,
.details-btn:hover,
.guest-list-btn:hover,
.delete-btn:hover {
  transform: translateY(-1px);
  opacity: 0.96;
}

@media (max-width: 768px) {
  .my-events-page {
    padding: 28px 16px 52px;
  }

  .my-events-header {
    flex-direction: column;
    gap: 16px;
  }

  .my-events-header h1 {
    font-size: 46px;
  }

  .my-events-subtitle {
    font-size: 18px;
  }

  .my-event-card {
    padding: 22px 20px 20px;
  }

  .event-card-top {
    flex-direction: column;
    gap: 12px;
  }

  .my-event-card h3 {
    font-size: 26px;
  }

  .event-description,
  .event-meta p {
    font-size: 17px;
  }
}
</style>