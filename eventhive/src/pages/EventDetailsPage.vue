<template>
    <main class="event-details-page">
      <div class="event-details-container" v-if="event">
        <div class="event-image-wrap" v-if="event.image">
          <img :src="event.image" :alt="event.title" class="event-image" />
        </div>
  
        <div class="event-header">
          <div>
            <h1>{{ event.title }}</h1>
            <span class="category-badge">{{ event.category }}</span>
          </div>
          <div class="date-pill">{{ event.date }}</div>
        </div>
  
        <p class="event-location"><strong>Location:</strong> {{ event.location }}</p>
        <p class="event-description">{{ event.description }}</p>
        <div class="save-row">
  <button class="save-btn" @click="toggleSave">
    {{ isSaved ? '★ Saved' : '☆ Save Event' }}
  </button>
</div>
  
        <div class="rsvp-card">
          <h2>RSVP to this event</h2>
  
          <input v-model="rsvpForm.name" type="text" placeholder="Your name" />
          <input v-model="rsvpForm.email" type="email" placeholder="Your email" />
  
          <select v-model="rsvpForm.status">
            <option value="">Select RSVP status</option>
            <option>Attending</option>
            <option>Maybe</option>
            <option>Declined</option>
          </select>
  
          <button class="rsvp-btn" @click="submitRsvp" :disabled="loading">
            {{ loading ? 'Submitting...' : 'Submit RSVP' }}
          </button>
  
          <p v-if="message" class="success-message">{{ message }}</p>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
      </div>
  
      <div v-else-if="pageLoading" class="status-text">Loading event...</div>
      <div v-else class="error-message">{{ errorMessage || 'Event not found.' }}</div>
    </main>
  </template>
  
  <script setup>
  import { onMounted, reactive, ref } from 'vue'
  import { useRoute } from 'vue-router'
  const isSaved = ref(false)
  const route = useRoute()
  
  const event = ref(null)
  const pageLoading = ref(true)
  const loading = ref(false)
  const message = ref('')
  const errorMessage = ref('')
  
  const rsvpForm = reactive({
    name: '',
    email: '',
    status: ''
  })
  async function toggleSave() {
  try {
    const savedUser = localStorage.getItem('eventhiveUser')
    const user = savedUser ? JSON.parse(savedUser) : null

    if (!user?.email) return

    const method = isSaved.value ? 'DELETE' : 'POST'

    await fetch(
      `http://localhost:5001/api/events/${event.value._id}/save`,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      }
    )

    isSaved.value = !isSaved.value
  } catch (e) {
    console.error(e)
  }
}
  async function checkSaved() {
  try {
    const savedUser = localStorage.getItem('eventhiveUser')
    const user = savedUser ? JSON.parse(savedUser) : null

    if (!user?.email) return

    const res = await fetch(
      `http://localhost:5001/api/saved-events?email=${user.email}`
    )

    const data = await res.json()

    isSaved.value = data.some(e => e.eventId === event.value._id)
  } catch (e) {
    console.error(e)
  }
}
  async function fetchEvent() {
    try {
      pageLoading.value = true
      errorMessage.value = ''
  
      const response = await fetch(`http://localhost:5001/api/events/${route.params.id}`)
      const data = await response.json()
  
      if (!response.ok) {
        errorMessage.value = data.message || 'Failed to load event.'
        return
      }
  
      event.value = data
  
      const savedUser = localStorage.getItem('eventhiveUser')
      const user = savedUser ? JSON.parse(savedUser) : null
  
      if (user) {
        rsvpForm.name = user.name || ''
        rsvpForm.email = user.email || ''
      }
    } catch (error) {
      console.error('Fetch event error:', error)
      errorMessage.value = 'Could not connect to the server.'
    } finally {
      pageLoading.value = false
    }
    await checkSaved()
  }
  
  async function submitRsvp() {
    message.value = ''
    errorMessage.value = ''
  
    if (!rsvpForm.name || !rsvpForm.email || !rsvpForm.status) {
      errorMessage.value = 'Please complete all RSVP fields.'
      return
    }
  
    try {
      loading.value = true
  
      const response = await fetch(`http://localhost:5001/api/events/${route.params.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpForm)
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        errorMessage.value = data.message || 'Failed to submit RSVP.'
        return
      }
  
      message.value = data.message || 'RSVP submitted successfully.'
    } catch (error) {
      console.error('Submit RSVP error:', error)
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
  .event-details-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
    padding: 48px 24px 72px;
  }
  
  .event-details-container {
    max-width: 960px;
    margin: 0 auto;
  }
  
  .event-image-wrap {
    margin-bottom: 24px;
  }
  
  .event-image {
    width: 100%;
    height: 360px;
    object-fit: cover;
    border-radius: 28px;
    display: block;
    box-shadow: 0 18px 42px rgba(72, 59, 102, 0.1);
  }
  
  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 18px;
  }
  
  .event-header h1 {
    font-size: 52px;
    line-height: 1.02;
    letter-spacing: -1.5px;
    color: #243047;
    margin: 0 0 12px;
  }
  
  .category-badge {
    display: inline-block;
    background: rgba(139, 110, 199, 0.12);
    color: #6f54a8;
    border: 1px solid rgba(139, 110, 199, 0.18);
    padding: 8px 14px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 700;
  }
  
  .date-pill {
    background: linear-gradient(135deg, #f7ec8d, #f8dfb3);
    color: #6c5a22;
    padding: 10px 16px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 800;
    white-space: nowrap;
  }
  
  .event-location,
  .event-description {
    font-size: 18px;
    line-height: 1.6;
    color: #4a5568;
    margin-bottom: 16px;
  }
  
  .rsvp-card {
    margin-top: 30px;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(166, 134, 210, 0.14);
    border-radius: 28px;
    padding: 26px;
    box-shadow: 0 14px 34px rgba(72, 59, 102, 0.07);
  }
  
  .rsvp-card h2 {
    margin: 0 0 18px;
    font-size: 28px;
    color: #243047;
  }
  
  .rsvp-card input,
  .rsvp-card select {
    width: 100%;
    margin-bottom: 14px;
    border: 1px solid rgba(139, 110, 199, 0.14);
    background: #fffdfb;
    border-radius: 16px;
    padding: 14px 16px;
    font-size: 15px;
    color: #243047;
    outline: none;
  }
  
  .rsvp-btn {
    background: linear-gradient(135deg, #8b6ec7 0%, #a686d2 55%, #d49a77 100%);
    color: white;
    border: none;
    border-radius: 18px;
    padding: 14px 24px;
    font-weight: 700;
    cursor: pointer;
  }
  
  .success-message {
    margin-top: 12px;
    color: #166534;
  }
  
  .error-message {
    margin-top: 12px;
    color: #8d5b46;
  }
  
  .status-text {
    max-width: 960px;
    margin: 0 auto;
    color: #5b6475;
    font-size: 18px;
  }
  .save-row {
  margin-top: 14px;
}

.save-btn {
  background: #fff;
  border: 2px solid #8b6ec7;
  color: #8b6ec7;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

.save-btn:hover {
  background: #8b6ec7;
  color: white;
}
  
  @media (max-width: 768px) {
    .event-header {
      flex-direction: column;
    }
  
    .event-header h1 {
      font-size: 40px;
    }
  
    .event-image {
      height: 260px;
    }
  }
  </style>