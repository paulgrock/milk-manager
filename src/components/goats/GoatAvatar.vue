<script setup lang="ts">
import { computed } from 'vue'
import { goatName, type Goat } from '@/lib/goats'

const props = defineProps<{ goat: Goat; url?: string; size?: 'sm' | 'md' | 'lg' | 'xl' | '3xl' }>()
const initials = computed(() =>
  goatName(props.goat)
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase(),
)
</script>

<template>
  <!-- Rounded square with the same corner as the app icon (22% of its width), at any size. -->
  <UAvatar :src="url" :alt="goatName(goat)" :text="initials" :size="size ?? 'lg'" class="shrink-0" :ui="{ root: 'rounded-[22%]' }" />
</template>
