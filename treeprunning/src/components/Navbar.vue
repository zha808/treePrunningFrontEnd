<script setup>
const emit = defineEmits(['toggleSidebar'])
</script>

<template>
  <nav class="navbar navbar-dark bg-dark">
    <div class="container-fluid">
      <button class="btn btn-outline-light me-2" @click="$emit('toggleSidebar')">
        <i class="bi bi-list"></i>
      </button>
      <span class="navbar-brand mb-0 h1">Menu principal</span>
    </div>
  </nav>
</template>

<style scoped>
.container-fluid {
  height: 100%;
  width: 250px;
}
</style>
