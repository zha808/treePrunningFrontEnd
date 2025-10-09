<template>
  <div class="admin-container">
    <h1>Administration Module</h1>
    <CentralMenu @search-results="results = $event" />
    <div class="results-section" v-if="results.length">
      <h2>Results</h2>
      <ul>
        <li v-for="item in results" :key="item.id">{{ item.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CentralMenu from '../components/CentralMenu.vue'

const results = ref([])
</script>

<style>
h1 {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #eee;
}
.admin-container {
  flex-direction: column;
  min-height: 80vh;
}
.results-section {
  margin: 1% auto;
  width: 70%;
  padding: 24px;
  background: #f9f9f9;
  border-top: 1px solid #eee;
  border-radius: 10px;

}
</style>
