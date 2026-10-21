<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const title = computed(() => {
  const section = String(route.params.section)
  return section.charAt(0).toUpperCase() + section.slice(1)
})
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">{{ title }}</h1>
    <UCard><p class="text-muted">Coming soon.</p></UCard>
  </div>
</template>
