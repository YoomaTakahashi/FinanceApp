<template>
  <v-card class="stat-card glass-card pa-5" rounded="xl">
    <div v-if="loading">
      <div class="skeleton mb-3" style="height:16px;width:60%" />
      <div class="skeleton mb-2" style="height:32px;width:80%" />
      <div class="skeleton" style="height:12px;width:40%" />
    </div>
    <div v-else>
      <div class="d-flex align-center justify-space-between mb-3">
        <span class="text-caption font-weight-medium text-medium-emphasis" style="letter-spacing:0.5px;text-transform:uppercase">
          {{ label }}
        </span>
        <div
          class="stat-icon"
          :style="{ background: color + '18', color: color }"
        >
          <v-icon :icon="icon" size="20" />
        </div>
      </div>

      <div class="text-h5 font-weight-bold text-high-emphasis mb-2 count-up">
        {{ f.currency(amount) }}
      </div>

      <div v-if="trend" class="d-flex align-center">
        <v-icon
          :icon="trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'"
          :color="trend === 'up' ? '#66BB6A' : '#EF5350'"
          size="16"
          class="mr-1"
        />
        <span
          class="text-caption"
          :style="{ color: trend === 'up' ? '#66BB6A' : '#EF5350' }"
        >{{ t('dashboard.this_month') }}</span>
      </div>
    </div>

    <!-- Decorative accent line -->
    <div class="stat-accent" :style="{ background: color }" />
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  label:    string
  amount:   number
  icon:     string
  color:    string
  trend?:   string | null
  loading?: boolean
}>()

const f     = useFormatters()
const { t } = useLocale()
</script>

<style scoped lang="scss">
.stat-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.07) !important;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
  }
}
.stat-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-accent {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  opacity: 0.5;
}
</style>
