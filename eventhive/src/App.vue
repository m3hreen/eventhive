<template>
  <div class="app-background">
    <Navbar />
    <router-view />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>

<style>
.app-background > * {
  position: relative;
  z-index: 1;
}

.app-background {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(180deg, #f8f5ef 0%, #f6f1ea 100%);
}

.app-background::before {
  content: '';
  position: fixed;
  inset: 0;
  background: url('/hexagon-background.jpg') center/cover no-repeat;
  opacity: 0.5;
  pointer-events: none;
  z-index: 0;
}

.app-background::after {
  content: '';
  position: fixed;
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
  z-index: 0;
}
</style>