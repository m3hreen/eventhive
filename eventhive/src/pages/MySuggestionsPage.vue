<template>
    <main class="suggestions-page">
      <div class="suggestions-container">
        <div class="suggestions-header">
          <div>
            <p class="eyebrow">Attendee View</p>
            <h1>My Suggestions</h1>
            <p class="suggestions-subtitle">
              View all the event ideas you’ve submitted.
            </p>
          </div>
        </div>
  
        <div class="recent-suggestions" v-if="suggestions.length">
          <div class="suggestion-cards">
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
                <strong>Location:</strong>
                {{ suggestion.location || 'Open to any location' }}
              </p>
  
              <p class="suggestion-details">{{ suggestion.details }}</p>
  
              <div class="suggestion-footer">
                <span><strong>Likes:</strong> {{ suggestion.likes || 0 }}</span>
                <span><strong>By:</strong> {{ suggestion.submittedByName || 'Anonymous' }}</span>
              </div>
            </div>
          </div>
        </div>
  
        <p v-else class="empty-state">You have not submitted any suggestions yet.</p>
      </div>
    </main>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  
  const suggestions = ref([])
  
  async function fetchMySuggestions() {
    try {
      const savedUser = localStorage.getItem('eventhiveUser')
      const user = savedUser ? JSON.parse(savedUser) : null
  
      if (!user?.email) return
  
      const response = await fetch(
        `http://localhost:5001/api/suggestions?submittedBy=${encodeURIComponent(user.email)}`
      )
  
      const data = await response.json()
  
      if (!response.ok) return
  
      suggestions.value = data
    } catch (error) {
      console.error('Fetch my suggestions error:', error)
    }
  }
  
  onMounted(() => {
    fetchMySuggestions()
  })
  </script>
  
  <style scoped>
  .suggestions-page {
    min-height: 100vh;
    background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
    padding: 48px 24px 72px;
  }
  
  .suggestions-container {
    max-width: 1180px;
    margin: 0 auto;
  }
  
  .suggestions-header {
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
  
  .suggestions-header h1 {
    font-size: 58px;
    line-height: 1.02;
    letter-spacing: -1.5px;
    color: #243047;
    margin: 0 0 12px;
  }
  
  .suggestions-subtitle {
    font-size: 20px;
    color: #5b6475;
    margin: 0;
  }
  
  .recent-suggestions {
    margin-top: 20px;
  }
  
  .suggestion-cards {
    display: grid;
    gap: 20px;
  }
  
  .suggestion-card {
    background: rgba(255, 255, 255, 0.84);
    border: 1px solid rgba(166, 134, 210, 0.14);
    border-radius: 28px;
    padding: 24px;
    box-shadow: 0 14px 34px rgba(72, 59, 102, 0.06);
  }
  
  .suggestion-card-top {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .suggestion-card h3 {
    font-size: 28px;
    color: #243047;
    margin: 0 0 10px;
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
    margin-top: 24px;
  }
  
  @media (max-width: 768px) {
    .suggestions-header h1 {
      font-size: 42px;
    }
  
    .suggestion-card-top {
      flex-direction: column;
    }
  
    .suggestion-footer {
      flex-direction: column;
    }
  }
  </style>