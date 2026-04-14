<template>
  <main class="inbox-page">
    <div class="inbox-container">
      <div class="inbox-header">
        <div>
          <p class="eyebrow">Attendee View</p>
          <h1>Inbox</h1>
          <p class="inbox-subtitle">Your reminders, connection requests, and chats.</p>
        </div>

        <router-link :to="dashboardLink" class="back-btn">Back to Dashboard</router-link>
      </div>

      <div class="inbox-section">
        <div class="section-top">
          <h2>Connection Requests</h2>
          <span class="count-pill">{{ connectionRequests.length }}</span>
        </div>

        <div v-if="loading" class="status-text">Loading inbox...</div>
        <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
        <div v-else-if="connectionRequests.length === 0" class="status-text">No connection requests yet.</div>

        <div v-else class="inbox-list">
          <div class="inbox-card" v-for="request in connectionRequests" :key="request._id">
            <div class="inbox-card-top">
              <div>
                <h3>{{ request.eventTitle }}</h3>
                <p class="inbox-date">{{ formatDate(request.createdAt) }}</p>
              </div>

              <span class="read-pill" :class="statusClass(request.status)">
                {{ request.status }}
              </span>
            </div>

            <p class="inbox-message">
              <strong>{{ request.fromEmail === currentUser?.email ? request.toName : request.fromName }}</strong>
              wants to connect about this event.
            </p>

            <p v-if="request.introMessage" class="intro-message">"{{ request.introMessage }}"</p>

            <div class="inbox-actions">
              <router-link :to="`/event/${request.eventId}`" class="details-btn">View Event</router-link>

              <template v-if="request.toEmail === currentUser?.email && request.status === 'pending'">
                <button class="accept-btn" @click="respondToRequest(request._id, 'accepted')">
                  Accept
                </button>
                <button class="decline-btn" @click="respondToRequest(request._id, 'declined')">
                  Decline
                </button>
              </template>

              <button
                v-if="request.status === 'pending' && !request.read"
                class="mark-read-btn"
                @click="markRequestAsRead(request._id)"
              >
                Mark as Read
              </button>

              <button
                v-if="request.status === 'accepted'"
                class="mark-read-btn"
                @click="toggleChat(request._id)"
              >
                {{ openChats[request._id] ? 'Hide Chat' : 'Open Chat' }}
              </button>
            </div>

            <div v-if="openChats[request._id]" class="chat-box">
              <div v-if="chatLoadingId === request._id" class="chat-status">
                Loading conversation...
              </div>

              <div
                v-else-if="!(chatMessages[request._id] || []).length"
                class="chat-status"
              >
                No messages yet. Start the conversation.
              </div>

              <div
                v-for="msg in (chatMessages[request._id] || [])"
                :key="msg._id"
                class="chat-message"
                :class="{ mine: msg.senderEmail === currentUser?.email }"
              >
                <strong>{{ msg.senderEmail === currentUser?.email ? 'You' : msg.senderName }}</strong>
                <p>{{ msg.message }}</p>
                <small>{{ formatDate(msg.createdAt) }}</small>
              </div>

              <div class="chat-input-row">
                <input
                  v-model="chatInputs[request._id]"
                  type="text"
                  placeholder="Write a reply..."
                  class="chat-input"
                  @keyup.enter="sendChatMessage(request._id)"
                />
                <button
                  class="accept-btn"
                  @click="sendChatMessage(request._id)"
                  :disabled="sendingChatId === request._id"
                >
                  {{ sendingChatId === request._id ? 'Sending...' : 'Send' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="inbox-section">
        <div class="section-top">
          <h2>Event Reminders</h2>
          <span class="count-pill">{{ reminders.length }}</span>
        </div>

        <div v-if="loading" class="status-text">Loading reminders...</div>
        <div v-else-if="!errorMessage && reminders.length === 0" class="status-text">No reminders yet.</div>

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
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

const reminders = ref([])
const connectionRequests = ref([])
const loading = ref(true)
const errorMessage = ref('')
const currentUser = ref(null)

const openChats = ref({})
const chatMessages = ref({})
const chatInputs = ref({})
const chatLoadingId = ref('')
const sendingChatId = ref('')

const dashboardLink = computed(() => {
  if (currentUser.value?.role === 'organizer') return '/organizer-dashboard'
  return '/attendee-dashboard'
})

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

function statusClass(status) {
  if (status === 'accepted') return 'accepted'
  if (status === 'declined') return 'declined'
  return 'unread'
}

async function fetchInboxData() {
  try {
    loading.value = true
    errorMessage.value = ''

    const user = currentUser.value

    if (!user?.email) {
      errorMessage.value = 'You must be logged in to view your inbox.'
      reminders.value = []
      connectionRequests.value = []
      return
    }

    const [remindersRes, requestsRes] = await Promise.all([
      fetch(`${API_BASE}/api/reminders?email=${encodeURIComponent(user.email)}`),
      fetch(`${API_BASE}/api/matchmaking-requests?email=${encodeURIComponent(user.email)}`)
    ])

    const remindersData = await remindersRes.json()
    const requestsData = await requestsRes.json()

    if (!remindersRes.ok) {
      errorMessage.value = remindersData.message || 'Failed to fetch reminders.'
      reminders.value = []
    } else {
      reminders.value = Array.isArray(remindersData) ? remindersData : []
    }

    if (!requestsRes.ok) {
      errorMessage.value = requestsData.message || 'Failed to fetch connection requests.'
      connectionRequests.value = []
    } else {
      connectionRequests.value = Array.isArray(requestsData) ? requestsData : []
    }
  } catch (error) {
    console.error('Fetch inbox error:', error)
    errorMessage.value = 'Could not connect to the server.'
    reminders.value = []
    connectionRequests.value = []
  } finally {
    loading.value = false
  }
}

async function markAsRead(id) {
  try {
    const response = await fetch(`${API_BASE}/api/reminders/${id}/read`, {
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

async function markRequestAsRead(id) {
  try {
    const response = await fetch(`${API_BASE}/api/matchmaking-requests/${id}/read`, {
      method: 'PATCH'
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to mark request as read.'
      return
    }

    connectionRequests.value = connectionRequests.value.map(request =>
      request._id === id ? { ...request, read: true } : request
    )
  } catch (error) {
    console.error('Mark connection request read error:', error)
    errorMessage.value = 'Could not connect to the server.'
  }
}

async function respondToRequest(id, action) {
  try {
    const response = await fetch(`${API_BASE}/api/matchmaking-requests/${id}/respond`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentUser.value?.email,
        action
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || `Failed to ${action} request.`
      return
    }

    connectionRequests.value = connectionRequests.value.map(request =>
      request._id === id
        ? { ...request, status: action, read: true }
        : request
    )
  } catch (error) {
    console.error('Respond connection request error:', error)
    errorMessage.value = 'Could not connect to the server.'
  }
}

async function loadChatMessages(requestId) {
  try {
    chatLoadingId.value = requestId

    const response = await fetch(
      `${API_BASE}/api/matchmaking-requests/${requestId}/messages?email=${encodeURIComponent(currentUser.value.email)}`
    )

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to load chat messages.'
      return
    }

    chatMessages.value = {
      ...chatMessages.value,
      [requestId]: Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.error('Load chat messages error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    chatLoadingId.value = ''
  }
}

async function toggleChat(requestId) {
  const isOpen = openChats.value[requestId]

  openChats.value = {
    ...openChats.value,
    [requestId]: !isOpen
  }

  if (!isOpen) {
    await loadChatMessages(requestId)
  }
}

async function sendChatMessage(requestId) {
  const text = chatInputs.value[requestId] || ''
  if (!text.trim()) return

  try {
    sendingChatId.value = requestId

    const response = await fetch(
      `${API_BASE}/api/matchmaking-requests/${requestId}/messages`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.value.email,
          name: currentUser.value.name || 'User',
          message: text
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to send message.'
      return
    }

    chatInputs.value = {
      ...chatInputs.value,
      [requestId]: ''
    }

    await loadChatMessages(requestId)
  } catch (error) {
    console.error('Send chat message error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    sendingChatId.value = ''
  }
}

onMounted(() => {
  currentUser.value = JSON.parse(localStorage.getItem('eventhiveUser') || 'null')
  fetchInboxData()
})
</script>

<style scoped>
.inbox-page {
  min-height: 100vh;
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
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: #8b6ec7;
  margin: 0 0 10px;
}

.inbox-header h1 {
  font-size: 64px;
  line-height: 0.95;
  letter-spacing: -2px;
  font-weight: 850;
  color: #243047;
  margin: 0 0 14px;
}

.inbox-subtitle {
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

.inbox-section {
  margin-bottom: 26px;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-top h2 {
  margin: 0;
  font-size: 34px;
  line-height: 1.05;
  letter-spacing: -0.8px;
  font-weight: 800;
  color: #243047;
}

.count-pill {
  font-size: 15px;
  font-weight: 800;
  background: #f3ecff;
  color: #7a5bc1;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
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
  font-size: 26px;
  line-height: 1.15;
  letter-spacing: -0.5px;
  font-weight: 800;
  color: #243047;
  margin: 0 0 6px;
}

.inbox-date {
  font-size: 13px;
  font-weight: 600;
  color: #8b5b46;
  margin: 0;
}

.inbox-message {
  font-size: 17px;
  line-height: 1.7;
  color: #4a5568;
  margin-bottom: 12px;
}

.intro-message {
  margin: 0 0 18px;
  color: #6a4f42;
  font-style: italic;
  font-size: 16px;
  line-height: 1.6;
}

.read-pill {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.2px;
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
  text-transform: capitalize;
}

.read-pill.unread {
  background: rgba(234, 179, 8, 0.18);
  color: #854d0e;
}

.read-pill.accepted {
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
}

.read-pill.declined {
  background: rgba(239, 68, 68, 0.14);
  color: #991b1b;
}

.inbox-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.details-btn,
.mark-read-btn,
.accept-btn,
.decline-btn {
  border: none;
  border-radius: 16px;
  padding: 11px 18px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  text-decoration: none;
}

.details-btn,
.accept-btn {
  background: linear-gradient(135deg, #8b6ec7, #a686d2);
  color: white;
}

.mark-read-btn {
  background: rgba(255, 255, 255, 0.92);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
}

.decline-btn {
  background: rgba(239, 68, 68, 0.12);
  color: #991b1b;
}

.chat-box {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(166, 134, 210, 0.14);
  display: grid;
  gap: 12px;
}

.chat-status {
  color: #5b6475;
  font-size: 15px;
}

.chat-message {
  background: #f8f6fc;
  border-radius: 14px;
  padding: 12px 14px;
}

.chat-message.mine {
  background: #efe8ff;
}

.chat-message p {
  margin: 6px 0;
  color: #243047;
  line-height: 1.5;
}

.chat-message small {
  color: #8b5b46;
  font-size: 12px;
}

.chat-input-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chat-input {
  flex: 1;
  min-width: 220px;
  border: 1px solid rgba(139, 110, 199, 0.18);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 15px;
  outline: none;
}

.status-text {
  font-size: 17px;
  line-height: 1.6;
  color: #5b6475;
}

.error-message {
  font-size: 16px;
  line-height: 1.5;
  font-weight: 600;
  color: #8d5b46;
  background: #fff3ef;
  border: 1px solid #f0d4ca;
  padding: 14px 16px;
  border-radius: 14px;
  display: inline-block;
}

@media (max-width: 768px) {
  .inbox-header,
  .inbox-card-top,
  .section-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .inbox-header h1 {
    font-size: 42px;
  }
}
</style>