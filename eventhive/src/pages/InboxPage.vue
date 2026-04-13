<template>
    <main class="inbox-page">
      <div class="inbox-container">
        <div class="inbox-header">
          <div>
            <p class="eyebrow">Attendee View</p>
            <h1>Inbox</h1>
            <p class="inbox-subtitle">Your event reminders and notifications.</p>
          </div>
  
          <router-link to="/attendee-dashboard" class="back-btn">Back to Dashboard</router-link>
        </div>
  
        <div v-if="loading" class="status-text">Loading reminders...</div>
        <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-else-if="reminders.length === 0" class="status-text">No reminders yet.</div>
  
        <div v-else class="inbox-list">
          <div class="inbox-card" v-for="reminder in reminders" :key="reminder._id">
            <div class="inbox-card-top">
              <div>
                <h3>{{ reminder.eventTitle }}</h3>
                <p class="inbox-date">{{ formatDate(reminder.sentAt) }}</p>
              </div>
  
              <span class="read-pill" :class="{ unread: !reminder.read }">
                {{ reminder.read ? 'Read' : 'Unread' }}
              </span>
            </div>
  
            <p class="inbox-message">{{ reminder.message }}</p>
  
            <div class="inbox-actions">
              <router-link :to="`/event/${reminder.eventId}`" class="details-btn">View Event</router-link>
              <button
                v-if="!reminder.read"
                class="mark-read-btn"
                @click="markAsRead(reminder._id)"
              >
                Mark as Read
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  
  const reminders = ref([])
  const loading = ref(true)
  const errorMessage = ref('')
  
  function formatDate(value) {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString()
  }
  
  async function fetchReminders() {
    try {
      loading.value = true
      errorMessage.value = ''
  
      const savedUser = localStorage.getItem('eventhiveUser')
      const user = savedUser ? JSON.parse(savedUser) : null
  
      if (!user?.email) {
        errorMessage.value = 'You must be logged in to view your inbox.'
        reminders.value = []
        return
      }
  
      const response = await fetch(
        `http://localhost:5001/api/reminders?email=${encodeURIComponent(user.email)}`
      )
  
      const data = await response.json()
  
      if (!response.ok) {
        errorMessage.value = data.message || 'Failed to fetch reminders.'
        reminders.value = []
        return
      }
  
      reminders.value = data
    } catch (error) {
      console.error('Fetch reminders error:', error)
      errorMessage.value = 'Could not connect to the server.'
      reminders.value = []
    } finally {
      loading.value = false
    }
  }
  
  async function markAsRead(id) {
    try {
      const response = await fetch(`http://localhost:5001/api/reminders/${id}/read`, {
        method: 'PATCH'
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        errorMessage.value = data.message || 'Failed to mark reminder as read.'
        return
      }
  
      reminders.value = reminders.value.map(reminder =>
        reminder._id === id ? { ...reminder, read: true } : reminder
      )
    } catch (error) {
      console.error('Mark reminder read error:', error)
      errorMessage.value = 'Could not connect to the server.'
    }
  }
  
  onMounted(() => {
    fetchReminders()
  })
  </script>
  
  <style scoped>
  .inbox-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
    padding: 48px 24px 72px;
  }
  
  .inbox-container {
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .inbox-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 28px;
  }
  
  .eyebrow {
    font-size: 14px;
    font-weight: 700;
    color: #8b6ec7;
    letter-spacing: 0.4px;
    margin: 0 0 8px;
    text-transform: uppercase;
  }
  
  .inbox-header h1 {
    font-size: 56px;
    line-height: 1.02;
    letter-spacing: -1.5px;
    color: #243047;
    margin: 0 0 12px;
  }
  
  .inbox-subtitle {
    font-size: 20px;
    color: #5b6475;
    margin: 0;
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
  
  .inbox-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  
  .inbox-card {
    background: rgba(255, 255, 255, 0.84);
    border: 1px solid rgba(166, 134, 210, 0.14);
    border-radius: 26px;
    padding: 22px;
    box-shadow: 0 12px 28px rgba(72, 59, 102, 0.06);
  }
  
  .inbox-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }
  
  .inbox-card h3 {
    font-size: 28px;
    color: #243047;
    margin: 0 0 6px;
  }
  
  .inbox-date {
    font-size: 14px;
    color: #8b5b46;
    margin: 0;
  }
  
  .inbox-message {
    font-size: 17px;
    line-height: 1.6;
    color: #4a5568;
    margin-bottom: 18px;
  }
  
  .read-pill {
    display: inline-block;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(34, 197, 94, 0.14);
    color: #166534;
    font-size: 13px;
    font-weight: 700;
  }
  
  .read-pill.unread {
    background: rgba(234, 179, 8, 0.18);
    color: #854d0e;
  }
  
  .inbox-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  
  .details-btn,
  .mark-read-btn {
    border: none;
    border-radius: 16px;
    padding: 11px 18px;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    text-decoration: none;
  }
  
  .details-btn {
    background: linear-gradient(135deg, #8b6ec7, #a686d2);
    color: white;
  }
  
  .mark-read-btn {
    background: rgba(255, 255, 255, 0.92);
    color: #6f54a8;
    border: 1px solid rgba(139, 110, 199, 0.18);
  }
  
  .status-text {
    font-size: 18px;
    color: #5b6475;
  }
  
  .error-message {
    font-size: 18px;
    color: #8d5b46;
    background: #fff3ef;
    border: 1px solid #f0d4ca;
    padding: 14px 16px;
    border-radius: 14px;
    display: inline-block;
  }
  
  @media (max-width: 768px) {
    .inbox-header {
      flex-direction: column;
    }
  
    .inbox-header h1 {
      font-size: 42px;
    }
  
    .inbox-card-top {
      flex-direction: column;
    }
  }
  </style>