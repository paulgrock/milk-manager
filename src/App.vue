<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useAuth } from '@/composables/useAuth'

useRegisterSW({ immediate: true })

// The app opens from the saved session; if checking it later finds the
// person signed out (or their access removed), back to sign-in.
const { user } = useAuth()
const route = useRoute()
const router = useRouter()
watch(user, (u) => {
  if (!u && !route.meta.public) void router.replace({ path: '/login', query: route.fullPath === '/' ? {} : { redirect: route.fullPath } })
})
</script>

<template>
  <UApp>
    <RouterView />
  </UApp>
</template>
