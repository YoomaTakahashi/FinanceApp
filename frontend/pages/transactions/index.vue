<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-high-emphasis mb-1">{{ t('tx.title') }}</h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ txStore.meta?.total || 0 }} {{ t('tx.total') }}
        </p>
      </div>
      <v-btn class="btn-gold" prepend-icon="mdi-plus" @click="openAdd">
        {{ t('dashboard.add_tx') }}
      </v-btn>
    </div>

    <!-- Filters -->
    <v-card class="glass-card pa-4 mb-4" rounded="xl">
      <v-row dense align="center">
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="search"
            label="Search"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            density="compact"
            @update:modelValue="onSearch"
          />
        </v-col>
        <v-col cols="6" sm="2">
          <v-select
            v-model="filterType"
            :label="t('type')"
            :items="[{title:t('tx.type_all'),value:''},{title:t('tx.type_income'),value:'income'},{title:t('tx.type_expense'),value:'expense'}]"
            hide-details density="compact"
            @update:modelValue="applyFilters"
          />
        </v-col>
        <v-col cols="6" sm="2">
          <v-select
            v-model="filterCat"
            :label="t('category')"
            :items="catItems"
            hide-details density="compact"
            @update:modelValue="applyFilters"
          />
        </v-col>
        <v-col cols="6" sm="2">
          <v-text-field
            v-model="filterFrom"
            :label="t('tx.from')"
            type="date"
            hide-details density="compact"
            @update:modelValue="applyFilters"
          />
        </v-col>
        <v-col cols="6" sm="2">
          <v-text-field
            v-model="filterTo"
            :label="t('tx.to')"
            type="date"
            hide-details density="compact"
            @update:modelValue="applyFilters"
          />
        </v-col>
      </v-row>
      <div class="d-flex ga-2 mt-3">
        <v-chip
          v-if="hasFilters"
          closable
          color="primary"
          size="small"
          @click:close="clearFilters"
        >{{ t('tx.filters_active') }}</v-chip>
      </div>
    </v-card>

    <!-- Table -->
    <v-card class="glass-card" rounded="xl">
      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="txStore.items"
        :items-length="txStore.meta?.total || 0"
        :loading="txStore.loading"
        :page="page"
        class="finance-table transparent-bg"
        @update:page="onPageChange"
        @update:sort-by="onSort"
      >
        <!-- Type -->
        <template #item.type="{ item }">
          <v-chip
            :color="item.type === 'income' ? 'success' : 'error'"
            variant="tonal"
            size="small"
            :prepend-icon="item.type === 'income' ? 'mdi-trending-up' : 'mdi-trending-down'"
          >{{ item.type === 'income' ? t('tx.type_income') : t('tx.type_expense') }}</v-chip>
        </template>

        <!-- Category -->
        <template #item.category_name="{ item }">
          <div v-if="item.category_name" class="d-flex align-center">
            <v-icon :icon="item.category_icon" :color="item.category_color" size="16" class="mr-1" />
            <span class="text-body-2">{{ item.category_name }}</span>
          </div>
          <span v-else class="text-caption text-disabled">—</span>
        </template>

        <!-- Amount -->
        <template #item.amount="{ item }">
          <span
            class="font-weight-bold"
            :class="item.type === 'income' ? 'income-text' : 'expense-text'"
          >
            {{ item.type === 'income' ? '+' : '-' }}{{ f.currency(item.amount) }}
          </span>
        </template>

        <!-- Date -->
        <template #item.transaction_date="{ item }">
          {{ f.formatDate(item.transaction_date) }}
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <StatusChip :status="item.status" />
        </template>

        <!-- Slip -->
        <template #item.slip_path="{ item }">
          <v-btn
            v-if="item.slip_path"
            icon
            variant="text"
            size="small"
            color="primary"
            @click="viewSlip(item)"
          >
            <v-icon size="18">mdi-receipt</v-icon>
          </v-btn>
          <span v-else class="text-caption text-disabled">—</span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex align-center ga-1">
            <v-btn icon size="x-small" variant="text" @click="openEdit(item)">
              <v-icon size="16">mdi-pencil-outline</v-icon>
            </v-btn>
            <v-btn icon size="x-small" variant="text" @click="onDuplicate(item)">
              <v-icon size="16">mdi-content-copy</v-icon>
            </v-btn>
            <v-btn icon size="x-small" variant="text" color="error" @click="confirmDelete(item)">
              <v-icon size="16">mdi-delete-outline</v-icon>
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="empty-state py-12">
            <v-icon size="64" class="text-disabled">mdi-swap-horizontal</v-icon>
            <p class="text-body-1 mt-4 text-disabled">No transactions found</p>
            <v-btn class="btn-gold mt-4" size="small" @click="openAdd">Add Transaction</v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Undo Snackbar -->
    <v-snackbar v-model="showUndo" timeout="5000" color="surface" rounded="xl">
      <span>{{ t('tx.deleted') }}</span>
      <template #actions>
        <v-btn color="primary" variant="text" @click="undoDelete">{{ t('undo') }}</v-btn>
      </template>
    </v-snackbar>

    <!-- Dialogs -->
    <TransactionDialog v-model="showDialog" :transaction="editItem" @saved="onSaved" />

    <ConfirmDialog
      v-model="showConfirm"
      :title="t('confirm.delete_tx')"
      :message="t('confirm.delete_tx_msg')"
      :loading="deleting"
      @confirm="doDelete"
      @cancel="showConfirm = false"
    />

    <!-- Slip Viewer -->
    <v-dialog v-model="slipDialog" max-width="800">
      <v-card class="glass-card" rounded="xl">
        <v-card-title class="d-flex align-center pa-4">
          Payment Slip
          <v-spacer />
          <v-btn icon variant="text" @click="slipDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-img v-if="slipItem" :src="slipImageUrl" max-height="80vh" contain />
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({ middleware: 'auth' })

const txStore  = useTransactionStore()
const catStore = useCategoryStore()
const toast    = useToast()
const config   = useRuntimeConfig()
const f        = useFormatters()
const { t }    = useLocale()

const showDialog  = ref(false)
const showConfirm = ref(false)
const showUndo    = ref(false)
const slipDialog  = ref(false)
const deleting    = ref(false)
const editItem    = ref<any>(null)
const deleteItem  = ref<any>(null)
const slipItem    = ref<any>(null)
const page        = ref(1)
const itemsPerPage = ref(20)
const search      = ref('')
const filterType  = ref('')
const filterCat   = ref('')
const filterFrom  = ref('')
const filterTo    = ref('')

const headers = computed(() => [
  { title: t('tx.col_title'),    key: 'title',            sortable: true  },
  { title: t('tx.col_type'),     key: 'type',             sortable: true  },
  { title: t('tx.col_category'), key: 'category_name',    sortable: false },
  { title: t('tx.col_amount'),   key: 'amount',           sortable: true  },
  { title: t('tx.col_date'),     key: 'transaction_date', sortable: true  },
  { title: t('tx.col_method'),   key: 'payment_method',   sortable: false },
  { title: t('tx.col_status'),   key: 'status',           sortable: false },
  { title: t('tx.col_slip'),     key: 'slip_path',        sortable: false },
  { title: t('tx.col_actions'),  key: 'actions',          sortable: false },
])

const catItems = computed(() => [
  { title: t('tx.all_categories'), value: '' },
  ...catStore.items.map((c: any) => ({ title: c.name, value: c.id })),
])

const hasFilters = computed(() =>
  filterType.value || filterCat.value || filterFrom.value || filterTo.value || search.value
)

const slipImageUrl = computed(() => {
  if (!slipItem.value?.slip_path) return ''
  return `${config.public.apiBase.replace('/api', '')}${slipItem.value.slip_path}`
})

const onSearch = useDebounceFn(() => applyFilters(), 400)

function applyFilters() {
  page.value = 1
  txStore.fetch({
    page:        1,
    limit:       itemsPerPage.value,
    search:      search.value,
    type:        filterType.value,
    category_id: filterCat.value,
    date_from:   filterFrom.value,
    date_to:     filterTo.value,
  })
}

function clearFilters() {
  search.value      = ''
  filterType.value  = ''
  filterCat.value   = ''
  filterFrom.value  = ''
  filterTo.value    = ''
  applyFilters()
}

function onPageChange(p: number) {
  page.value = p
  txStore.fetch({ page: p, limit: itemsPerPage.value })
}

function onSort(sortBy: any[]) {
  if (sortBy.length) {
    txStore.fetch({ sort: sortBy[0].key, order: sortBy[0].order.toUpperCase(), page: 1 })
  }
}

function openAdd() { editItem.value = null; showDialog.value = true }
function openEdit(item: any) { editItem.value = item; showDialog.value = true }

function confirmDelete(item: any) { deleteItem.value = item; showConfirm.value = true }

async function doDelete() {
  if (!deleteItem.value) return
  deleting.value = true
  try {
    await txStore.remove(deleteItem.value.id)
    showConfirm.value = false
    showUndo.value    = true
    txStore.fetch({ page: page.value, limit: itemsPerPage.value })
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    deleting.value = false
  }
}

async function undoDelete() {
  if (!deleteItem.value) return
  try {
    await txStore.restore(deleteItem.value.id)
    showUndo.value = false
    toast.success(t('tx.restored'))
    txStore.fetch({ page: page.value, limit: itemsPerPage.value })
  } catch (err: any) {
    toast.error(err.message)
  }
}

async function onDuplicate(item: any) {
  try {
    await txStore.duplicate(item.id)
    toast.success(t('tx.duplicated'))
    txStore.fetch({ page: page.value, limit: itemsPerPage.value })
  } catch (err: any) {
    toast.error(err.message)
  }
}

function viewSlip(item: any) { slipItem.value = item; slipDialog.value = true }

function onSaved() {
  showDialog.value = false
  txStore.fetch({ page: page.value, limit: itemsPerPage.value })
}

onMounted(() => {
  catStore.fetch().catch(() => {})
  txStore.fetch({ page: 1, limit: 20 })
})
</script>

<style scoped lang="scss">
:deep(.transparent-bg) { background: transparent !important; }
:deep(.v-data-table__td) { border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05) !important; }
:deep(.v-data-table-header__content) { color: rgba(var(--v-theme-on-surface), 0.5) !important; font-size: 11px; text-transform: uppercase; }
</style>
