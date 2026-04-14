<template>
  <main class="dashboard-page">
    <div class="dashboard-container">

      <section class="dashboard-hero">
        <div class="hero-text">
          <p class="eyebrow">Organizer Dashboard</p>
          <h1>Understand What Attendees Want</h1>
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
  .dashboard-page {
    min-height: 100vh;
    padding: 48px 24px 72px;
    color: #243047;
    position: relative;
    overflow: hidden;
    background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
  }

  .dashboard-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('/hexagon-background.jpg') center/cover no-repeat;
    opacity: 0.50;
    pointer-events: none;
  }

  .dashboard-page::after {
    content: '';
    position: absolute;
    top: 520px;
    right: -70px;
    width: 280px;
    height: 280px;
    background: radial-gradient(
      circle,
      rgba(246, 169, 58, 0.1) 0%,
      rgba(166, 134, 210, 0.12) 42%,
      transparent 75%
    );
    filter: blur(22px);
    pointer-events: none;
  }

  .dashboard-container {
    position: relative;
    z-index: 2;
    max-width: 1180px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .dashboard-hero {
    position: relative;
    display: block;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 28px;
    align-items: center;
  }

  .dashboard-hero::after {
    content: '';
    position: absolute;
    width: 320px;
    height: 320px;
    right: 80px;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 236, 165, 0.35) 0%,
      rgba(255, 236, 165, 0.12) 45%,
      transparent 75%
    );
    filter: blur(16px);
    pointer-events: none;
  }

  .hero-text {
    background: rgba(255, 251, 244, 0.9);
    border-radius: 36px;
    padding: 34px 36px;
    box-shadow:
      0 18px 36px rgba(72, 59, 102, 0.08),
      0 4px 12px rgba(255, 255, 255, 0.35) inset;
  }

  .eyebrow {
    margin: 0 0 10px;
    font-size: 13px;
    font-weight: 800;
    color: #8b6ec7;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .hero-text h1 {
    margin: 0 0 14px;
    font-size: 62px;
    line-height: 0.95;
    letter-spacing: -1.8px;
    color: #243047;
  }

  .dashboard-subtitle {
    margin: 0;
    font-size: 20px;
    line-height: 1.55;
    color: #5b6475;
    max-width: 620px;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
  }

  .dashboard-card {
    position: relative;
    background: rgba(255, 251, 244, 0.88);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    padding: 20px 22px;
    border: 1px solid rgba(166, 134, 210, 0.16);
    box-shadow: 0 12px 26px rgba(72, 59, 102, 0.06);
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .dashboard-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: 999px;
    background: linear-gradient(90deg, #8b6ec7, #f7ec8d, #f6a93a);
  }

  .dashboard-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 42px rgba(72, 59, 102, 0.12);
  }

  .dashboard-card h2 {
    margin: 0 0 8px;
    font-size: 16px;
    color: #6b7280;
  }

  .dashboard-card p {
    font-size: 30px;
    font-weight: 900;
    color: #5f4aa8;
  }

  .dashboard-section {
    background: rgba(255, 251, 244, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 30px;
    padding: 24px;
    border: 1px solid rgba(166, 134, 210, 0.16);
    box-shadow: 0 14px 34px rgba(72, 59, 102, 0.07);
  }

  .dashboard-section h2 {
    margin: 0 0 18px;
    font-size: 34px;
    color: #243047;
  }

  .dashboard-card,
  .suggestion-card,
  .hero-text,
  .dashboard-section {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .dashboard-card:hover,
  .suggestion-card:hover,
  .hero-text:hover {
    transform: translateY(-3px);
  }

  .suggestion-highlight {
    background: rgba(255, 255, 255, 0.68);
    border: 1px solid rgba(166, 134, 210, 0.1);
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 10px 24px rgba(72, 59, 102, 0.04);
  }

  .suggestion-highlight h3 {
    margin: 0 0 10px;
    font-size: 32px;
    color: #243047;
  }

  .category-badge {
    display: inline-block;
    margin-bottom: 14px;
    background: #f2eaff;
    color: #7a5bc1;
    border: 1px solid rgba(139, 110, 199, 0.16);
    padding: 9px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 800;
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
  .suggestion-highlight p {
    margin: 0 0 10px;
    font-size: 16px;
    line-height: 1.6;
    color: #4a5568;
  }

  .suggestion-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .suggestion-card {
    position: relative;
    background: rgba(255, 255, 255, 0.88);
    box-shadow:
      0 12px 28px rgba(72, 59, 102, 0.06),
      0 3px 8px rgba(255, 255, 255, 0.25) inset;
    border: 1px solid rgba(166, 134, 210, 0.14);
    border-radius: 28px;
    padding: 20px;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .suggestion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #8b6ec7 0%, #f7ec8d 55%, #f6a93a 100%);
}

.suggestion-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 34px rgba(72, 59, 102, 0.1);
}

.suggestion-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 14px;
}

.suggestion-card h3 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #243047;
}

.suggestion-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(166, 134, 210, 0.12);
  font-weight: 700;
  color: #5b6475;
}

.empty-state {
  margin: 0;
  font-size: 18px;
  color: #5b6475;
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