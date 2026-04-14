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

      <div class="matchmaking-section">
        <div class="section-header">
          <div>
            <p class="section-eyebrow">Connect</p>
            <h2>Event Matchmaking</h2>
            <p class="section-subtitle">Meet people attending this event with similar interests.</p>
          </div>
        </div>

        <div class="matchmaking-card">
          <h3>My Matchmaking Profile</h3>

          <label class="checkbox-row">
            <input v-model="matchmaking.enabled" type="checkbox" />
            <span>Enable matchmaking for this event</span>
          </label>

          <div class="interest-grid">
            <label
              v-for="interest in availableInterests"
              :key="interest"
              class="interest-pill"
              :class="{ active: matchmaking.interests.includes(interest) }"
            >
              <input
                type="checkbox"
                :value="interest"
                v-model="matchmaking.interests"
              />
              <span>{{ interest }}</span>
            </label>
          </div>

          <input
            v-model="matchmaking.location"
            type="text"
            placeholder="Your area, for example Mississauga or Downtown Toronto"
          />

          <select v-model="matchmaking.attendingType">
            <option value="">How are you attending?</option>
            <option>Solo</option>
            <option>With Friends</option>
            <option>Open to Meeting New People</option>
          </select>

          <textarea
            v-model="matchmaking.bio"
            rows="3"
            placeholder="A short intro, for example Looking to network and maybe split an Uber."
          ></textarea>

          <button class="primary-btn" @click="saveMatchmaking" :disabled="matchmakingLoading">
            {{ matchmakingLoading ? 'Saving...' : 'Save Matchmaking Profile' }}
          </button>

          <p v-if="matchmakingMessage" class="success-message">{{ matchmakingMessage }}</p>
        </div>

        <div class="matchmaking-card">
          <div class="matchmaking-top-row">
            <h3>People You Can Connect With</h3>
            <button class="secondary-btn" @click="loadMatches" :disabled="matchesLoading">
              {{ matchesLoading ? 'Refreshing...' : 'Refresh Matches' }}
            </button>
          </div>

          <p v-if="matchmaking.enabled && !matches.length && !matchesLoading" class="status-text">
            No matches yet. Try adding more interests or a location.
          </p>

          <p v-else-if="!matchmaking.enabled" class="status-text">
            Turn on matchmaking and save your profile to see matches.
          </p>

          <div v-else class="matches-list">
            <div v-for="match in matches" :key="match.email" class="match-card">
              <div class="match-card-top">
                <div>
                  <h4>{{ match.name }}</h4>
                  <p class="match-meta">
                    {{ match.matchmaking.location || 'No location added' }} ,
                    {{ match.matchmaking.attendingType || '' }}
                  </p>
                </div>
                <span class="score-pill">{{ match.matchScore }} pts</span>
              </div>

              <p class="match-bio" v-if="match.matchmaking.bio">{{ match.matchmaking.bio }}</p>

              <div class="shared-tags" v-if="match.sharedInterests?.length">
                <span v-for="item in match.sharedInterests" :key="item" class="shared-tag">
                  {{ item }}
                </span>
              </div>

              <div class="connect-row">
                <input
                  v-model="connectMessages[match.email]"
                  type="text"
                  class="connect-input"
                  placeholder="Optional intro message"
                />

                <button
                  class="primary-btn"
                  @click="sendConnectRequest(match.email)"
                  :disabled="match.connectionStatus !== 'none' || connectLoadingEmail === match.email"
                >
                  {{
                    connectLoadingEmail === match.email
                      ? 'Sending...'
                      : match.connectionStatus === 'pending'
                        ? 'Pending'
                        : match.connectionStatus === 'accepted'
                          ? 'Connected'
                          : match.connectionStatus === 'declined'
                            ? 'Declined'
                            : 'Connect'
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="polls-section">
        <div class="polls-header">
          <div>
            <p class="polls-eyebrow">Interactive</p>
            <h2>Event Polls</h2>
            <p class="polls-subtitle">Vote on ideas for this event.</p>
          </div>
        </div>

        <div v-if="isOrganizer" class="create-poll-card">
          <h3>Create a Poll</h3>

          <input v-model="newPoll.question" placeholder="Poll question" />

          <div
            v-for="(opt, i) in newPoll.options"
            :key="i"
            class="poll-option-input"
          >
            <input v-model="newPoll.options[i]" placeholder="Option" />
          </div>

          <div class="poll-actions">
            <button class="secondary-poll-btn" @click="addOption">Add Option</button>
            <button class="primary-poll-btn" @click="createPoll">Create Poll</button>
          </div>
        </div>

        <div v-if="polls.length" class="polls-list">
          <div v-for="poll in polls" :key="poll._id" class="poll-card">
            <div class="poll-header">
              <h3>{{ poll.question }}</h3>
              <span class="vote-count">{{ totalVotes(poll) }} votes</span>
            </div>

            <div v-for="(opt, i) in poll.options" :key="i" class="poll-option">
              <button
                v-if="!hasVoted(poll)"
                class="vote-btn"
                @click="vote(poll._id, i)"
              >
                {{ opt.text }}
              </button>

              <div v-else class="poll-result-wrap">
                <div class="poll-result-top">
                  <span>{{ opt.text }}</span>
                  <strong>
                    {{ opt.votes }} ({{ getPercent(opt.votes, totalVotes(poll)) }}%)
                  </strong>
                </div>

                <div class="poll-bar">
                  <div
                    class="poll-fill"
                    :style="{ width: getPercent(opt.votes, totalVotes(poll)) + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <p v-if="hasVoted(poll)" class="voted-note">
              You already voted on this poll.
            </p>
          </div>
        </div>

        <p v-else class="status-text">No polls yet for this event.</p>
      </div>
    </div>

    <div v-else-if="pageLoading" class="status-text">Loading event...</div>
    <div v-else class="error-message">{{ errorMessage || 'Event not found.' }}</div>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
const route = useRoute()

const isSaved = ref(false)
const isOrganizer = ref(false)
const event = ref(null)
const polls = ref([])
const pageLoading = ref(true)
const loading = ref(false)
const message = ref('')
const errorMessage = ref('')
const matchmakingMessage = ref('')
const matchmakingLoading = ref(false)
const matchesLoading = ref(false)
const connectLoadingEmail = ref('')
const matches = ref([])
const connectMessages = ref({})

const availableInterests = [
  'Networking',
  'Carpool',
  'Meet New People',
  'Study Buddy',
  'Sports Partner',
  'Food Buddy',
  'Photography',
  'Business',
  'Music',
  'Gaming'
]

const rsvpForm = reactive({
  name: '',
  email: '',
  status: ''
})

const matchmaking = reactive({
  enabled: false,
  interests: [],
  location: '',
  attendingType: '',
  bio: ''
})

const newPoll = reactive({
  question: '',
  options: ['', '']
})

const canUseMatchmaking = computed(() =>
  ['Attending', 'Maybe'].includes(rsvpForm.status)
)

function getCurrentUser() {
  const savedUser = localStorage.getItem('eventhiveUser')
  return savedUser ? JSON.parse(savedUser) : null
}

function totalVotes(poll) {
  return (poll.options || []).reduce((sum, option) => sum + (option.votes || 0), 0)
}

function getPercent(votes, total) {
  if (!total) return 0
  return Math.round((votes / total) * 100)
}

async function toggleSave() {
  try {
    const user = getCurrentUser()
    if (!user?.email || !event.value?._id) return

    const method = isSaved.value ? 'DELETE' : 'POST'

    const response = await fetch(
      `${API_BASE}/api/events/${event.value._id}/save`,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Could not update saved event.'
      return
    }

    isSaved.value = !isSaved.value
  } catch (e) {
    console.error(e)
    errorMessage.value = 'Could not connect to the server.'
  }
}

async function checkSaved() {
  try {
    const user = getCurrentUser()
    if (!user?.email || !event.value?._id) return

    const res = await fetch(
      `${API_BASE}/api/saved-events?email=${encodeURIComponent(user.email)}`
    )

    const data = await res.json()

    isSaved.value = Array.isArray(data) && data.some(
      savedEvent => String(savedEvent._id) === String(event.value._id)
    )
  } catch (e) {
    console.error(e)
  }
}

function hydrateMatchmakingFromRsvp(rsvp) {
  const profile = rsvp?.matchmaking || {}
  matchmaking.enabled = Boolean(profile.enabled)
  matchmaking.interests = Array.isArray(profile.interests) ? [...profile.interests] : []
  matchmaking.location = profile.location || ''
  matchmaking.attendingType = profile.attendingType || ''
  matchmaking.bio = profile.bio || ''
}

async function fetchEvent() {
  try {
    pageLoading.value = true
    errorMessage.value = ''

    const response = await fetch(`${API_BASE}/api/events/${route.params.id}`)
    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to load event.'
      return
    }

    event.value = data

    const user = getCurrentUser()
    isOrganizer.value = user?.email === data.createdBy

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

async function loadOwnRsvp() {
  try {
    const user = getCurrentUser()
    if (!user?.email) return

    const response = await fetch(`${API_BASE}/api/events/${route.params.id}/rsvps`)
    const data = await response.json()

    if (!response.ok || !Array.isArray(data)) return

    const myRsvp = data.find(item => item.email === user.email.trim().toLowerCase())
    if (!myRsvp) return

    rsvpForm.name = myRsvp.name || rsvpForm.name
    rsvpForm.email = myRsvp.email || rsvpForm.email
    rsvpForm.status = myRsvp.status || rsvpForm.status
    hydrateMatchmakingFromRsvp(myRsvp)
  } catch (error) {
    console.error('Load own RSVP error:', error)
  }
}

async function submitRsvp() {
  message.value = ''
  errorMessage.value = ''
  matchmakingMessage.value = ''

  if (!rsvpForm.name || !rsvpForm.email || !rsvpForm.status) {
    errorMessage.value = 'Please complete all RSVP fields.'
    return
  }

  try {
    loading.value = true

    const response = await fetch(`${API_BASE}/api/events/${route.params.id}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...rsvpForm,
        matchmaking: {
          ...matchmaking,
          enabled: canUseMatchmaking.value ? matchmaking.enabled : false
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to submit RSVP.'
      return
    }

    message.value = data.message || 'RSVP submitted successfully.'

    if (matchmaking.enabled && canUseMatchmaking.value) {
      await loadMatches()
    } else {
      matches.value = []
    }
  } catch (error) {
    console.error('Submit RSVP error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    loading.value = false
  }
}

async function saveMatchmaking() {
  matchmakingMessage.value = ''
  errorMessage.value = ''
  message.value = ''

  if (!rsvpForm.name || !rsvpForm.email || !rsvpForm.status) {
    errorMessage.value = 'Please RSVP first before saving matchmaking.'
    return
  }

  if (!canUseMatchmaking.value) {
    errorMessage.value = 'Only Attending or Maybe guests can enable matchmaking.'
    return
  }

  try {
    matchmakingLoading.value = true

    const response = await fetch(`${API_BASE}/api/events/${route.params.id}/rsvp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...rsvpForm,
        matchmaking
      })
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Could not save matchmaking profile.'
      return
    }

    matchmakingMessage.value = 'Matchmaking profile saved.'
    await loadMatches()
  } catch (error) {
    console.error('Save matchmaking error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    matchmakingLoading.value = false
  }
}

async function loadMatches() {
  const user = getCurrentUser()
  if (!user?.email || !matchmaking.enabled || !canUseMatchmaking.value) {
    matches.value = []
    return
  }

  try {
    matchesLoading.value = true

    const response = await fetch(
      `${API_BASE}/api/events/${route.params.id}/matchmaking?email=${encodeURIComponent(user.email)}`
    )

    const data = await response.json()

    if (!response.ok) {
      if (response.status !== 404 && response.status !== 400) {
        errorMessage.value = data.message || 'Could not load matches.'
      }
      matches.value = []
      return
    }

    matches.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Load matches error:', error)
    errorMessage.value = 'Could not connect to the server.'
    matches.value = []
  } finally {
    matchesLoading.value = false
  }
}

async function sendConnectRequest(toEmail) {
  const user = getCurrentUser()
  if (!user?.email) return

  try {
    connectLoadingEmail.value = toEmail

    const response = await fetch(
      `${API_BASE}/api/events/${route.params.id}/matchmaking/connect`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: user.email,
          toEmail,
          message: connectMessages.value[toEmail] || ''
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Could not send connection request.'
      return
    }

    errorMessage.value = ''
    matchmakingMessage.value = data.message || 'Connection request sent.'
    connectMessages.value[toEmail] = ''
    await loadMatches()
  } catch (error) {
    console.error('Send connect request error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    connectLoadingEmail.value = ''
  }
}

async function loadPolls() {
  try {
    const res = await fetch(
      `${API_BASE}/api/events/${route.params.id}/polls`
    )
    const data = await res.json()

    if (!res.ok) {
      console.error(data.message || 'Failed to load polls.')
      polls.value = []
      return
    }

    polls.value = data
  } catch (error) {
    console.error('Load polls error:', error)
    polls.value = []
  }
}

function addOption() {
  newPoll.options.push('')
}

async function createPoll() {
  try {
    const user = getCurrentUser()

    if (!user?.email) {
      errorMessage.value = 'You must be logged in to create a poll.'
      return
    }

    const cleanedOptions = newPoll.options
      .map(option => option.trim())
      .filter(Boolean)

    if (!newPoll.question.trim() || cleanedOptions.length < 2) {
      errorMessage.value = 'A poll needs a question and at least 2 options.'
      return
    }

    const response = await fetch(
      `${API_BASE}/api/events/${route.params.id}/polls`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newPoll.question,
          options: cleanedOptions,
          createdBy: user.email
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Could not create poll.'
      return
    }

    newPoll.question = ''
    newPoll.options = ['', '']
    errorMessage.value = ''
    message.value = data.message || 'Poll created successfully.'
    await loadPolls()
  } catch (error) {
    console.error('Create poll error:', error)
    errorMessage.value = 'Could not connect to the server.'
  }
}

async function vote(pollId, optionIndex) {
  try {
    const user = getCurrentUser()
    if (!user?.email) return

    const response = await fetch(
      `${API_BASE}/api/polls/${pollId}/vote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIndex,
          email: user.email
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Could not record vote.'
      return
    }

    errorMessage.value = ''
    await loadPolls()
  } catch (error) {
    console.error('Vote error:', error)
    errorMessage.value = 'Could not connect to the server.'
  }
}

function hasVoted(poll) {
  const user = getCurrentUser()
  return poll.votedBy?.includes(user?.email?.trim().toLowerCase())
}

onMounted(async () => {
  await fetchEvent()
  await Promise.all([
    loadPolls(),
    loadOwnRsvp()
  ])
  await loadMatches()
})
</script>

<style scoped>
.event-details-page {
  min-height: 100vh;
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

.rsvp-card,
.matchmaking-section,
.polls-section {
  margin-top: 30px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  padding: 26px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.07);
}

.rsvp-card h2,
.section-header h2,
.polls-header h2 {
  margin: 0 0 18px;
  font-size: 30px;
  color: #243047;
}

.rsvp-card input,
.rsvp-card select,
.matchmaking-card input,
.matchmaking-card select,
.matchmaking-card textarea,
.create-poll-card input,
.poll-option-input input {
  width: 100%;
  margin-bottom: 14px;
  border: 1px solid rgba(139, 110, 199, 0.14);
  background: #fffdfb;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 15px;
  color: #243047;
  outline: none;
  box-sizing: border-box;
}

.matchmaking-card textarea {
  resize: vertical;
}

.rsvp-btn,
.primary-btn,
.primary-poll-btn,
.vote-btn {
  background: linear-gradient(135deg, #8b6ec7 0%, #a686d2 55%, #d49a77 100%);
  color: white;
  border: none;
  border-radius: 18px;
  padding: 14px 24px;
  font-weight: 700;
  cursor: pointer;
}

.secondary-btn,
.secondary-poll-btn {
  background: rgba(255, 255, 255, 0.92);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  border-radius: 18px;
  padding: 12px 18px;
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
  color: #5b6475;
  font-size: 18px;
}

.section-header,
.polls-header {
  margin-bottom: 18px;
}

.section-eyebrow,
.polls-eyebrow {
  font-size: 13px;
  font-weight: 700;
  color: #8b6ec7;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin: 0 0 6px;
}

.section-subtitle,
.polls-subtitle {
  margin: 0;
  color: #5b6475;
  font-size: 17px;
}

.matchmaking-section {
  display: grid;
  gap: 18px;
}

.matchmaking-card {
  background: white;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid rgba(166, 134, 210, 0.14);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.matchmaking-card h3 {
  margin: 0 0 14px;
  font-size: 24px;
  color: #243047;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-weight: 600;
  color: #243047;
}

.checkbox-row input {
  width: 18px;
  height: 18px;
  margin: 0;    
  accent-color: #8b6ec7;
}

.interest-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.interest-pill {
  border: 1px solid rgba(139, 110, 199, 0.18);
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.9);
  color: #6f54a8;
  font-weight: 700;
}

.interest-pill input {
  display: none;
}

.interest-pill.active {
  background: rgba(139, 110, 199, 0.14);
  color: #5f3ea1;
}

.matchmaking-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.matches-list {
  display: grid;
  gap: 14px;
}

.match-card {
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 20px;
  padding: 18px;
  background: #fffdfb;
}

.match-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}

.match-card h4 {
  margin: 0 0 6px;
  color: #243047;
  font-size: 22px;
}

.match-meta {
  margin: 0;
  color: #5b6475;
  font-size: 14px;
}

.match-bio {
  margin: 0 0 12px;
  color: #4a5568;
  line-height: 1.6;
}

.score-pill {
  background: #f3ecff;
  color: #7a5bc1;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 13px;
}

.shared-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.shared-tag {
  background: rgba(212, 154, 119, 0.14);
  color: #8b5b46;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.connect-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.connect-input {
  flex: 1;
  min-width: 240px;
}

.create-poll-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,245,239,0.95));
  border: 1px solid rgba(166, 134, 210, 0.16);
  border-radius: 24px;
  padding: 22px;
  margin-bottom: 24px;
}

.create-poll-card h3 {
  margin: 0 0 14px;
  font-size: 24px;
  color: #243047;
}

.poll-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.polls-list {
  display: grid;
  gap: 18px;
}

.poll-card {
  background: white;
  padding: 24px;
  border-radius: 22px;
  border: 1px solid rgba(166,134,210,0.14);
  box-shadow: 0 8px 24px rgba(0,0,0,0.04);
}

.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.vote-count {
  background: #f3ecff;
  color: #7a5bc1;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
}

.poll-card h3 {
  margin: 0;
  color: #243047;
  font-size: 24px;
}

.poll-option {
  margin-bottom: 12px;
}

.vote-btn {
  width: 100%;
  text-align: left;
}

.poll-result-wrap {
  display: grid;
  gap: 8px;
}

.poll-result-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #243047;
}

.poll-bar {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: #efe9df;
  overflow: hidden;
}

.poll-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(135deg, #8b6ec7 0%, #d49a77 100%);
}

.voted-note {
  margin: 6px 0 0;
  color: #8b5b46;
  font-size: 14px;
}

@media (max-width: 768px) {
  .event-header,
  .matchmaking-top-row,
  .poll-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .event-header h1 {
    font-size: 42px;
  }
}
</style>