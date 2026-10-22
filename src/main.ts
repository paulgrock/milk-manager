import './assets/main.css'

import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import { router } from './router'
import { queryClient, restoreQueryCache } from './lib/queryClient'
import './lib/milkSync'
import './lib/healthSync'

// Mount even if the saved cache can't be read; it just means a cold start.
restoreQueryCache()
  .catch(() => undefined)
  .then(() => {
    createApp(App).use(router).use(ui).use(VueQueryPlugin, { queryClient }).mount('#app')
  })
