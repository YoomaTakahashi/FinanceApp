<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-high-emphasis mb-1">{{ t('report.title') }}</h1>
        <p class="text-body-2 text-medium-emphasis">{{ t('report.subtitle') }}</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn variant="tonal" prepend-icon="mdi-file-download-outline" @click="exportCSV">
          {{ t('report.export_csv') }}
        </v-btn>
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-printer-outline" @click="print">
          {{ t('report.print') }}
        </v-btn>
      </div>
    </div>

    <!-- Period Tabs -->
    <v-card class="glass-card mb-6" rounded="xl">
      <v-tabs v-model="period" color="primary" class="border-b">
        <v-tab value="weekly">{{ t('report.weekly') }}</v-tab>
        <v-tab value="monthly">{{ t('report.monthly') }}</v-tab>
        <v-tab value="yearly">{{ t('report.yearly') }}</v-tab>
      </v-tabs>

      <div class="pa-4">
        <!-- Weekly Controls -->
        <div v-if="period === 'weekly'" class="d-flex align-center ga-3">
          <v-text-field
            v-model="weekDate"
            label="Week of"
            type="date"
            hide-details
            density="compact"
            style="max-width:200px"
            @update:modelValue="fetch"
          />
        </div>

        <!-- Monthly Controls -->
        <div v-if="period === 'monthly'" class="d-flex align-center ga-3">
          <v-select
            v-model="selectedMonth"
            :items="months"
            label="Month"
            hide-details density="compact"
            style="max-width:150px"
            @update:modelValue="fetch"
          />
          <v-select
            v-model="selectedYear"
            :items="years"
            label="Year"
            hide-details density="compact"
            style="max-width:120px"
            @update:modelValue="fetch"
          />
        </div>

        <!-- Yearly Controls -->
        <div v-if="period === 'yearly'" class="d-flex align-center ga-3">
          <v-select
            v-model="selectedYear"
            :items="years"
            label="Year"
            hide-details density="compact"
            style="max-width:120px"
            @update:modelValue="fetch"
          />
        </div>
      </div>
    </v-card>

    <!-- Loading -->
    <div v-if="loading">
      <v-row dense class="mb-4">
        <v-col v-for="i in 4" :key="i" cols="6" md="3">
          <div class="skeleton" style="height:100px;border-radius:16px" />
        </v-col>
      </v-row>
    </div>

    <template v-else-if="report">
      <!-- Summary Cards -->
      <v-row dense class="mb-6">
        <v-col cols="6" md="3">
          <v-card class="glass-card pa-5" rounded="xl">
            <div class="text-caption mb-2 text-medium-emphasis" style="text-transform:uppercase">{{ t('report.total_income') }}</div>
            <div class="text-h5 font-weight-bold income-text">{{ f.currency(report.summary.total_income) }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card class="glass-card pa-5" rounded="xl">
            <div class="text-caption mb-2 text-medium-emphasis" style="text-transform:uppercase">{{ t('report.total_expense') }}</div>
            <div class="text-h5 font-weight-bold expense-text">{{ f.currency(report.summary.total_expense) }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card class="glass-card pa-5" rounded="xl">
            <div class="text-caption mb-2 text-medium-emphasis" style="text-transform:uppercase">{{ t('report.net_balance') }}</div>
            <div
              class="text-h5 font-weight-bold"
              :class="report.summary.balance >= 0 ? 'income-text' : 'expense-text'"
            >{{ f.currency(report.summary.balance) }}</div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card class="glass-card pa-5" rounded="xl">
            <div class="text-caption mb-2 text-medium-emphasis" style="text-transform:uppercase">{{ t('report.tx_count') }}</div>
            <div class="text-h5 font-weight-bold text-high-emphasis">{{ report.summary.transaction_count }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Period Chart -->
      <v-card class="glass-card pa-5 mb-6" rounded="xl">
        <div class="text-body-1 font-weight-semibold text-high-emphasis mb-4">{{ t('report.period') }}</div>
        <div class="chart-container" style="height:240px">
          <BarChart :data="periodChartData" :options="barOptions" />
        </div>
      </v-card>

      <!-- Category Breakdown -->
      <v-row dense class="mb-6">
        <v-col cols="12" md="6">
          <v-card class="glass-card pa-5 h-100" rounded="xl">
            <div class="text-body-1 font-weight-semibold text-high-emphasis mb-4">{{ t('report.income_by_cat') }}</div>
            <div v-if="incomeCategories.length === 0" class="empty-state py-6">
              <v-icon class="text-disabled">mdi-chart-pie-outline</v-icon>
            </div>
            <div v-else>
              <div
                v-for="cat in incomeCategories"
                :key="cat.id"
                class="d-flex align-center mb-3"
              >
                <v-icon :icon="cat.icon" :color="cat.color" size="16" class="mr-2" />
                <span class="text-body-2 text-high-emphasis flex-1">{{ cat.name || t('report.uncategorized') }}</span>
                <span class="text-body-2 income-text font-weight-medium">{{ f.currency(cat.total) }}</span>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="glass-card pa-5 h-100" rounded="xl">
            <div class="text-body-1 font-weight-semibold text-high-emphasis mb-4">{{ t('report.expense_by_cat') }}</div>
            <div v-if="expenseCategories.length === 0" class="empty-state py-6">
              <v-icon class="text-disabled">mdi-chart-pie-outline</v-icon>
            </div>
            <div v-else>
              <div
                v-for="cat in expenseCategories"
                :key="cat.id"
                class="d-flex align-center mb-3"
              >
                <v-icon :icon="cat.icon" :color="cat.color" size="16" class="mr-2" />
                <span class="text-body-2 text-high-emphasis flex-1">{{ cat.name || t('report.uncategorized') }}</span>
                <span class="text-body-2 expense-text font-weight-medium">{{ f.currency(cat.total) }}</span>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Transactions List -->
      <v-card class="glass-card pa-5" rounded="xl">
        <div class="text-body-1 font-weight-semibold text-high-emphasis mb-4">
          {{ t('report.tx_details') }} ({{ report.transactions?.length || 0 }})
        </div>
        <div v-if="!report.transactions?.length" class="empty-state py-6">
          <v-icon size="40" class="text-disabled">mdi-swap-horizontal</v-icon>
        </div>
        <TransactionRow
          v-else
          v-for="tx in report.transactions"
          :key="tx.id"
          :transaction="tx"
        />
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Bar as BarChart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

definePageMeta({ middleware: 'auth' })

const { get }       = useApi()
const f             = useFormatters()
const settingsStore = useSettingsStore()
const { t }         = useLocale()
const isDark        = computed(() => settingsStore.settings?.theme !== 'light')

const period       = ref('monthly')
const loading      = ref(false)
const report       = ref<any>(null)
const weekDate     = ref(new Date().toISOString().slice(0, 10))
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear  = ref(new Date().getFullYear())

const months = [
  {title:'January',value:1},{title:'February',value:2},{title:'March',value:3},
  {title:'April',value:4},{title:'May',value:5},{title:'June',value:6},
  {title:'July',value:7},{title:'August',value:8},{title:'September',value:9},
  {title:'October',value:10},{title:'November',value:11},{title:'December',value:12},
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => ({ title: String(currentYear - i), value: currentYear - i }))

const incomeCategories  = computed(() => (report.value?.by_category || []).filter((c: any) => c.type === 'income'))
const expenseCategories = computed(() => (report.value?.by_category || []).filter((c: any) => c.type === 'expense'))

const periodChartData = computed(() => {
  const periods = report.value?.by_period || []
  return {
    labels: periods.map((p: any) => p.period),
    datasets: [
      {
        label:           'Income',
        data:            periods.map((p: any) => p.income),
        backgroundColor: 'rgba(102,187,106,0.7)',
        borderRadius:    6,
      },
      {
        label:           'Expense',
        data:            periods.map((p: any) => p.expense),
        backgroundColor: 'rgba(239,83,80,0.7)',
        borderRadius:    6,
      },
    ],
  }
})

const barOptions = computed(() => {
  const textColor    = isDark.value ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)'
  const gridColor    = isDark.value ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
  const tooltipBg    = isDark.value ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.98)'
  const tooltipTitle = isDark.value ? '#fff' : '#111'
  const tooltipBody  = isDark.value ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { size: 12 } } },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor:      tooltipTitle,
        bodyColor:       tooltipBody,
        borderColor:     'rgba(0,132,198,0.3)',
        borderWidth:     1,
      },
    },
    scales: {
      x: { grid: { color: gridColor }, ticks: { color: textColor } },
      y: { grid: { color: gridColor }, ticks: { color: textColor } },
    },
  }
})

async function fetch() {
  loading.value = true
  try {
    let res
    if (period.value === 'weekly') {
      res = await get('/reports/weekly', { date: weekDate.value })
    } else if (period.value === 'monthly') {
      res = await get('/reports/monthly', { year: selectedYear.value, month: selectedMonth.value })
    } else {
      res = await get('/reports/yearly', { year: selectedYear.value })
    }
    report.value = res.data
  } catch {} finally {
    loading.value = false
  }
}

function exportCSV() {
  if (!report.value?.transactions) return

  function csvField(val: any): string {
    const s = String(val ?? '')
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s
  }

  const headers = ['Title', 'Type', 'Amount', 'Category', 'Date', 'Status']
  const rows    = report.value.transactions.map((tx: any) => [
    tx.title, tx.type, tx.amount, tx.category_name || '', tx.transaction_date, tx.status,
  ])
  const csv  = [headers, ...rows].map((r) => r.map(csvField).join(',')).join('\r\n')
  // UTF-8 BOM so Google Sheets recognises encoding (including Thai text)
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `finance-report-${period.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function print() { window.print() }

watch(period, () => fetch())
onMounted(() => fetch())
</script>
