<template>
  <main class="dashboard-page">
    <div class="dashboard-container">
      <section class="dashboard-hero">
        <div class="hero-text">
          <p class="eyebrow">Attendee Dashboard</p>
          <h1>Welcome back, {{ userName }}</h1>
          <p class="dashboard-subtitle">
            Track your upcoming plans, saved events, reminders, and your own suggestions.
          </p>

          <div class="hero-actions">
            <router-link to="/" class="primary-btn">Browse Events</router-link>
            <router-link to="/saved-events" class="secondary-btn">View Saved Events</router-link>
          </div>
        </div>

        <div class="hero-image"></div>
      </section>

      <section class="dashboard-grid">
        <div class="dashboard-card">
          <span class="card-label">Upcoming Events</span>
          <p>{{ upcomingEvents.length }}</p>
          <small>From your saved events</small>
        </div>

        <div class="dashboard-card">
          <span class="card-label">Saved Events</span>
          <p>{{ savedEvents.length }}</p>
          <small>Events you bookmarked</small>
        </div>

        <div class="dashboard-card">
          <span class="card-label">My Suggestions</span>
          <p>{{ mySuggestions.length }}</p>
          <small>Ideas you submitted</small>
        </div>
      </section>

      <section class="dashboard-section">
        <div class="section-header">
          <h2>Upcoming Events</h2>
          <router-link to="/saved-events" class="section-link">Open saved</router-link>
        </div>

        <div class="preview-grid" v-if="upcomingEvents.length">
          <div
            class="preview-card"
            v-for="event in upcomingEvents.slice(0, 3)"
            :key="event._id"
          >
            <img
              v-if="event.image"
              :src="event.image"
              :alt="event.title"
              class="preview-image"
            />
            <div v-else class="preview-image fallback-image"></div>

            <div class="preview-content">
              <span class="badge">{{ event.category }}</span>
              <h3>{{ event.title }}</h3>
              <p>{{ event.location }} • {{ formatDate(event.date) }}</p>
            </div>
          </div>
        </div>

        <p v-else class="empty-state">No upcoming saved events yet.</p>
      </section>

      <section class="dashboard-section two-column">
        <div class="panel-card">
          <div class="section-header">
            <h2>Saved Events</h2>
            <router-link to="/saved-events" class="section-link">See all</router-link>
          </div>

          <div class="mini-list" v-if="savedEvents.length">
            <div
              class="mini-item"
              v-for="event in savedEvents.slice(0, 3)"
              :key="event._id"
            >
              <div>
                <h4>{{ event.title }}</h4>
                <p>{{ event.location }} • {{ event.category }}</p>
              </div>
              <span class="status-pill">Saved</span>
            </div>
          </div>

          <p v-else class="empty-state">No saved events yet.</p>
        </div>

        <div class="panel-card">
          <div class="section-header">
            <h2>Recent Activity</h2>
          </div>

          <ul class="activity-list" v-if="activityItems.length">
            <li v-for="item in activityItems" :key="item.id">
              <span class="activity-dot" :class="item.type"></span>
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.text }}</p>
              </div>
            </li>
          </ul>

          <p v-else class="empty-state">No recent activity yet.</p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const savedUser = localStorage.getItem('eventhiveUser')
const user = savedUser ? JSON.parse(savedUser) : null

const userName = computed(() => user?.name || 'Guest')

const savedEvents = ref([])
const reminders = ref([])
const mySuggestions = ref([])

function parseDateSafely(dateString) {
  if (!dateString) return null
  const d = new Date(dateString)
  return isNaN(d.getTime()) ? null : d
}

function formatDate(dateString) {
  const d = parseDateSafely(dateString)
  if (!d) return dateString || 'No date'
  return d.toLocaleDateString()
}

const upcomingEvents = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return [...savedEvents.value]
    .filter(event => {
      const d = parseDateSafely(event.date)
      return d && d >= today
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
})

const activityItems = computed(() => {
  const items = []

  savedEvents.value.slice(0, 2).forEach(event => {
    items.push({
      id: `saved-${event._id}`,
      type: 'saved',
      title: event.title,
      text: 'Event saved to your list'
    })
  })

  reminders.value.slice(0, 2).forEach(reminder => {
    items.push({
      id: `reminder-${reminder._id}`,
      type: reminder.read ? 'confirmed' : 'pending',
      title: reminder.eventTitle || 'Event reminder',
      text: reminder.message || 'Reminder received'
    })
  })

  mySuggestions.value.slice(0, 2).forEach(suggestion => {
    items.push({
      id: `suggestion-${suggestion._id}`,
      type: 'saved',
      title: suggestion.title,
      text: 'You submitted a suggestion'
    })
  })

  return items.slice(0, 5)
})

async function loadSavedEvents() {
  try {
    if (!user?.email) return

    const res = await fetch(
      `http://localhost:5001/api/saved-events?email=${encodeURIComponent(user.email)}`
    )
    const data = await res.json()

    if (!res.ok) {
      console.error(data.message || 'Failed to load saved events')
      savedEvents.value = []
      return
    }

    savedEvents.value = data
  } catch (error) {
    console.error('Saved events error:', error)
    savedEvents.value = []
  }
}

async function loadReminders() {
  try {
    if (!user?.email) return

    const res = await fetch(
      `http://localhost:5001/api/reminders?email=${encodeURIComponent(user.email)}`
    )
    const data = await res.json()

    if (!res.ok) {
      console.error(data.message || 'Failed to load reminders')
      reminders.value = []
      return
    }

    reminders.value = data
  } catch (error) {
    console.error('Reminders error:', error)
    reminders.value = []
  }
}

async function loadMySuggestions() {
  try {
    if (!user?.email) return

    const res = await fetch(
      `http://localhost:5001/api/suggestions?submittedBy=${encodeURIComponent(user.email)}`
    )
    const data = await res.json()

    if (!res.ok) {
      console.error(data.message || 'Failed to load suggestions')
      mySuggestions.value = []
      return
    }

    mySuggestions.value = data
  } catch (error) {
    console.error('Suggestions error:', error)
    mySuggestions.value = []
  }
}

onMounted(async () => {
  await Promise.all([
    loadSavedEvents(),
    loadReminders(),
    loadMySuggestions()
  ])
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 48px 24px 72px;
}

.dashboard-container {
  max-width: 1180px;
  margin: 0 auto;
}

.dashboard-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: center;
  margin-bottom: 34px;
}

.hero-text {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 30px;
  padding: 34px;
  box-shadow: 0 16px 36px rgba(72, 59, 102, 0.06);
}

.eyebrow {
  font-size: 14px;
  font-weight: 700;
  color: #8b6ec7;
  letter-spacing: 0.4px;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.hero-text h1 {
  font-size: 58px;
  line-height: 1.02;
  letter-spacing: -1.5px;
  color: #243047;
  margin: 0 0 14px;
}

.dashboard-subtitle {
  font-size: 20px;
  color: #5b6475;
  margin: 0 0 22px;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  padding: 14px 22px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease;
}

.primary-btn {
  background: linear-gradient(135deg, #8b6ec7 0%, #a686d2 55%, #d49a77 100%);
  color: white;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
}

.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-2px);
}

.hero-image {
  min-height: 320px;
  border-radius: 30px;
  background:
    linear-gradient(rgba(139, 110, 199, 0.18), rgba(247, 236, 141, 0.08)),
    url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80')
    center/cover;
  box-shadow: 0 18px 42px rgba(72, 59, 102, 0.08);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-bottom: 28px;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.06);
}

.card-label {
  display: block;
  font-size: 17px;
  font-weight: 700;
  color: #243047;
  margin-bottom: 10px;
}

.dashboard-card p {
  font-size: 42px;
  font-weight: 800;
  color: #7b4dd8;
  margin: 0 0 8px;
}

.dashboard-card small {
  color: #6b7280;
  font-size: 15px;
}

.dashboard-section {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 30px;
  padding: 26px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.06);
  margin-bottom: 26px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  gap: 12px;
}

.section-header h2 {
  font-size: 32px;
  color: #243047;
  margin: 0;
}

.section-link {
  color: #8b6ec7;
  font-weight: 700;
  text-decoration: none;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.preview-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(166, 134, 210, 0.12);
  box-shadow: 0 10px 24px rgba(72, 59, 102, 0.05);
}

.preview-image {
  width: 100%;
  height: 170px;
  object-fit: cover;
  display: block;
}

.fallback-image {
  background: linear-gradient(135deg, #d9c8f4, #f4d7c8);
}

.preview-content {
  padding: 18px;
}

.preview-content h3 {
  font-size: 24px;
  margin: 10px 0 8px;
  color: #243047;
}

.preview-content p {
  margin: 0;
  color: #5b6475;
  font-size: 16px;
}

.badge {
  display: inline-block;
  background: rgba(139, 110, 199, 0.12);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.panel-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 30px;
  padding: 26px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.06);
}

.mini-list {
  display: grid;
  gap: 16px;
}

.mini-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: white;
  border-radius: 20px;
  padding: 16px 18px;
  border: 1px solid rgba(166, 134, 210, 0.12);
}

.mini-item h4 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #243047;
}

.mini-item p {
  margin: 0;
  color: #5b6475;
}

.status-pill {
  background: #f3e8ff;
  color: #7b4dd8;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
}

.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 18px;
}

.activity-list li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: white;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(166, 134, 210, 0.12);
}

.activity-list strong {
  display: block;
  color: #243047;
  margin-bottom: 4px;
}

.activity-list p {
  margin: 0;
  color: #5b6475;
}

.activity-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  margin-top: 8px;
  flex-shrink: 0;
}

.activity-dot.confirmed {
  background: #22c55e;
}

.activity-dot.saved {
  background: #8b6ec7;
}

.activity-dot.pending {
  background: #f59e0b;
}

.empty-state {
  color: #6b7280;
  font-size: 16px;
  margin: 8px 0 0;
}

@media (max-width: 980px) {
  .dashboard-hero,
  .preview-grid,
  .two-column,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .hero-text h1 {
    font-size: 42px;
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding-left: 16px;
    padding-right: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>