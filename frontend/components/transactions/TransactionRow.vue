<template>
  <div
    class="tx-row d-flex align-center pa-3 rounded-xl mb-2"
    :class="{ 'card-hover': !compact }"
    @click="!compact && $emit('click')"
  >
    <!-- Category Icon -->
    <div
      class="tx-icon mr-3"
      :style="{
        background: (transaction.category_color || '#555') + '22',
        color: transaction.category_color || '#555',
      }"
    >
      <v-icon :icon="transaction.category_icon || 'mdi-swap-horizontal'" size="20" />
    </div>

    <!-- Details -->
    <div class="flex-1 overflow-hidden">
      <div class="d-flex align-center justify-space-between">
        <span class="text-body-2 font-weight-medium text-high-emphasis text-truncate mr-2">
          {{ transaction.title }}
        </span>
        <span
          class="text-body-2 font-weight-bold text-no-wrap"
          :class="transaction.type === 'income' ? 'income-text' : 'expense-text'"
        >
          {{ transaction.type === 'income' ? '+' : '-' }}{{ f.currency(transaction.amount) }}
        </span>
      </div>
      <div class="d-flex align-center mt-1">
        <span class="text-caption mr-2 text-medium-emphasis">
          {{ transaction.category_name || t('report.uncategorized') }}
        </span>
        <span class="text-caption text-medium-emphasis">·</span>
        <span class="text-caption ml-2 text-medium-emphasis">
          {{ f.formatDate(transaction.transaction_date, 'MMM DD') }}
        </span>
        <v-spacer />
        <StatusChip v-if="!compact" :status="transaction.status" size="x-small" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  transaction: any
  compact?:    boolean
}>()
defineEmits(['click'])

const f      = useFormatters()
const { t }  = useLocale()
</script>

<style scoped lang="scss">
.tx-row {
  background: rgba(var(--v-theme-on-surface), 0.025);
  transition: background 0.2s ease;
  cursor: default;
  &:hover { background: rgba(var(--v-theme-on-surface), 0.04); }
}
.tx-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
