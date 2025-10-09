<template>
  <div class="central-menu">
    <div class="entity-select">
      <label for="entity">Select entity:</label>
      <select id="entity" v-model="selectedEntity">
        <option v-for="entity in entities" :key="entity.value" :value="entity.value">
          {{ entity.label }}
        </option>
      </select>
    </div>
    <div class="filters">
      <component :is="currentFilterComponent" />
    </div>
    <button @click="search">Search</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Define your entities and their filter components
const entities = [
  { value: 'person', label: 'Person' },
  { value: 'tree', label: 'Tree' },
  { value: 'sector', label: 'Sector' },
  { value: 'tool', label: 'Tool' }
]

const selectedEntity = ref('person')

// Import filter components for each entity
import PersonFilters from './filters/PersonFilters.vue'
import TreeFilters from './filters/TreeFilters.vue'
import SectorFilters from './filters/SectorFilters.vue'
import ToolFilters from './filters/ToolFilters.vue'

const filterComponents = {
  person: PersonFilters,
  tree: TreeFilters,
  sector: SectorFilters,
  tool: ToolFilters
}

const currentFilterComponent = computed(() => filterComponents[selectedEntity.value])

const emit = defineEmits(['search-results'])

function search() {
  // Dummy results for demonstration
  const results = [
    { id: 1, name: 'Example Result 1' },
    { id: 2, name: 'Example Result 2' }
  ]
  emit('search-results', results)
}
</script>

<style scoped>
.central-menu {
  max-width: 70%;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.entity-select {
  margin-bottom: 24px;
}
.filters {
  margin-top: 16px;
}
</style>
