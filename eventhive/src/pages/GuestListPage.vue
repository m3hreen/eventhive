<template>
  <main class="guest-list-page">
    <div class="guest-list-container">
      <div class="guest-list-header">
        <div>
          <p class="eyebrow">Organizer View</p>
          <h1>RSVP Analytics</h1>
          <p class="guest-list-subtitle" v-if="eventTitle">
            Insights and guest list for {{ eventTitle }}
          </p>
        </div>

        <div class="header-actions">
          <button
            class="reminder-btn"
            @click="sendReminder"
            :disabled="sendingReminder || !reminderEligibleCount"
          >
            {{ sendingReminder ? 'Sending...' : 'Send Reminder' }}
          </button>
          <router-link to="/my-events" class="back-btn">Back to My Events</router-link>
        </div>
      </div>

      <p v-if="message" class="success-message">{{ message }}</p>

      <div class="summary-cards" v-if="!loading && guests.length">
        <div class="summary-card">
          <span>Total RSVPs</span>
          <strong>{{ guests.length }}</strong>
        </div>
        <div class="summary-card">
          <span>Attending</span>
          <strong>{{ attendingCount }}</strong>
        </div>
        <div class="summary-card">
          <span>Maybe</span>
          <strong>{{ maybeCount }}</strong>
        </div>
        <div class="summary-card">
          <span>Declined</span>
          <strong>{{ declinedCount }}</strong>
        </div>
      </div>

      <div v-if="loading" class="status-text">Loading guest list...</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-else-if="guests.length === 0" class="status-text">No RSVPs yet for this event.</div>

      <template v-else>
        <div class="analytics-panel">
          <div class="analytics-card">
            <h2>RSVP Breakdown</h2>

            <div class="metric-row">
              <div class="metric-label">
                <span class="dot attending"></span>
                Attending
              </div>
              <div class="metric-value">{{ attendingCount }} ({{ attendingPercent }}%)</div>
            </div>
            <div class="progress-track">
              <div class="progress-fill attending-fill" :style="{ width: `${attendingPercent}%` }"></div>
            </div>

            <div class="metric-row">
              <div class="metric-label">
                <span class="dot maybe"></span>
                Maybe
              </div>
              <div class="metric-value">{{ maybeCount }} ({{ maybePercent }}%)</div>
            </div>
            <div class="progress-track">
              <div class="progress-fill maybe-fill" :style="{ width: `${maybePercent}%` }"></div>
            </div>

            <div class="metric-row">
              <div class="metric-label">
                <span class="dot declined"></span>
                Declined
              </div>
              <div class="metric-value">{{ declinedCount }} ({{ declinedPercent }}%)</div>
            </div>
            <div class="progress-track">
              <div class="progress-fill declined-fill" :style="{ width: `${declinedPercent}%` }"></div>
            </div>

            <p class="helper-text">
              Reminder eligible guests: {{ reminderEligibleCount }}
            </p>
          </div>

          <div class="analytics-card">
            <h2>Recent Responses</h2>
            <div class="recent-list">
              <div class="recent-item" v-for="guest in recentGuests" :key="guest._id">
                <div>
                  <p class="recent-name">{{ guest.name }}</p>
                  <p class="recent-email">{{ guest.email }}</p>
                </div>
                <div class="recent-right">
                  <span class="status-pill" :class="statusClass(guest.status)">
                    {{ guest.status }}
                  </span>
                  <p class="recent-time">{{ formatDate(guest.updatedAt || guest.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="guest-list-table-wrap">
          <table class="guest-list-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Responded</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="guest in guests" :key="guest._id">
                <td>{{ guest.name }}</td>
                <td>{{ guest.email }}</td>
                <td>
                  <span class="status-pill" :class="statusClass(guest.status)">
                    {{ guest.status }}
                  </span>
                </td>
                <td>{{ formatDate(guest.updatedAt || guest.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <section class="analytics-card analytics-section">
          <h2>Guest RSVP Analytics</h2>
          <div ref="barChartContainer" class="chart-container"></div>
        </section>

        <section class="analytics-card analytics-section">
          <h2>Poll Results</h2>

          <div v-if="polls.length">
            <label class="poll-select-label">Choose Poll</label>
            <select v-model="selectedPollIndex" class="poll-select">
              <option
                v-for="(poll, index) in polls"
                :key="poll._id || index"
                :value="index"
              >
                {{ poll.question }}
              </option>
            </select>

            <div ref="pieChartContainer" class="chart-container"></div>

            <div class="poll-legend" v-if="selectedPoll">
              <div
                v-for="(option, index) in selectedPoll.options"
                :key="index"
                class="poll-legend-item"
              >
                <span>{{ option.text }}</span>
                <strong>{{ option.votes }} vote(s)</strong>
              </div>
            </div>
          </div>

          <p v-else class="helper-text">No polls have been created for this event yet.</p>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup>
import * as d3 from 'd3'
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

const barChartContainer = ref(null)
const pieChartContainer = ref(null)
const route = useRoute()

const loading = ref(true)
const sendingReminder = ref(false)
const errorMessage = ref('')
const message = ref('')
const guests = ref([])
const eventTitle = ref('')
const polls = ref([])
const selectedPollIndex = ref(0)

const attendingCount = computed(() =>
  guests.value.filter(guest => guest.status === 'Attending').length
)

const maybeCount = computed(() =>
  guests.value.filter(guest => guest.status === 'Maybe').length
)

const declinedCount = computed(() =>
  guests.value.filter(guest => guest.status === 'Declined').length
)

const totalCount = computed(() => guests.value.length)

const attendingPercent = computed(() =>
  totalCount.value ? Math.round((attendingCount.value / totalCount.value) * 100) : 0
)

const maybePercent = computed(() =>
  totalCount.value ? Math.round((maybeCount.value / totalCount.value) * 100) : 0
)

const declinedPercent = computed(() =>
  totalCount.value ? Math.round((declinedCount.value / totalCount.value) * 100) : 0
)

const recentGuests = computed(() => guests.value.slice(0, 5))

const reminderEligibleCount = computed(() =>
  guests.value.filter(guest => ['Attending', 'Maybe'].includes(guest.status)).length
)

const rsvpChartData = computed(() => {
  const counts = {
    attending: 0,
    maybe: 0,
    declined: 0
  }

  guests.value.forEach(guest => {
    const status = (guest.status || '').toLowerCase().trim()
    if (counts[status] !== undefined) {
      counts[status]++
    }
  })

  return [
    { label: 'Attending', value: counts.attending },
    { label: 'Maybe', value: counts.maybe },
    { label: 'Declined', value: counts.declined }
  ]
})

const selectedPoll = computed(() => polls.value[selectedPollIndex.value] || null)

const pollChartData = computed(() => {
  if (!selectedPoll.value?.options) return []

  return selectedPoll.value.options.map(option => ({
    label: option.text,
    value: option.votes || 0
  }))
})

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

function statusClass(status) {
  if (status === 'Attending') return 'attending'
  if (status === 'Maybe') return 'maybe'
  if (status === 'Declined') return 'declined'
  return ''
}

async function fetchGuestList() {
  try {
    loading.value = true
    errorMessage.value = ''

    const [eventRes, rsvpRes, pollsRes] = await Promise.all([
      fetch(`${API_BASE}/api/events/${route.params.id}`),
      fetch(`${API_BASE}/api/events/${route.params.id}/rsvps`),
      fetch(`${API_BASE}/api/events/${route.params.id}/polls`)
    ])

    const eventData = await eventRes.json()
    const rsvpData = await rsvpRes.json()

    let pollsData = []
    if (pollsRes.ok) {
      pollsData = await pollsRes.json()
    } else {
      polls.value = []
    }

    if (!eventRes.ok) {
      errorMessage.value = eventData.message || 'Failed to load event.'
      return
    }

    if (!rsvpRes.ok) {
      errorMessage.value = rsvpData.message || 'Failed to load guest list.'
      return
    }

    eventTitle.value = eventData.title || ''
    guests.value = Array.isArray(rsvpData) ? rsvpData : []
    polls.value = Array.isArray(pollsData) ? pollsData : []
    selectedPollIndex.value = 0
  } catch (error) {
    console.error('Fetch guest list error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    loading.value = false
  }
}

async function sendReminder() {
  message.value = ''
  errorMessage.value = ''

  try {
    sendingReminder.value = true

    const response = await fetch(`${API_BASE}/api/events/${route.params.id}/send-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()

    if (!response.ok) {
      errorMessage.value = data.message || 'Failed to send reminder.'
      return
    }

    message.value = data.message || 'Reminder sent successfully.'
  } catch (error) {
    console.error('Send reminder error:', error)
    errorMessage.value = 'Could not connect to the server.'
  } finally {
    sendingReminder.value = false
  }
}

function drawBarChart() {
  if (!barChartContainer.value) return

  d3.select(barChartContainer.value).selectAll('*').remove()

  const data = rsvpChartData.value

  const width = 500
  const height = 300
  const margin = { top: 20, right: 20, bottom: 50, left: 50 }

  const svg = d3
    .select(barChartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const x = d3
    .scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.left, width - margin.right])
    .padding(0.3)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.value) || 1])
    .nice()
    .range([height - margin.bottom, margin.top])

  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))

  svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))

  const colours = {
    Attending: '#564373',
    Maybe: '#7d6cb1',
    Declined: '#a595d4'
  }

  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d.label))
    .attr('y', d => y(d.value))
    .attr('width', x.bandwidth())
    .attr('height', d => height - margin.bottom - y(d.value))
    .attr('fill', d => colours[d.label])

  svg
    .selectAll('.bar-label')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .attr('x', d => x(d.label) + x.bandwidth() / 2)
    .attr('y', d => y(d.value) - 6)
    .attr('text-anchor', 'middle')
    .style('fill', '#243047')
    .style('font-size', '12px')
    .style('font-weight', '600')
    .text(d => d.value)
}

function drawPieChart() {
  if (!pieChartContainer.value) return

  d3.select(pieChartContainer.value).selectAll('*').remove()

  const data = pollChartData.value

  if (!data.length) {
    d3.select(pieChartContainer.value)
      .append('p')
      .attr('class', 'helper-text')
      .text('No poll data available for this event.')
    return
  }

  const width = 420
  const height = 320
  const radius = Math.min(width, height) / 2 - 10

  const svg = d3
    .select(pieChartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2}, ${height / 2})`)

  const color = d3
    .scaleOrdinal()
    .domain(data.map(d => d.label))
    .range([
      '#564373',
      '#7d6cb1',
      '#a595d4',
      '#c4b8e6',
      '#ded6f5',
      '#d49a77'
    ])

  const pie = d3
    .pie()
    .value(d => d.value)
    .sort(null)

  const arc = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius)

  const labelArc = d3
    .arc()
    .innerRadius(radius * 0.62)
    .outerRadius(radius * 0.62)

  const arcs = svg
    .selectAll('arc')
    .data(pie(data))
    .enter()
    .append('g')

  arcs
    .append('path')
    .attr('d', arc)
    .attr('fill', d => color(d.data.label))
    .attr('stroke', '#fff')
    .style('stroke-width', '2px')

  arcs
    .append('text')
    .attr('transform', d => `translate(${labelArc.centroid(d)})`)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('fill', '#243047')
    .style('font-weight', '600')
    .text(d => d.data.value > 0 ? d.data.value : '')
}

onMounted(async () => {
  await fetchGuestList()
  await nextTick()
  drawBarChart()
  drawPieChart()
})

watch(guests, async () => {
  await nextTick()
  drawBarChart()
}, { deep: true })

watch([polls, selectedPollIndex], async () => {
  await nextTick()
  drawPieChart()
}, { deep: true })
</script>

<style scoped>
.guest-list-page {
  min-height: 100vh;
  padding: 48px 24px 72px;
}

.guest-list-container {
  max-width: 1180px;
  margin: 0 auto;
}

.guest-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.eyebrow {
  font-size: 14px;
  font-weight: 700;
  color: #8b6ec7;
  letter-spacing: 0.4px;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.guest-list-header h1 {
  font-size: 56px;
  line-height: 1.02;
  letter-spacing: -1.5px;
  color: #243047;
  margin: 0 0 12px;
}

.guest-list-subtitle {
  font-size: 20px;
  color: #5b6475;
  margin: 0;
}

.back-btn,
.reminder-btn {
  border-radius: 18px;
  padding: 14px 22px;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.back-btn {
  background: rgba(255, 255, 255, 0.82);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  box-shadow: 0 8px 18px rgba(72, 59, 102, 0.06);
}

.reminder-btn {
  background: linear-gradient(135deg, #8b6ec7 0%, #a686d2 55%, #d49a77 100%);
  color: white;
  box-shadow: 0 10px 24px rgba(139, 110, 199, 0.18);
}

.reminder-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 28px;
}

.summary-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 12px 28px rgba(72, 59, 102, 0.05);
}

.summary-card span {
  display: block;
  font-size: 15px;
  color: #5b6475;
  margin-bottom: 8px;
}

.summary-card strong {
  font-size: 32px;
  color: #243047;
}

.analytics-panel {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 20px;
  margin-bottom: 28px;
}

.analytics-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.07);
}

.analytics-section {
  margin-top: 24px;
}

.analytics-card h2 {
  margin: 0 0 18px;
  font-size: 26px;
  color: #243047;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 14px 0 8px;
}

.metric-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #3f4a5e;
  font-weight: 600;
}

.metric-value {
  color: #243047;
  font-weight: 700;
}

.helper-text {
  margin-top: 14px;
  color: #8b5b46;
  font-size: 14px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.dot.attending {
  background: #22c55e;
}

.dot.maybe {
  background: #eab308;
}

.dot.declined {
  background: #ef4444;
}

.progress-track {
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: #efe9df;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
}

.attending-fill {
  background: linear-gradient(90deg, #22c55e, #86efac);
}

.maybe-fill {
  background: linear-gradient(90deg, #eab308, #fde68a);
}

.declined-fill {
  background: linear-gradient(90deg, #ef4444, #fca5a5);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(166, 134, 210, 0.12);
}

.recent-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.recent-name {
  font-size: 16px;
  font-weight: 700;
  color: #243047;
  margin: 0 0 4px;
}

.recent-email {
  font-size: 14px;
  color: #5b6475;
  margin: 0;
}

.recent-right {
  text-align: right;
}

.recent-time {
  font-size: 13px;
  color: #8b5b46;
  margin: 8px 0 0;
}

.status-text {
  font-size: 18px;
  color: #5b6475;
}

.success-message {
  font-size: 16px;
  color: #166534;
  background: #ecfdf3;
  border: 1px solid #bbf7d0;
  padding: 12px 14px;
  border-radius: 14px;
  display: inline-block;
  margin-bottom: 18px;
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

.guest-list-table-wrap {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.07);
}

.guest-list-table {
  width: 100%;
  border-collapse: collapse;
}

.guest-list-table th,
.guest-list-table td {
  text-align: left;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(166, 134, 210, 0.12);
}

.guest-list-table th {
  background: rgba(247, 236, 141, 0.16);
  color: #243047;
  font-size: 15px;
}

.guest-list-table td {
  color: #3f4a5e;
  font-size: 16px;
}

.status-pill {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-pill.attending {
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
}

.status-pill.maybe {
  background: rgba(234, 179, 8, 0.18);
  color: #854d0e;
}

.status-pill.declined {
  background: rgba(239, 68, 68, 0.14);
  color: #991b1b;
}

.poll-select-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #243047;
}

.poll-select {
  width: 100%;
  max-width: 520px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #d7dceb;
  margin-bottom: 20px;
  font-size: 15px;
}

.poll-legend {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.poll-legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f7f8fc;
  border: 1px solid #eceff6;
  border-radius: 12px;
  padding: 12px 14px;
}

.chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 340px;
  overflow-x: auto;
}

@media (max-width: 900px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .analytics-panel {
    grid-template-columns: 1fr;
  }

  .guest-list-header {
    flex-direction: column;
  }

  .guest-list-header h1 {
    font-size: 42px;
  }
}

@media (max-width: 700px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .guest-list-table-wrap {
    overflow-x: auto;
  }

  .guest-list-table {
    min-width: 680px;
  }
}
</style>