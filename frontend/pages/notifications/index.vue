<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-high-emphasis mb-1">{{ t('notif.title') }}</h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ notifStore.unreadCount }} {{ t('notif.unread') }}
        </p>
      </div>
      <v-btn
        v-if="notifStore.unreadCount > 0"
        variant="tonal"
        color="primary"
        size="small"
        @click="markAll"
      >{{ t('notif.mark_all') }}</v-btn>
    </div>

    <!-- Filter -->
    <div class="d-flex ga-2 mb-4">
      <v-btn
        v-for="f in filters"
        :key="f.value"
        :variant="activeFilter === f.value ? 'tonal' : 'text'"
        :color="activeFilter === f.value ? 'primary' : undefined"
        size="small"
        rounded="lg"
        @click="setFilter(f.value)"
      >{{ t(f.labelKey) }}</v-btn>
    </div>

    <!-- Loading -->
    <div v-if="notifStore.loading">
      <div v-for="i in 5" :key="i" class="skeleton mb-3" style="height:80px;border-radius:16px" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!notifStore.items.length" class="empty-state mt-12">
      <v-icon size="72" class="text-disabled">mdi-bell-off-outline</v-icon>
      <p class="text-body-1 mt-4 text-disabled">{{ t('notif.empty') }}</p>
    </div>

    <!-- Notification List -->
    <div v-else>
      <div
        v-for="notif in notifStore.items"
        :key="notif.id"
        class="notif-card glass-card mb-3 pa-4 rounded-xl"
        :class="{ unread: !notif.is_read }"
        @click="markRead(notif)"
      >
        <div class="d-flex align-start">
          <div class="notif-icon mr-3" :style="{ background: typeColor(notif.type) + '22', color: typeColor(notif.type) }">
            <v-icon :icon="typeIcon(notif.type)" size="20" />
          </div>
          <div class="flex-1">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-body-2 font-weight-medium text-high-emphasis">{{ notifTitle(notif) }}</span>
              <span class="text-caption ml-2 text-medium-emphasis">
                {{ f.fromNow(notif.created_at) }}
              </span>
            </div>
            <p class="text-body-2 mb-0 text-medium-emphasis">{{ notifMessage(notif) }}</p>
          </div>
          <div class="ml-3 d-flex align-center ga-1">
            <div v-if="!notif.is_read" class="unread-dot" />
            <v-btn icon size="x-small" variant="text" @click.stop="removeNotif(notif.id)">
              <v-icon size="14">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'

definePageMeta({ middleware: 'auth' })

const notifStore = useNotificationStore()
const toast      = useToast()
const f          = useFormatters()
const { t }      = useLocale()
const { notifTitle, notifMessage } = useNotifText()

const activeFilter = ref('')
const filters = [
  { labelKey: 'notif.all'           as const, value: '' },
  { labelKey: 'notif.unread_filter' as const, value: '0' },
  { labelKey: 'notif.read_filter'   as const, value: '1' },
]

function setFilter(val: string) {
  activeFilter.value = val
  notifStore.fetch({ is_read: val })
}

async function markRead(notif: any) {
  if (notif.is_read) return
  await notifStore.markRead(notif.id)
}

async function markAll() {
  await notifStore.markAllRead()
  toast.success(t('notif.marked_all'))
}

async function removeNotif(id: number) {
  await notifStore.remove(id)
}

function typeColor(type: string) {
  const map: Record<string, string> = {
    system: '#0084C6', daily: '#4FC3F7', weekly: '#66BB6A',
    monthly: '#FFB547', bill: '#EF5350', expense: '#EF5350', income: '#66BB6A',
  }
  return map[type] || '#0084C6'
}

function typeIcon(type: string) {
  const map: Record<string, string> = {
    system: 'mdi-bell', daily: 'mdi-calendar-today', weekly: 'mdi-calendar-week',
    monthly: 'mdi-calendar-month', bill: 'mdi-receipt', expense: 'mdi-trending-down', income: 'mdi-trending-up',
  }
  return map[type] || 'mdi-bell'
}

onMounted(() => notifStore.fetch())
</script>

<style scoped lang="scss">
.notif-card {
  cursor: pointer;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
  transition: all 0.2s ease;
  &.unread { border-color: rgba(0,132,198,0.25) !important; }
  &:hover { border-color: rgba(0,132,198,0.4) !important; background: rgba(var(--v-theme-on-surface), 0.03) !important; }
}
.notif-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.unread-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #0084C6;
  flex-shrink: 0;
}
</style>
