<template>
  <main class="dashboard-page">
    <div class="dashboard-container">

      <section class="dashboard-hero">
        <div class="hero-text">
          <p class="eyebrow">Organizer Dashboard</p>
          <h1>Understand what attendees want</h1>
          <p class="dashboard-subtitle">
            Review suggestions, track likes, and identify the best events to create next.
          </p>
        </div>

        <div class="hero-image"></div>
      </section>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h2>Total Suggestions</h2>
          <p>{{ stats.totalSuggestions || 0 }}</p>
        </div>

        <div class="dashboard-card">
          <h2>Total Likes</h2>
          <p>{{ stats.totalLikes || 0 }}</p>
        </div>

        <div class="dashboard-card">
          <h2>Top Category</h2>
          <p>{{ stats.topCategory || 'N/A' }}</p>
        </div>

        <div class="dashboard-card">
          <h2>Top Location</h2>
          <p>{{ stats.topLocation || 'N/A' }}</p>
        </div>
      </div>

      <div class="dashboard-section" v-if="stats.mostLiked">
        <h2>Most Requested Event</h2>

        <div class="suggestion-highlight">
          <h3>{{ stats.mostLiked.title }}</h3>
          <span class="category-badge">{{ stats.mostLiked.category }}</span>

          <p><strong>Location:</strong> {{ stats.mostLiked.location || 'Any location' }}</p>
          <p><strong>Preferred Date:</strong> {{ stats.mostLiked.preferredDate || 'Flexible' }}</p>
          <p>{{ stats.mostLiked.details }}</p>

          <div class="suggestion-footer">
            <span>{{ stats.mostLiked.likes || 0 }} likes</span>
            <span>{{ stats.mostLiked.submittedByName || 'Anonymous' }}</span>
          </div>
        </div>
      </div>

      <div class="dashboard-section">
        <h2>All Suggestions</h2>

        <div class="suggestion-cards" v-if="suggestions.length">
          <div
            class="suggestion-card"
            v-for="suggestion in suggestions"
            :key="suggestion._id"
          >
            <div class="suggestion-card-top">
              <div>
                <h3>{{ suggestion.title }}</h3>
                <span class="category-badge">{{ suggestion.category }}</span>
              </div>

              <span class="date-pill">
                {{ suggestion.preferredDate || 'Flexible' }}
              </span>
            </div>

            <p class="suggestion-location">
              {{ suggestion.location || 'Open location' }}
            </p>

            <p class="suggestion-details">
              {{ suggestion.details }}
            </p>

            <div class="suggestion-footer">
              <span>{{ suggestion.likes || 0 }} likes</span>
              <span>{{ suggestion.submittedByName || 'Anonymous' }}</span>
            </div>
          </div>
        </div>

        <p v-else class="empty-state">No suggestions yet.</p>
      </div>

    </div>
  </main>
</template>
<script setup>
import { onMounted, ref } from 'vue'

const suggestions = ref([])
const stats = ref({})

async function fetchSuggestions() {
  try {
    const response = await fetch('http://localhost:5001/api/suggestions')
    const data = await response.json()

    if (!response.ok) {
      console.error(data.message || 'Failed to fetch suggestions.')
      return
    }

    suggestions.value = data
  } catch (error) {
    console.error('Fetch suggestions error:', error)
  }
}

async function fetchStats() {
  try {
    const response = await fetch('http://localhost:5001/api/suggestions/stats')
    const data = await response.json()

    if (!response.ok) {
      console.error(data.message || 'Failed to fetch suggestion stats.')
      return
    }

    stats.value = data
  } catch (error) {
    console.error('Fetch suggestion stats error:', error)
  }
}

onMounted(() => {
  fetchSuggestions()
  fetchStats()
})
</script>

<style scoped>
.dashboard-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
  align-items: center;
  margin-bottom: 28px;
}

.hero-text {
  background: rgba(255,255,255,.75);
  border-radius: 30px;
  padding: 30px;
  border: 1px solid rgba(166,134,210,.14);
}

.eyebrow {
  font-size: 13px;
  font-weight: 700;
  color: #8b6ec7;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.hero-image {
  min-height: 260px;
  border-radius: 28px;
  background:
  linear-gradient(rgba(139,110,199,.15),rgba(247,236,141,.05)),
  url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')
  center/cover;
}.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
  padding: 48px 24px 72px;
}

.dashboard-container {
  max-width: 1180px;
  margin: 0 auto;
}

h1 {
  font-size: 58px;
  line-height: 1.02;
  letter-spacing: -1.5px;
  color: #243047;
  margin: 0 0 12px;
}

.dashboard-subtitle {
  font-size: 20px;
  color: #5b6475;
  margin: 0 0 30px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.06);
}

.dashboard-card h2 {
  font-size: 18px;
  color: #5b6475;
  margin: 0 0 10px;
}

.dashboard-card p {
  font-size: 32px;
  font-weight: 800;
  color: #243047;
  margin: 0;
}

.dashboard-section {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.06);
  margin-bottom: 26px;
}

.dashboard-section h2 {
  font-size: 32px;
  color: #243047;
  margin: 0 0 18px;
}

.suggestion-highlight h3,
.suggestion-card h3 {
  font-size: 26px;
  color: #243047;
  margin: 0 0 10px;
}

.suggestion-cards {
  display: grid;
  gap: 20px;
}

.suggestion-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 24px;
  padding: 22px;
}

.suggestion-card-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
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

.suggestion-location,
.suggestion-details,
.suggestion-highlight p,
.suggestion-footer {
  font-size: 17px;
  line-height: 1.6;
  color: #4a5568;
  margin: 0 0 10px;
}

.suggestion-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 12px;
  font-weight: 600;
}

.empty-state {
  font-size: 18px;
  color: #5b6475;
  margin: 0;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding-left: 16px;
    padding-right: 16px;
  }

  h1 {
    font-size: 42px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .suggestion-card-top {
    flex-direction: column;
  }

  .suggestion-footer {
    flex-direction: column;
  }
}
</style>