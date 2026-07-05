<template>
  <v-chip :size="size || 'small'" :color="chipColor" variant="tonal">
    {{ label }}
  </v-chip>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string; size?: string }>()
const { t } = useLocale()

const chipColor = computed(() => {
  const map: Record<string, string> = { completed: 'success', pending: 'warning', cancelled: 'error' }
  return map[props.status] || 'default'
})

const label = computed(() => {
  if (props.status === 'completed') return t('status.completed')
  if (props.status === 'pending')   return t('status.pending')
  if (props.status === 'cancelled') return t('status.cancelled')
  return props.status
})
</script>
