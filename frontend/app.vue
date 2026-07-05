<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const authStore     = useAuthStore()
const settingsStore = useSettingsStore()

authStore.loadFromStorage()

onMounted(async () => {
  if (authStore.accessToken) {
    try {
      await Promise.all([authStore.fetchMe(), settingsStore.fetch()])
    } catch {}
  }
})
</script>
