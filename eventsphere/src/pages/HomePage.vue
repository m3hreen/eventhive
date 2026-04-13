<template>
    <main>
      <section class="hero">
        <div class="hero-content">
          <h1>Plan, discover, and manage unforgettable events</h1>
          <p>
            Browse events, RSVP instantly, manage guest lists, and track attendance
            from one powerful platform.
          </p>
  
          <div class="hero-buttons">
            <button class="primary-btn">Explore Events</button>
            <button class="secondary-btn">Create an Event</button>
          </div>
        </div>
      </section>
  
      <section class="search-preview">
        <div class="search-box">
          <input type="text" placeholder="Search events..." />
          <select>
            <option>All Categories</option>
            <option>Music</option>
            <option>Workshops</option>
            <option>Networking</option>
            <option>Sports</option>
          </select>
          <input type="date" />
          <input type="text" placeholder="City" />
          <button class="primary-btn">Search</button>
        </div>
      </section>
  
      <section id="featured" class="featured-section">
        <h2>Featured Events</h2>
        <div class="event-grid">
          <div class="event-card" v-for="event in featuredEvents" :key="event.id">
            <img :src="event.image" :alt="event.title" />
            <div class="event-card-body">
              <h3>{{ event.title }}</h3>
              <p>{{ event.date }}</p>
              <p>{{ event.location }}</p>
              <button class="primary-btn small-btn">View Details</button>
            </div>
          </div>
        </div>
      </section>
  
      <section id="categories" class="categories-section">
        <h2>Browse by Category</h2>
        <div class="categories-grid">
          <div class="category-card" v-for="category in categories" :key="category">
            {{ category }}
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
  const featuredEvents = [
    {
      id: 1,
      title: 'Tech Networking Night',
      date: 'April 20, 2026',
      location: 'Toronto, ON',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 2,
      title: 'Live Music Festival',
      date: 'May 5, 2026',
      location: 'Mississauga, ON',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80'
    },
    {
      id: 3,
      title: 'Startup Workshop',
      date: 'May 15, 2026',
      location: 'North York, ON',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'
    }
  ]
  
  const categories = [
    'Music',
    'Workshops',
    'Networking',
    'Sports',
    'Community',
    'Conferences'
  ]
  </script>