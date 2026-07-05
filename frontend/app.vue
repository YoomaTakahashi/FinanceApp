<template>
  <Transition name="route-loading-fade">
    <div v-if="pageLoading" class="route-loading">
      <div class="route-loading__card">
        <div class="route-loading__spinner" />
        <span class="route-loading__text">{{ t('loading') }}</span>
      </div>
    </div>
  </Transition>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const authStore     = useAuthStore()
const settingsStore = useSettingsStore()
const { t }         = useLocale()

authStore.loadFromStorage()

// Page-change loading dialog
const pageLoading = ref(false)
const nuxtApp = useNuxtApp()
let shownAt = 0

nuxtApp.hook('page:start', () => {
  shownAt = Date.now()
  pageLoading.value = true
})
nuxtApp.hook('page:finish', () => {
  // keep the dialog visible briefly so it doesn't flash on fast navigations
  const remaining = Math.max(0, 350 - (Date.now() - shownAt))
  setTimeout(() => { pageLoading.value = false }, remaining)
})

onMounted(async () => {
  if (authStore.accessToken) {
    try {
      await Promise.all([authStore.fetchMe(), settingsStore.fetch()])
    } catch {}
  }
})
</script>

<style scoped>
.route-loading {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(4, 30, 74, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.route-loading__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 48px;
  border-radius: 20px;
  background: #FFFFFF;
  box-shadow: 0 20px 60px rgba(5, 41, 98, 0.3);
}
.route-loading__spinner {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 4px solid rgba(0, 132, 198, 0.15);
  border-top-color: #0084C6;
  animation: route-loading-spin 0.8s linear infinite;
}
.route-loading__text {
  font-size: 14px;
  font-weight: 600;
  color: #052962;
  letter-spacing: 0.5px;
}
@keyframes route-loading-spin {
  to { transform: rotate(360deg); }
}
.route-loading-fade-enter-active,
.route-loading-fade-leave-active {
  transition: opacity 0.2s ease;
}
.route-loading-fade-enter-from,
.route-loading-fade-leave-to {
  opacity: 0;
}
</style>
