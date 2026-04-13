<template>
    <main class="saved-page">
      <div class="saved-container">
        <h1>Saved Events</h1>
        <p class="subtitle">Events you bookmarked for later</p>
  
        <div v-if="events.length" class="events-grid">
          <div
            class="event-card"
            v-for="event in events"
            :key="event._id"
          >
            <img
              v-if="event.image"
              :src="event.image"
              class="event-image"
            />
  
            <h3>{{ event.title }}</h3>
            <span class="category-badge">{{ event.category }}</span>
  
            <p class="event-location">{{ event.location }}</p>
            <p class="event-description">{{ event.description }}</p>
  
            <router-link
              :to="`/event/${event._id}`"
              class="view-btn"
            >
              View Event
            </router-link>
          </div>
        </div>
  
        <p v-else class="empty">
          No saved events yet
        </p>
      </div>
    </main>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  
  const events = ref([])
  
  async function loadSaved() {
    try {
      const savedUser = localStorage.getItem('eventhiveUser')
      const user = savedUser ? JSON.parse(savedUser) : null
  
      if (!user?.email) return
  
      const res = await fetch(
  `http://localhost:5001/api/saved-events?email=${encodeURIComponent(user.email)}`
)
  
      const data = await res.json()
      events.value = data
    } catch (e) {
      console.error(e)
    }
  }
  
  onMounted(() => {
    loadSaved()
  })
  </script>
  
  <style scoped>
  .saved-page {
    min-height: 100vh;
    padding: 48px 24px;
    background: linear-gradient(180deg,#f8f5ef,#f6f1ea);
  }
  
  .saved-container {
    max-width: 1180px;
    margin: auto;
  }
  
  h1 {
    font-size: 48px;
  }
  
  .subtitle {
    color:#666;
    margin-bottom:24px;
  }
  
  .events-grid {
    display:grid;
    grid-template-columns: repeat(auto-fill,minmax(280px,1fr));
    gap:20px;
  }
  
  .event-card {
    background:white;
    padding:20px;
    border-radius:18px;
    box-shadow:0 10px 20px rgba(0,0,0,0.05);
  }
  
  .event-image {
    width:100%;
    height:180px;
    object-fit:cover;
    border-radius:12px;
    margin-bottom:12px;
  }
  
  .view-btn {
    display:inline-block;
    margin-top:10px;
    background:#8b6ec7;
    color:white;
    padding:8px 14px;
    border-radius:10px;
    text-decoration:none;
  }
  
  .empty {
    color:#666;
  }
  </style>