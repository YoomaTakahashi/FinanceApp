<template>
  <v-dialog v-model="model" max-width="640" scrollable>
    <v-card class="glass-card" rounded="xl">
      <v-card-title class="pa-6 pb-3 d-flex align-center">
        <span class="text-h6 font-weight-bold text-high-emphasis">
          {{ isEdit ? t('txdlg.edit') : t('txdlg.add') }}
        </span>
        <v-spacer />
        <v-btn icon variant="text" @click="model = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>

      <v-divider class="divider-gold" />

      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="handleSave">
          <!-- Type Toggle -->
          <div class="type-toggle mb-5">
            <div
              class="type-btn"
              :class="{ 'active income': form.type === 'income' }"
              @click="form.type = 'income'"
            >
              <v-icon class="mr-2" size="20">mdi-trending-up</v-icon>
              {{ t('txdlg.income') }}
            </div>
            <div
              class="type-btn"
              :class="{ 'active expense': form.type === 'expense' }"
              @click="form.type = 'expense'"
            >
              <v-icon class="mr-2" size="20">mdi-trending-down</v-icon>
              {{ t('txdlg.expense') }}
            </div>
          </div>

          <v-row dense>
            <!-- Title -->
            <v-col cols="12">
              <v-text-field
                v-model="form.title"
                :label="t('txdlg.title')"
                prepend-inner-icon="mdi-text"
                :rules="[v => !!v || t('txdlg.title')]"
              />
            </v-col>

            <!-- Amount -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.amount"
                label="Amount *"
                type="number"
                prepend-inner-icon="mdi-currency-usd"
                min="0"
                step="0.01"
                :rules="[v => !!v && v > 0 || 'Valid amount required']"
              />
            </v-col>

            <!-- Category -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.category_id"
                label="Category"
                :items="categoryItems"
                item-title="name"
                item-value="id"
                prepend-inner-icon="mdi-tag-outline"
                clearable
              >
                <template #item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template #prepend>
                      <v-icon :icon="item.raw.icon" :color="item.raw.color" class="mr-1" />
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Date -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.transaction_date"
                label="Date *"
                type="date"
                prepend-inner-icon="mdi-calendar"
                :rules="[v => !!v || 'Date is required']"
              />
            </v-col>

            <!-- Time -->
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.transaction_time"
                label="Time"
                type="time"
                prepend-inner-icon="mdi-clock-outline"
              />
            </v-col>

            <!-- Payment Method -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.payment_method"
                label="Payment Method"
                :items="paymentMethods"
                prepend-inner-icon="mdi-credit-card-outline"
              />
            </v-col>

            <!-- Status -->
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.status"
                label="Status"
                :items="['completed', 'pending', 'cancelled']"
                prepend-inner-icon="mdi-check-circle-outline"
              />
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description"
                rows="2"
                prepend-inner-icon="mdi-text-long"
                auto-grow
              />
            </v-col>

            <!-- Note -->
            <v-col cols="12">
              <v-textarea
                v-model="form.note"
                label="Note"
                rows="2"
                prepend-inner-icon="mdi-note-outline"
                auto-grow
              />
            </v-col>

            <!-- Slip Upload -->
            <v-col cols="12">
              <div class="text-body-2 font-weight-medium text-high-emphasis mb-2">
                <v-icon size="18" class="mr-1">mdi-receipt</v-icon>
                {{ t('txdlg.slip') }}
              </div>

              <!-- Existing slip preview -->
              <div v-if="existingSlip && !newSlipFile" class="slip-preview mb-3">
                <v-img :src="slipUrl" max-height="200" contain />
                <div class="d-flex ga-2 pa-2">
                  <v-btn size="x-small" color="primary" variant="tonal" @click="viewSlip">View</v-btn>
                  <v-btn size="x-small" color="error" variant="tonal" @click="removeSlip">Remove</v-btn>
                </div>
              </div>

              <!-- New slip preview -->
              <div v-if="newSlipFile" class="slip-preview mb-3">
                <v-img :src="newSlipPreview" max-height="200" contain />
                <div class="pa-2">
                  <v-btn size="x-small" color="error" variant="tonal" @click="clearNewSlip">Remove</v-btn>
                </div>
              </div>

              <v-file-input
                v-if="!newSlipFile"
                v-model="slipInput"
                label="Upload slip (JPG/PNG)"
                accept="image/jpeg,image/jpg,image/png"
                prepend-icon=""
                prepend-inner-icon="mdi-upload"
                variant="outlined"
                density="comfortable"
                hide-details
                @update:modelValue="onSlipSelected"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider class="divider-gold" />

      <v-card-actions class="pa-6 pt-4">
        <v-btn variant="tonal" @click="model = false" :disabled="saving">{{ t('cancel') }}</v-btn>
        <v-spacer />
        <v-btn class="btn-gold" :loading="saving" @click="handleSave" min-width="120">
          {{ isEdit ? t('txdlg.save') : t('txdlg.add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Slip Viewer -->
  <v-dialog v-model="slipViewer" max-width="800">
    <v-card class="glass-card" rounded="xl">
      <v-card-title class="d-flex align-center pa-4">
        <span>Payment Slip</span>
        <v-spacer />
        <v-btn icon variant="text" @click="slipViewer = false"><v-icon>mdi-close</v-icon></v-btn>
      </v-card-title>
      <v-img :src="slipUrl" max-height="80vh" contain />
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'

const props = defineProps<{
  transaction?: any
}>()
const emit = defineEmits(['saved'])
const model = defineModel<boolean>()

const txStore  = useTransactionStore()
const catStore = useCategoryStore()
const config   = useRuntimeConfig()
const toast    = useToast()
const { t }    = useLocale()

const formRef     = ref()
const saving      = ref(false)
const slipInput   = ref<File[]>([])
const newSlipFile = ref<File | null>(null)
const newSlipPreview = ref('')
const slipViewer  = ref(false)
const removeOldSlip = ref(false)

const isEdit = computed(() => !!props.transaction?.id)

const existingSlip = computed(() =>
  isEdit.value ? props.transaction?.slip_path : null
)

const slipUrl = computed(() => {
  if (!existingSlip.value) return ''
  return `${config.public.apiBase.replace('/api', '')}${existingSlip.value}`
})

const paymentMethods = computed(() => [
  { title: t('pay.cash'),    value: 'cash' },
  { title: t('pay.card'),    value: 'card' },
  { title: t('pay.bank'),    value: 'bank_transfer' },
  { title: t('pay.ewallet'), value: 'e_wallet' },
  { title: t('pay.other'),   value: 'other' },
])

const form = reactive({
  title:            '',
  description:      '',
  amount:           '',
  type:             'expense' as 'income' | 'expense',
  category_id:      null as number | null,
  transaction_date: new Date().toISOString().slice(0, 10),
  transaction_time: new Date().toTimeString().slice(0, 5),
  payment_method:   'cash',
  note:             '',
  status:           'completed',
})

const categoryItems = computed(() =>
  form.type === 'income'
    ? catStore.incomeCategories
    : catStore.expenseCategories
)

watch(model, (open) => {
  if (open) {
    catStore.fetch().catch(() => {})
    resetForm()
  }
})

function resetForm() {
  if (isEdit.value && props.transaction) {
    const tx = props.transaction
    form.title            = tx.title
    form.description      = tx.description || ''
    form.amount           = tx.amount
    form.type             = tx.type
    form.category_id      = tx.category_id
    form.transaction_date = tx.transaction_date?.slice(0, 10) || ''
    form.transaction_time = tx.transaction_time?.slice(0, 5) || ''
    form.payment_method   = tx.payment_method || 'cash'
    form.note             = tx.note || ''
    form.status           = tx.status || 'completed'
  } else {
    Object.assign(form, {
      title: '', description: '', amount: '', type: 'expense',
      category_id: null, transaction_date: new Date().toISOString().slice(0, 10),
      transaction_time: new Date().toTimeString().slice(0, 5),
      payment_method: 'cash', note: '', status: 'completed',
    })
  }
  newSlipFile.value    = null
  newSlipPreview.value = ''
  removeOldSlip.value  = false
  slipInput.value      = []
}

function onSlipSelected(files: File | File[]) {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return
  newSlipFile.value    = file
  newSlipPreview.value = URL.createObjectURL(file)
}

function clearNewSlip() {
  newSlipFile.value    = null
  newSlipPreview.value = ''
  slipInput.value      = []
}

function viewSlip() { slipViewer.value = true }

function removeSlip() {
  removeOldSlip.value = true
}

async function handleSave() {
  const title  = String(form.title || '').trim()
  const amount = parseFloat(String(form.amount || ''))

  if (!title) {
    toast.error(t('txdlg.title') + ' is required')
    return
  }
  if (!amount || amount <= 0) {
    toast.error('Amount must be greater than 0')
    return
  }
  if (!form.transaction_date) {
    toast.error('Date is required')
    return
  }

  saving.value = true
  try {
    const payload = {
      title:            title,
      description:      form.description || '',
      amount:           amount,
      type:             form.type,
      category_id:      form.category_id || null,
      transaction_date: form.transaction_date,
      transaction_time: form.transaction_time || '00:00',
      payment_method:   form.payment_method || 'cash',
      note:             form.note || '',
      status:           form.status || 'completed',
    }

    if (isEdit.value) {
      if (newSlipFile.value) {
        await txStore.update(props.transaction.id, { ...payload, slip: newSlipFile.value })
      } else {
        await txStore.update(props.transaction.id, payload)
      }
      if (removeOldSlip.value) await txStore.deleteSlip(props.transaction.id)
    } else {
      if (newSlipFile.value) {
        await txStore.create({ ...payload, slip: newSlipFile.value })
      } else {
        await txStore.create(payload)
      }
    }

    toast.success(isEdit.value ? t('txdlg.updated') : t('txdlg.added'))
    model.value = false
    emit('saved')
  } catch (err: any) {
    toast.error(err.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.type-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.type-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  background: rgba(var(--v-theme-on-surface), 0.03);

  &:hover { border-color: rgba(var(--v-theme-on-surface), 0.25); }

  &.active.income {
    background: rgba(102,187,106,0.12);
    border-color: #66BB6A;
    color: #66BB6A;
  }
  &.active.expense {
    background: rgba(239,83,80,0.12);
    border-color: #EF5350;
    color: #EF5350;
  }
}
.slip-preview {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 12px;
  overflow: hidden;
}
</style>
