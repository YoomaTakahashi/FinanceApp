<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-high-emphasis mb-1">
          {{ t(`dashboard.greeting.${greeting}`) }}, {{ firstName }} 👋
        </h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ today }} · {{ t('dashboard.overview') }}
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        class="btn-gold d-none d-sm-flex"
        @click="showAddTx = true"
      >{{ t('dashboard.add_tx') }}</v-btn>
    </div>

    <!-- Stat Cards -->
    <v-row class="mb-6" dense>
      <v-col cols="12" sm="6" lg="3" v-for="stat in stats" :key="stat.label">
        <StatCard
          :label="stat.label"
          :amount="stat.amount"
          :icon="stat.icon"
          :color="stat.color"
          :trend="stat.trend"
          :loading="dashStore.loading"
        />
      </v-col>
    </v-row>

    <!-- Charts Row -->
    <v-row class="mb-6" dense>
      <!-- Monthly Chart -->
      <v-col cols="12" lg="8">
        <v-card class="glass-card h-100 pa-5" rounded="xl">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="text-body-1 font-weight-semibold text-high-emphasis">{{ t('dashboard.income_vs_expense') }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('dashboard.monthly_overview') }} — {{ currentYear }}</div>
            </div>
            <v-select
              v-model="chartYear"
              :items="yearOptions"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width:110px"
              @update:modelValue="fetchChartData"
            />
          </div>
          <div class="chart-container" style="height:260px">
            <LineChart v-if="!dashStore.loading" :data="monthlyChartData" :options="chartOptions" />
            <div v-else class="skeleton" style="height:260px" />
          </div>
        </v-card>
      </v-col>

      <!-- Top Spending -->
      <v-col cols="12" lg="4">
        <v-card class="glass-card h-100 pa-5" rounded="xl">
          <div class="text-body-1 font-weight-semibold text-high-emphasis mb-4">{{ t('dashboard.top_spending') }}</div>
          <div v-if="dashStore.loading">
            <div v-for="i in 5" :key="i" class="skeleton mb-3" style="height:48px" />
          </div>
          <template v-else>
            <div v-if="!dashStore.topCategories.length" class="empty-state py-8">
              <v-icon size="40" class="text-disabled">mdi-tag-off-outline</v-icon>
              <p class="text-body-2 mt-2 text-medium-emphasis">{{ t('dashboard.no_data') }}</p>
            </div>
            <div v-else>
              <div
                v-for="(cat, i) in dashStore.topCategories"
                :key="cat.id"
                class="category-item d-flex align-center mb-3"
              >
                <div class="rank-num text-caption text-high-emphasis mr-2">{{ i + 1 }}</div>
                <div
                  class="cat-icon mr-3"
                  :style="{ background: cat.color + '22', color: cat.color }"
                >
                  <v-icon :icon="cat.icon" size="18" />
                </div>
                <div class="flex-1">
                  <div class="d-flex justify-space-between">
                    <span class="text-body-2 text-high-emphasis">{{ cat.name }}</span>
                    <span class="text-body-2 font-weight-medium expense-text">
                      {{ f.currency(cat.total) }}
                    </span>
                  </div>
                  <v-progress-linear
                    :model-value="(cat.total / maxSpend) * 100"
                    :color="cat.color"
                    height="3"
                    rounded
                    :bg-color="isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'"
                    class="mt-1"
                  />
                </div>
              </div>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Transactions -->
    <v-card class="glass-card pa-5" rounded="xl">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-body-1 font-weight-semibold text-high-emphasis">{{ t('dashboard.recent_tx') }}</div>
        <v-btn variant="text" color="primary" size="small" to="/transactions">{{ t('dashboard.view_all') }}</v-btn>
      </div>

      <div v-if="dashStore.loading">
        <div v-for="i in 6" :key="i" class="skeleton mb-3" style="height:60px" />
      </div>
      <div v-else-if="!dashStore.recentTransactions.length" class="empty-state">
        <v-icon size="52" class="text-disabled">mdi-swap-horizontal</v-icon>
        <p class="text-body-2 mt-3 text-medium-emphasis">{{ t('dashboard.no_tx') }}</p>
        <v-btn color="primary" size="small" class="mt-3 btn-gold" @click="showAddTx = true">
          {{ t('dashboard.add_first') }}
        </v-btn>
      </div>
      <div v-else>
        <TransactionRow
          v-for="tx in dashStore.recentTransactions"
          :key="tx.id"
          :transaction="tx"
          compact
        />
      </div>
    </v-card>

    <!-- Add Transaction Dialog -->
    <TransactionDialog
      v-model="showAddTx"
      @saved="onTransactionSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { Line as LineChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

definePageMeta({ middleware: 'auth' })

const dashStore     = useDashboardStore()
const authStore     = useAuthStore()
const settingsStore = useSettingsStore()
const f             = useFormatters()
const { t }         = useLocale()

const isDark = computed(() => settingsStore.settings?.theme !== 'light')

const showAddTx = ref(false)
const chartYear = ref(new Date().getFullYear())
const currentYear = new Date().getFullYear()

const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

const firstName = computed(() => authStore.userName?.split(' ')[0] || 'there')

const stats = computed(() => {
  const s = dashStore.summary
  if (!s) return Array(4).fill({ label: '', amount: 0, icon: '', color: '' })
  return [
    { label: t('stat.balance'),         amount: s.balance,         icon: 'mdi-wallet-outline',        color: '#0084C6', trend: null },
    { label: t('stat.monthly_income'),  amount: s.monthly_income,  icon: 'mdi-trending-up',            color: '#66BB6A', trend: 'up' },
    { label: t('stat.monthly_expense'), amount: s.monthly_expense, icon: 'mdi-trending-down',          color: '#EF5350', trend: 'down' },
    { label: t('stat.yearly_income'),   amount: s.yearly_income,   icon: 'mdi-calendar-month-outline', color: '#4FC3F7', trend: null },
  ]
})

const maxSpend = computed(() =>
  Math.max(...(dashStore.topCategories.map((c: any) => parseFloat(c.total) || 0)), 1)
)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const monthlyChartData = computed(() => ({
  labels: MONTHS,
  datasets: [
    {
      label:           'Income',
      data:            dashStore.monthlyChart.map((m: any) => m.income),
      borderColor:     '#66BB6A',
      backgroundColor: 'rgba(102,187,106,0.08)',
      borderWidth:     2,
      tension:         0.4,
      fill:            true,
      pointRadius:     4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#66BB6A',
    },
    {
      label:           'Expense',
      data:            dashStore.monthlyChart.map((m: any) => m.expense),
      borderColor:     '#EF5350',
      backgroundColor: 'rgba(239,83,80,0.08)',
      borderWidth:     2,
      tension:         0.4,
      fill:            true,
      pointRadius:     4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#EF5350',
    },
  ],
}))

const chartOptions = computed(() => {
  const textColor  = isDark.value ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'
  const gridColor  = isDark.value ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
  const tooltipBg  = isDark.value ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.98)'
  const tooltipTitle = isDark.value ? '#fff' : '#111'
  const tooltipBody  = isDark.value ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
  return {
    responsive:          true,
    maintainAspectRatio: false,
    interaction:         { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        labels: { color: textColor, font: { size: 12 }, boxWidth: 12, boxHeight: 12 },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor:      tooltipTitle,
        bodyColor:       tooltipBody,
        borderColor:     'rgba(0,132,198,0.3)',
        borderWidth:     1,
        padding:         12,
      },
    },
    scales: {
      x: {
        grid:  { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } },
      },
      y: {
        grid:  { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } },
      },
    },
  }
})

async function fetchChartData() {
  const { get } = useApi()
  const res = await get('/dashboard/chart/monthly', { year: chartYear.value })
  dashStore.monthlyChart = res.data
}

async function onTransactionSaved() {
  showAddTx.value = false
  await dashStore.fetchAll()
}

onMounted(async () => {
  await dashStore.fetchAll()
})
</script>

<style scoped lang="scss">
.cat-icon {
  width: 34px; height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rank-num {
  width: 18px;
  text-align: center;
  opacity: 0.4;
  font-weight: 600;
  flex-shrink: 0;
}
.category-item {
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
}
</style>
