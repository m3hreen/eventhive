<template>
    <main class="suggestions-page">
      <div class="suggestions-container">
        <div class="suggestions-header">
          <div>
            <p class="eyebrow">Attendee View</p>
            <h1>Event Suggestions</h1>
            <p class="suggestions-subtitle">
              Share event ideas you'd love to see on EventHive.
            </p>
          </div>
        </div>
  
        <div class="suggestions-shell">
          <div class="suggestions-left">
            <div class="suggestions-overlay">
              <h2>Help shape future events</h2>
              <p>
                Suggest a category, theme, location, or full event concept.
                Your ideas can inspire the next featured experience.
              </p>
            </div>
          </div>
  
          <div class="suggestions-right">
            <form class="suggestions-form" @submit.prevent="handleSubmit">
              <h2>Submit a Suggestion</h2>
  
              <label>Suggestion Title</label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Ex. Pottery Night for Beginners"
              />
  
              <label>Category</label>
              <select v-model="form.category">
                <option value="">Select a category</option>
                <option>Music</option>
                <option>Workshops</option>
                <option>Networking</option>
                <option>Sports</option>
                <option>Community</option>
                <option>Conferences</option>
                <option>Food</option>
                <option>Art</option>
              </select>
  
              <label>Preferred Location</label>
              <input
                v-model="form.location"
                type="text"
                placeholder="Ex. Mississauga, Toronto, Vaughan"
              />
  
              <label>Preferred Date (Optional)</label>
              <input v-model="form.preferredDate" type="date" />
  
              <label>Details</label>
              <textarea
                v-model="form.details"
                rows="6"
                placeholder="Tell us what kind of event you want, who it is for, and why it would be exciting."
              ></textarea>
  
              <button type="submit" class="submit-btn" :disabled="loading">
                {{ loading ? 'Submitting...' : 'Submit Suggestion' }}
              </button>
  
              <p v-if="message" class="success-message">{{ message }}</p>
              <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            </form>
          </div>
        </div>
  
        <div class="recent-suggestions" v-if="suggestions.length">
          <h2>Your Recent Suggestions</h2>
  
          <div class="suggestion-cards">
            <div class="suggestion-card" v-for="suggestion in suggestions" :key="suggestion._id">
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
                <strong>Location:</strong> {{ suggestion.location || 'Open to any location' }}
              </p>
  
              <p class="suggestion-details">{{ suggestion.details }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </template>
  
  <script setup>
  import { onMounted, reactive, ref } from 'vue'
  
  const loading = ref(false)
  const message = ref('')
  const errorMessage = ref('')
  const suggestions = ref([])
  
  const form = reactive({
    title: '',
    category: '',
    location: '',
    preferredDate: '',
    details: ''
  })
  
  async function fetchSuggestions() {
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
      console.error('Fetch suggestions error:', error)
    }
  }
  
  async function handleSubmit() {
    message.value = ''
    errorMessage.value = ''
  
    if (!form.title || !form.category || !form.details) {
      errorMessage.value = 'Please fill in the title, category, and details.'
      return
    }
  
    try {
      loading.value = true
  
      const savedUser = localStorage.getItem('eventhiveUser')
      const user = savedUser ? JSON.parse(savedUser) : null
  
      const response = await fetch('http://localhost:5001/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          submittedBy: user?.email || null,
          submittedByName: user?.name || 'Anonymous'
        })
      })
  
      const data = await response.json()
  
      if (!response.ok) {
        errorMessage.value = data.message || 'Could not submit suggestion.'
        return
      }
  
      message.value = 'Suggestion submitted successfully.'
  
      form.title = ''
      form.category = ''
      form.location = ''
      form.preferredDate = ''
      form.details = ''
  
      fetchSuggestions()
    } catch (error) {
      console.error('Submit suggestion error:', error)
      errorMessage.value = 'Could not connect to the server.'
    } finally {
      loading.value = false
    }
  }
  
  onMounted(() => {
    fetchSuggestions()
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
  
  .suggestions-shell {
    display: grid;
    grid-template-columns: 0.95fr 1.05fr;
    overflow: hidden;
    border-radius: 30px;
    box-shadow: 0 18px 42px rgba(72, 59, 102, 0.08);
    margin-bottom: 40px;
  }
  
  .suggestions-left {
    min-height: 540px;
    background:
      linear-gradient(rgba(139, 110, 199, 0.3), rgba(247, 236, 141, 0.12)),
      url('https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80')
      center/cover;
    display: flex;
    align-items: flex-end;
  }
  
  .suggestions-overlay {
    color: white;
    padding: 40px;
    max-width: 420px;
  }
  
  .suggestions-overlay h2 {
    font-size: 42px;
    line-height: 1.05;
    margin: 0 0 16px;
  }
  
  .suggestions-overlay p {
    font-size: 20px;
    line-height: 1.6;
    margin: 0;
  }
  
  .suggestions-right {
    background: rgba(255, 255, 255, 0.88);
    padding: 38px;
  }
  
  .suggestions-form h2 {
    font-size: 34px;
    color: #243047;
    margin: 0 0 20px;
  }
  
  .suggestions-form label {
    display: block;
    font-weight: 700;
    color: #243047;
    margin: 14px 0 8px;
  }
  
  .suggestions-form input,
  .suggestions-form select,
  .suggestions-form textarea {
    width: 100%;
    border: 1px solid rgba(139, 110, 199, 0.14);
    background: #fffdfb;
    border-radius: 18px;
    padding: 14px 16px;
    font-size: 15px;
    color: #243047;
    outline: none;
  }
  
  .submit-btn {
    margin-top: 18px;
    background: linear-gradient(135deg, #8b6ec7 0%, #a686d2 55%, #d49a77 100%);
    color: white;
    border: none;
    border-radius: 18px;
    padding: 14px 24px;
    font-weight: 700;
    cursor: pointer;
  }
  
  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .success-message {
    margin-top: 14px;
    color: #166534;
    background: #ecfdf3;
    border: 1px solid #bbf7d0;
    padding: 12px 14px;
    border-radius: 14px;
    display: inline-block;
  }
  
  .error-message {
    margin-top: 14px;
    color: #8d5b46;
    background: #fff3ef;
    border: 1px solid #f0d4ca;
    padding: 12px 14px;
    border-radius: 14px;
    display: inline-block;
  }
  
  .recent-suggestions h2 {
    font-size: 36px;
    color: #243047;
    margin-bottom: 20px;
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
  .suggestion-details {
    font-size: 17px;
    line-height: 1.6;
    color: #4a5568;
    margin: 0 0 10px;
  }
  
  @media (max-width: 900px) {
    .suggestions-shell {
      grid-template-columns: 1fr;
    }
  
    .suggestions-left {
      min-height: 260px;
    }
  
    .suggestions-header h1 {
      font-size: 42px;
    }
  }
  </style>