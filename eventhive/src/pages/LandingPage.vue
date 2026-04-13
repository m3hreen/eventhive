<template>
  <main class="landing-page">
    <section class="landing-hero">
      <div class="landing-copy">
        <div class="eyebrow-wrapper">
            <span class="eyebrow">Your all-in-one event platform</span>
        </div>
        
        <h1>Bringing People Together</h1>
        <p>
          Discover local experiences, create beautiful event pages, manage guests,
          and keep every RSVP, message, and detail in one place with EventHive.
        </p>
      </div>

      <div class="landing-visual">
        <div class="visual-card main-card" v-if="mostPopularEvent">
            <span class="card-badge">Most Popular</span>
            <h3>{{ mostPopularEvent.title }}</h3>
            <p>
                {{ mostPopularEvent.location }} • {{ mostPopularEvent.date }} • {{ mostPopularEvent.category }}
            </p>
        </div>

        <div class="visual-card main-card" v-else>
            <span class="card-badge">Featured</span>
            <h3>Discover Top Events</h3>
            <p>Browse what’s trending in your community with EventHive.</p>
        </div>

        <div class="visual-card floating-card top-card">
          <span class="mini-label">RSVPs</span>
        </div>

        <div class="visual-card floating-card bottom-card">
          <span class="mini-label">Guest List</span>
        </div>
      </div>
    </section>

    <section class="landing-features">
      <h2>Everything You Need to Host and Attend with Ease</h2>

      <div class="features-grid">
        <article class="feature-card">
          <h3>Discover Events</h3>
          <p>
            Browse curated events by category, search by city, and explore
            experiences tailored to your interests.
          </p>
        </article>

        <article class="feature-card">
          <h3>Create With Confidence</h3>
          <p>
            Build event pages, organize schedules, and keep every important detail
            in one polished place.
          </p>
        </article>

        <article class="feature-card">
          <h3>Manage Your Community</h3>
          <p>
            Track RSVPs, view guest lists, and stay connected with attendees from
            one beautiful dashboard.
          </p>
        </article>
      </div>
    </section>

    <section class="landing-cta">
      <div class="cta-card">
        <h2>Ready to start planning?</h2>
        <p>
          Join EventHive and make event discovery, organization, and guest
          management feel effortless.
        </p>

        <div class="hero-buttons vertical">
          <router-link to="/signup" class="primary-btn">Create an Account</router-link>
          <router-link to="/login" class="secondary-btn">I Already Have One</router-link>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
// no script needed yet
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  color: #243047;
  position: relative;
  overflow: hidden;

  /* keep your soft base color */
  background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
}

.landing-page::before {
  content: '';
  position: absolute;
  inset: 0;

  background: url('/hexagon-background.jpg') center/cover no-repeat;

  opacity: 0.50;
  pointer-events: none;
}

.landing-page::after {
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

.landing-hero,
.landing-features,
.landing-how,
.landing-cta {
  max-width: 1180px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
  position: relative;
  z-index: 1;
}

.landing-hero {
  padding-top: 84px;
  padding-bottom: 64px;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 36px;
  align-items: center;
}

.eyebrow {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(140, 110, 199, 0.42);
  color: #243047bc;
  font-size: 20px;
  font-weight: 500;
  border: 1px solid rgba(166, 134, 210, 0.14);
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.08);


}

.landing-copy h1 {
  font-size: 70px;
  line-height: 0.96;
  letter-spacing: -2px;
  margin: 0 0 20px;
  color: #243047;
  font-weight: 600;
}

.landing-copy p {
  font-size: 22px;
  line-height: 1.6;
  color: #243047bc;
  max-width: 580px;
  margin: 0 0 30px;
}

.hero-buttons {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #8b6ec7 0%, #a686d2 55%, #d49a77 100%);
  color: white;
  box-shadow: 0 10px 24px rgba(139, 110, 199, 0.18);
  padding: 15px 20px;
  font-size: 25px;
}

.secondary-btn {
  background: transparent;
  color: #6f54a8;
  font-weight: 500;
  padding: 5px 24px;
}

.primary-btn:hover,
.secondary-btn:hover {
  transform: translateY(-2px);
}

.hero-stats {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  max-width: 600px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 24px;
  padding: 18px;
  box-shadow: 0 12px 28px rgba(72, 59, 102, 0.05);
}

.stat-card strong {
  display: block;
  font-size: 17px;
  margin-bottom: 8px;
  color: #243047;
}

.stat-card span {
  color: #5b6475;
  line-height: 1.5;
  font-size: 15px;
}

.landing-visual {
  min-height: 470px;
  position: relative;
  border-radius: 34px;

  background: linear-gradient(
    130deg,
    #a686d2 25%,
    #f7ec8d 75%,
    #f6a93a 100%
  );

  box-shadow: 0 18px 42px rgba(72, 59, 102, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  overflow: hidden;
}

.visual-card {
  background: #fdf3dc;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(166, 134, 210, 0.14);
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.08);
}

.main-card {
  position: absolute;
  left: 28px;
  bottom: 28px;
  width: 300px;
  border-radius: 26px;
  padding: 22px;
}

.main-card h3 {
  font-size: 28px;
  margin: 0 0 10px;
  color: #243047;
}

.main-card p {
  margin: 0;
  color: #243047bc;
  font-size: 16px;
}

.card-badge,
.mini-label {
  display: inline-block;
  background: rgba(139, 110, 199, 0.12);
  color: #6f54a8;
  border: 1px solid rgba(139, 110, 199, 0.18);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
}

.card-badge {
  margin-bottom: 14px;
}

.floating-card {
  position: absolute;
  border-radius: 20px;
  padding: 14px 16px;
}

.top-card {
  top: 24px;
  right: 24px;
}

.bottom-card {
  right: 28px;
  bottom: 34px;
}

.landing-features,
.landing-how {
  padding-top: 12px;
  padding-bottom: 56px;
}

.landing-features h2,
.landing-how h2,
.cta-card h2 {
  font-size: 48px;
  font-weight:600;
  margin: 0 0 24px;
  letter-spacing: -1px;
  color: #243047;
  text-align: center;
}

.features-grid,
.steps-grid {
  display: grid;
  gap: 22px;
}

.features-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.steps-grid {
  grid-template-columns: repeat(3, 1fr);
}

.feature-card,
.step-card,
.cta-card {
  background: #fdf3dc;
  border: 1px solid rgba(166, 134, 210, 0.14);
  border-radius: 28px;
  box-shadow: 0 14px 34px rgba(72, 59, 102, 0.07);
  text-align: center;
}

.feature-card,
.step-card {
  padding: 28px 24px;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
  background: linear-gradient(135deg, #8b6ec7 0%, #f6a93a 100%);
  color: white;
  font-size: 22px;
  font-weight: 700;
}

.feature-card h3,
.step-card h3 {
  font-size: 24px;
  margin: 0 0 12px;
  color: #243047;
}

.feature-card p,
.step-card p,
.cta-card p {
  font-size: 17px;
  line-height: 1.6;
  color: #243047bc;
  margin: 0;
}

.landing-cta {
  padding-top: 6px;
  padding-bottom: 80px;
}

.cta-card {
  padding: 40px 28px;
  text-align: center;
}

.cta-card p {
  max-width: 720px;
  margin: 0 auto 26px;
}

.cta-card .hero-buttons {
  justify-content: center;
}

@media (max-width: 960px) {
  .landing-hero {
    grid-template-columns: 1fr;
    padding-top: 64px;
  }

  .landing-copy h1 {
    font-size: 54px;
  }

  .landing-copy p {
    font-size: 19px;
  }

  .landing-visual {
    min-height: 360px;
  }

  .landing-features h2,
  .landing-how h2,
  .cta-card h2 {
    font-size: 38px;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .landing-hero,
  .landing-features,
  .landing-how,
  .landing-cta {
    padding-left: 16px;
    padding-right: 16px;
  }

  .landing-copy h1 {
    font-size: 44px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .main-card {
    width: calc(100% - 32px);
    left: 16px;
    bottom: 16px;
  }

  .top-card,
  .bottom-card {
    display: none;
  }
}
</style>