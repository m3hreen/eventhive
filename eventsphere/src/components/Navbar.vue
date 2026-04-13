<template>
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="logo">EventSphere</router-link>
  
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <a href="#featured">Featured</a>
          <a href="#categories">Categories</a>
          <router-link to="/login" class="nav-btn secondary">Login</router-link>
          <router-link to="/signup" class="nav-btn primary">Sign Up</router-link>
        </div>
      </div>
    </nav>
  </template>
  
  <script setup>
  </script>