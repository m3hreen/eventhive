<template>
  <form class="auth-form" @submit.prevent="handleSubmit">
    <h2>{{ isEdit ? 'Edit Event' : 'Create Event' }}</h2>

    <label>Title</label>
    <input v-model="form.title" type="text" required />

    <label>Date</label>
    <input v-model="form.date" type="date" required />

    <label>Location</label>
    <input v-model="form.location" type="text" required />

    <label>Category</label>
    <select v-model="form.category" required>
      <option disabled value="">Select a category</option>
      <option>Music</option>
      <option>Workshops</option>
      <option>Networking</option>
      <option>Sports</option>
      <option>Community</option>
      <option>Conferences</option>
    </select>

    <label>Description</label>
    <textarea v-model="form.description" rows="5" required></textarea>

    <button type="submit" class="primary-btn full-btn">
      {{ isEdit ? 'Update Event' : 'Create Event' }}
    </button>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      title: '',
      date: '',
      location: '',
      category: '',
      description: ''
    })
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const form = reactive({
  title: '',
  date: '',
  location: '',
  category: '',
  description: ''
})

watch(
  () => props.initialData,
  (newData) => {
    Object.assign(form, {
      title: newData.title || '',
      date: newData.date || '',
      location: newData.location || '',
      category: newData.category || '',
      description: newData.description || ''
    })
  },
  { immediate: true }
)

function handleSubmit() {
  emit('submit', { ...form })
}
</script>