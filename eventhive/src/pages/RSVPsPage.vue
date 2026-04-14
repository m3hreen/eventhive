<template>
  <main class="rsvps-page">
    <section class="header-section">
      <h1>My RSVPs</h1>
      <p>All the events you've RSVP-ed to in one place.</p>
    </section>

    <div v-if="loading" class="empty-state">
      <p>Loading your events…</p>
    </div>

    <div v-else-if="rsvpedEvents.length === 0" class="empty-state">
      <p>You haven’t RSVP’d to any events yet.</p>
      <router-link to="/" class="secondary-btn">
        Explore Events
      </router-link>
    </div>

    <section v-else class="featured-section">
      <div class="featured-grid">
        <div
          class="event-card"
          v-for="event in rsvpedEvents"
          :key="event._id || event.id"
        >
          <img
            v-if="event.image"
            :src="event.image"
            :alt="event.title"
            class="event-image"
          />

          <div class="event-card-top">
            <div class="event-card-main">
              <h3>{{ event.title }}</h3>
              <span class="category-badge">
                {{ event.category }}
              </span>
            </div>

            <p class="event-date">
                <strong>Date:</strong> {{ formatDate(event.date) }}
            </p>
          </div>

          <p class="event-location">
            <strong>Location:</strong> {{ event.location }}
          </p>

          <p class="event-description">
            {{ event.description }}
          </p>

          <div class="rsvp-status-row">
            <span class="rsvp-status-label">Your RSVP:</span>
            <span
                class="rsvp-status-pill"
                :class="getStatusClass(event.rsvpStatus)"
            >
                {{ event.rsvpStatus || 'Unknown' }}
            </span>
          </div>

          <div class="card-actions">
            <router-link
              :to="`/event/${event._id || event.id}`"
              class="primary-btn small-btn"
            >
              Edit
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  data() {
    return {
      rsvpedEvents: [],
      loading: true
    };
  },
  methods: {
    async fetchRsvps() {
      try {
        const user = JSON.parse(localStorage.getItem("eventhiveUser"));

        const res = await fetch(
          `http://localhost:5001/api/rsvps?email=${user.email}`
        );

        const data = await res.json();

        if (!res.ok) {
          this.rsvpedEvents = [];
          return;
        }

        this.rsvpedEvents = data;
      } catch (err) {
        console.error(err);
        this.rsvpedEvents = [];
      } finally {
        this.loading = false;
      }
    },

    editRsvp(eventId) {
        // redirect to event page
        this.$router.push(`/event/${eventId}`)
    },

    async cancelRsvp(eventId) {
      try {
        const user = JSON.parse(localStorage.getItem("eventhiveUser"));

        await fetch(
          `http://localhost:5001/api/rsvps/${eventId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: user.email })
          }
        );

        this.rsvpedEvents = this.rsvpedEvents.filter(
          e => (e._id || e.id) !== eventId
        );
      } catch (err) {
        console.error(err);
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },

    getStatusClass(status) {
        if (status === 'Attending') return 'status-attending'
        if (status === 'Maybe') return 'status-maybe'
        if (status === 'Declined') return 'status-declined'
        return 'status-unknown'
    }
  },

  mounted() {
    this.fetchRsvps();
  }
};
</script>

<style scoped>
.rsvps-page {
  min-height: 100vh;
  color: #243047;
  padding: 40px 24px;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
}

.header-section h1 {
  font-size: 48px;
  color: #243047;
  margin-bottom: 10px;
}

.header-section p {
  color: #5b6475;
  font-size: 18px;
}

/* reuse same section layout */
.featured-section {
  max-width: 1180px;
  margin: 0 auto;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: 22px;
}

/* EXACT SAME CARD STYLE */
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
  height: 6px;
  width: 100%;
  background: linear-gradient(90deg, #8b6ec7 0%, #f7ec8d 55%, #f6a93a 100%);
}

.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 20px;
  margin-bottom: 16px;
}

.event-card-top {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;
}

.event-card-main {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-card h3 {
  font-size: 26px;
  color: #243047;
  margin: 0;
  line-height: 1.15;
}

.category-badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  background: rgba(139, 110, 199, 0.12);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.date-pill {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  background: linear-gradient(135deg, #f7ec8d, #f8dfb3);
  color: #243047;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
}

.event-location {
  font-size: 16px;
  color: #4a5568;
  margin: 0;
}

.event-location strong {
  color: #243047;
  font-weight: 700;
}

.event-description {
  color: #5b6475;
  margin-bottom: 16px;
}


.primary-btn {
  background: linear-gradient(135deg, #8b6ec7, #d49a77);
  color: white;
  border-radius: 16px;
  padding: 10px 16px;
  border: none;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(139, 110, 199, 0.18);
  color: #6f54a8;
  border-radius: 16px;
  padding: 10px 16px;
}

.card-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.empty-state {
  text-align: center;
  margin-top: 30px;
}

.empty-state p {
  color: #5b6475;
  margin-bottom: 12px;
}

.rsvp-status-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.rsvp-status-label {
  font-weight: 700;
  color: #243047;
  font-size: 14px;
}

.rsvp-status-pill {
  background: rgba(139, 110, 199, 0.12);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.status-attending {
  background: rgba(76, 175, 80, 0.14);
  color: #2e7d32;
  border: 1px solid rgba(76, 175, 80, 0.24);
}

.status-maybe {
  background: rgba(247, 236, 141, 0.28);
  color: #8a6d1f;
  border: 1px solid rgba(247, 236, 141, 0.42);
}

.status-declined {
  background: rgba(229, 115, 115, 0.14);
  color: #c62828;
  border: 1px solid rgba(229, 115, 115, 0.24);
}

.status-unknown {
  background: rgba(139, 110, 199, 0.12);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
}

.event-date {
  font-size: 16px;
  color: #4a5568;
  margin: 0;
}

.event-date strong {
  color: #243047;
  font-weight: 700;
}

</style>