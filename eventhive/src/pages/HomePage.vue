<template>
  <main class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Plan, discover, and manage unforgettable events</h1>
        <p>
          Browse events, RSVP instantly, manage guest lists, and track attendance
          from one beautiful, all-in-one event platform.
        </p>

        <div class="hero-buttons">
          <router-link :to="exploreLink" class="primary-btn">Explore Events</router-link>
          <router-link :to="createEventLink" class="secondary-btn">Create an Event</router-link>
        </div>
      </div>

      <div class="hero-visual"></div>
    </section>

    <section class="search-preview">
      <div class="search-box">
        <input type="text" placeholder="Search events..." />
        <select id="categoryFilter">
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <input id="dateFilter" type="date" />
        <input id="locationFilter" type="text" placeholder="City" />
        <button id="filterBtn" class="primary-btn" @click="applyFilters">Search</button>
        <button id="resetBtn" class="secondary-btn" type="button" @click="resetFilters">Reset</button>
      </div>

    </section>

    <section id="featured" class="featured-section">
      <h2>Featured Events</h2>

      <div v-if="loading" class="empty-state">
       <p>Loading events…</p>
     </div>

      <div  v-else-if="events.length" class="featured-grid">
        <div class="event-card" v-for="event in events" :key="event._id || event.id">
          <img
            v-if="event.image"
            :src="event.image"
            :alt="event.title"
            class="event-image"
          />

          <div class="event-card-top">
            <div class="event-card-main">
              <h3>{{ event.title }}</h3>
              <span class="category-badge" @click="filterByCategory(event.category)"
              style="cursor:pointer;" >{{ event.category }}</span>
            </div>

            <div class="date-pill">
              {{ event.date }}
            </div>
          </div>

          <p class="event-location">{{ event.location }}</p>

          <p class="event-description" v-if="event.description">
            {{ event.description }}
          </p>

          <div class="card-actions">
            <router-link
              :to="`/event/${event._id || event.id}`"
              class="primary-btn small-btn"
            >
              View Details
            </router-link>

            <button
  v-if="currentUser && currentUser.email !== event.createdBy"
  class="secondary-btn small-btn"
  @click="saveEvent(event._id || event.id)"
>
  Save
</button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>No events match your filters.</p>
        <button class="secondary-btn" @click="resetFilters">Clear filters</button>
      </div>

    </section>

    <section id="categories" class="categories-section">
      <h2>Browse by Category</h2>
      <div class="categories-grid">
        <div class="category-card" v-for="category in categories" :key="category" :class="{ active: selectedCategory === category }" @click="filterByCategory(category)">
          <span class="cat-label">{{ category }}</span>
          <span class="cat-count">{{ countByCategory(category) }} events</span>
        </div>
      </div>
    </section>

    <section class="featured-section">
      <h2>Community Suggestions</h2>

      <div class="featured-grid">
        <div class="event-card" v-for="s in suggestions" :key="s._id">
          <div class="event-card-top">
            <div>
              <h3>{{ s.title }}</h3>
              <span class="category-badge">{{ s.category }}</span>
            </div>
          </div>

          <p class="event-location">
            {{ s.location || 'Any location' }}
          </p>

          <p class="event-description">
            {{ s.details }}
          </p>

          <div class="like-row">
            <button
              class="secondary-btn small-btn"
              @click="likeSuggestion(s._id)"
            >
              👍 Like
            </button>

            <span class="like-count">
              {{ s.likes || 0 }} likes
            </span>
          </div>
        </div>
      </div>
    </section>

    <section class="how-it-works">
      <h2>How It Works</h2>
      <div class="steps-grid">
        <div class="step-card">
          <h3>1. Discover</h3>
          <p>Find exciting events near you with smart search and category filters.</p>
        </div>
        <div class="step-card">
          <h3>2. RSVP</h3>
          <p>Book tickets or RSVP in seconds and keep all event details in one place.</p>
        </div>
        <div class="step-card">
          <h3>3. Manage</h3>
          <p>Organizers can track attendance, manage guests, and view event analytics.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import $ from 'jquery'

const allEvents = ref([])
const currentUser = ref(null)
const events = ref([])
const suggestions = ref([])
const selectedCategory = ref('')
const loading = ref(true)


const filterCategory = ref('')
const filterDate = ref('')
const filterLocation = ref('')


const createEventLink = computed(() => {
  if (currentUser.value?.role === 'organizer') return '/create-event'
  return '/login'
})

const exploreLink = computed(() => {
  if (currentUser.value?.role === 'organizer') return '/my-events'
  if (currentUser.value) return '/attendee-dashboard'
  return '/login'
})

const categories = [
  'Music',
  'Workshops',
  'Networking',
  'Sports',
  'Community',
  'Conferences'
]

const activeFilters = computed(() => {
 const chips = []
 if (filterCategory.value) chips.push({ key: 'category', label: `Category: ${filterCategory.value}` })
 if (filterDate.value) chips.push({ key: 'date', label: `Date: ${filterDate.value}` })
 if (filterLocation.value) chips.push({ key: 'location', label: `Location: ${filterLocation.value}` })
 return chips
})

const countByCategory = (cat) =>
 allEvents.value.filter(e => (e.category || '').toLowerCase() === cat.toLowerCase()).length

const applyFilters = () => {
 const selCat = ($('#categoryFilter').val() || '').toString().trim().toLowerCase()
 const selDate = ($('#dateFilter').val() || '').toString().trim()
 const selLoc = ($('#locationFilter').val() || '').toString().trim().toLowerCase()


 filterCategory.value = ($('#categoryFilter').val() || '').toString().trim()
 filterDate.value = selDate
 filterLocation.value = ($('#locationFilter').val() || '').toString().trim()

 selectedCategory.value = filterCategory.value

 events.value = allEvents.value.filter(event => {
   const evCat = (event.category || '').toLowerCase()
   const evDate = (event.date || '').toString()
   const evLoc = (event.location || '').toLowerCase()


   const matchCat = !selCat || evCat === selCat
   const matchDate = !selDate || evDate === selDate
   const matchLoc = !selLoc || evLoc.includes(selLoc)


   return matchCat && matchDate && matchLoc
 })


 $('.event-card').fadeOut(150, function () {
   $(this).fadeIn(200)
 })


 $('html, body').animate(
   { scrollTop: $('#featured').offset()?.top - 80 || 0 },
   400
 )
}


const resetFilters = () => {
 selectedCategory.value = ''
 filterCategory.value = ''
 filterDate.value = ''
 filterLocation.value = ''
 $('#categoryFilter').val('')
 $('#dateFilter').val('')
 $('#locationFilter').val('')
 events.value = allEvents.value


 $('.event-card').hide().fadeIn(250)
}


const filterByCategory = (cat) => {
 if (!cat) return
 selectedCategory.value = cat
 $('#categoryFilter').val(cat)
 applyFilters()
}


const clearChip = (key) => {
 if (key === 'category') {
   selectedCategory.value = ''
   filterCategory.value = ''
   $('#categoryFilter').val('')
 } else if (key === 'date') {
   filterDate.value = ''
   $('#dateFilter').val('')
 } else if (key === 'location') {
   filterLocation.value = ''
   $('#locationFilter').val('')
 }
 applyFilters()
}


async function loadEvents() {
  try {
    console.log('starting events fetch')
    const res = await fetch('http://localhost:5001/api/events')
    console.log('got response', res.status)
    const data = await res.json()
    console.log('got data', data)

    if (!res.ok) {
      events.value = []
      allEvents.value = []
      return
    }

    allEvents.value = data
    events.value = data
  } catch (e) {
    console.error('Error loading events:', e)
    events.value = []
    allEvents.value = []
  } finally {
    console.log('finished loadEvents')
    loading.value = false
  }
}

async function loadSuggestions() {
  try {
    const res = await fetch('http://localhost:5001/api/suggestions')
    const data = await res.json()

    if (!res.ok) {
      console.error(data.message || 'Failed to load suggestions')
      suggestions.value = []
      return
    }

    suggestions.value = data
  } catch (e) {
    console.error('suggestions error', e)
    suggestions.value = []
  }
}

async function likeSuggestion(id) {
  try {
    const savedUser = localStorage.getItem('eventhiveUser')
    const user = savedUser ? JSON.parse(savedUser) : null

    if (!user?.email) {
      alert('Please log in first.')
      return
    }

    const response = await fetch(
      `http://localhost:5001/api/suggestions/${id}/like`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || 'Could not like suggestion.')
      return
    }

    await loadSuggestions()
  } catch (e) {
    console.error('like error', e)
    alert('There was a connection error.')
  }
}

async function saveEvent(eventId) {
  try {
    const savedUser = localStorage.getItem('eventhiveUser')
    const user = savedUser ? JSON.parse(savedUser) : null

    if (!user?.email) {
      alert('Please log in first.')
      return
    }

    const response = await fetch(
      `http://localhost:5001/api/events/${eventId}/save`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.message || 'Could not save event.')
      return
    }

    alert('Event saved!')
  } catch (error) {
    console.error('Save event error:', error)
    alert('There was a connection error.')
  }
}

onMounted(async () => {
  currentUser.value = JSON.parse(localStorage.getItem('eventhiveUser') || 'null')

  await Promise.all([
    loadEvents(),
    loadSuggestions()
  ])

  $('#locationFilter').on('keydown', function (e) {
    if (e.key === 'Enter') $('#filterBtn').trigger('click')
  })
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
  color: #243047;
  position: relative;
  overflow: hidden;
}

.home-page::before {
  content: '';
  position: absolute;
  top: 70px;
  left: -50px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(139, 110, 199, 0.16) 0%, rgba(247, 236, 141, 0.1) 45%, transparent 75%);
  filter: blur(22px);
  pointer-events: none;
}

.home-page::after {
  content: '';
  position: absolute;
  top: 520px;
  right: -70px;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(246, 169, 58, 0.1) 0%, rgba(166, 134, 210, 0.12) 42%, transparent 75%);
  filter: blur(22px);
  pointer-events: none;
}

.hero-section {
  max-width: 1180px;
  margin: 0 auto;
  padding: 72px 24px 48px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 34px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content h1 {
  font-size: 70px;
  line-height: 0.98;
  letter-spacing: -2px;
  margin: 0 0 18px;
  color: #243047;
  max-width: 700px;
}

.hero-content p {
  font-size: 22px;
  line-height: 1.55;
  color: #5b6475;
  max-width: 560px;
  margin-bottom: 28px;
}

.hero-buttons {
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
  padding: 14px 24px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #8b6ec7 0%, #a686d2 55%, #d49a77 100%);
  color: white;
  box-shadow: 0 10px 24px rgba(139, 110, 199, 0.18);
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.72);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  box-shadow: 0 8px 18px rgba(72, 59, 102, 0.06);
}

.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-2px);
}

.hero-visual {
  min-height: 430px;
  border-radius: 34px;
  background:
    linear-gradient(rgba(139, 110, 199, 0.18), rgba(247, 236, 141, 0.1)),
    url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80')
    center/cover;
  box-shadow: 0 18px 42px rgba(72, 59, 102, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.search-preview {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px 28px;
  position: relative;
  z-index: 1;
}

.search-box {
  background: rgba(255, 255, 255, 0.76);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.07);
  padding: 18px;
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr auto;
  gap: 14px;
}

.search-box input,
.search-box select {
  border: 1px solid rgba(139, 110, 199, 0.14);
  background: #fffdfb;
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 15px;
  color: #243047;
  outline: none;
}

.featured-section,
.categories-section,
.how-it-works {
  max-width: 1180px;
  margin: 0 auto;
  padding: 26px 24px 54px;
  position: relative;
  z-index: 1;
}

.featured-section h2,
.categories-section h2,
.how-it-works h2 {
  font-size: 48px;
  margin: 0 0 24px;
  letter-spacing: -1px;
  color: #243047;
  text-align: center;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: 22px;
}

.event-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 20px;
  margin-bottom: 18px;
  display: block;
}

.event-card {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  padding: 18px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.07);
  position: relative;
  overflow: hidden;
}

.event-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 6px;
  width: 100%;
  background: linear-gradient(90deg, #8b6ec7 0%, #f7ec8d 55%, #f6a93a 100%);
}

.event-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.event-card-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-card h3 {
  font-size: 28px;
  margin: 4px 0 0;
  color: #243047;
  letter-spacing: -0.5px;
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

.event-location {
  font-size: 18px;
  color: #4a5568;
  margin-bottom: 10px;
}

.event-description {
  font-size: 16px;
  line-height: 1.6;
  color: #5b6475;
  margin-bottom: 18px;
}

.small-btn {
  padding: 12px 18px;
  border-radius: 16px;
  font-size: 15px;
}

.card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}

.category-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 24px;
  padding: 28px 16px;
  text-align: center;
  font-weight: 800;
  font-size: 18px;
  color: #243047;
  box-shadow: 0 12px 28px rgba(72, 59, 102, 0.05);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;

}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(72, 59, 102, 0.08);
}

.like-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.like-count {
  font-weight: 600;
  color: #555;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.step-card {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  padding: 28px 24px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.06);
}

.step-card h3 {
  font-size: 24px;
  margin: 0 0 12px;
  color: #243047;
}

.step-card p {
  font-size: 17px;
  line-height: 1.6;
  color: #5b6475;
  margin: 0;
}

@media (max-width: 960px) {
  .hero-section {
    grid-template-columns: 1fr;
  }

  .hero-content h1 {
    font-size: 54px;
  }

  .hero-content p {
    font-size: 19px;
  }

  .hero-visual {
    min-height: 300px;
  }

  .search-box {
    grid-template-columns: 1fr;
  }

  .featured-section h2,
  .categories-section h2,
  .how-it-works h2 {
    font-size: 38px;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-section,
  .search-preview,
  .featured-section,
  .categories-section,
  .how-it-works {
    padding-left: 16px;
    padding-right: 16px;
  }

  .hero-content h1 {
    font-size: 44px;
  }

  .event-card-top {
    flex-direction: column;
    gap: 12px;
  }
}
</style>