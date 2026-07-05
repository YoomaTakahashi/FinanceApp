<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold text-high-emphasis mb-1">{{ t('settings.title') }}</h1>
      <p class="text-body-2 text-medium-emphasis">{{ t('settings.subtitle') }}</p>
    </div>

    <v-row>
      <!-- Appearance -->
      <v-col cols="12" md="6">
        <v-card class="glass-card pa-6 mb-4" rounded="xl">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-2">mdi-palette-outline</v-icon>
            <span class="text-body-1 font-weight-semibold text-high-emphasis">{{ t('settings.appearance') }}</span>
          </div>

          <div class="setting-row mb-4">
            <div>
              <div class="text-body-2 text-high-emphasis">{{ t('settings.theme') }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('settings.theme_desc') }}</div>
            </div>
            <v-btn-toggle v-model="form.theme" mandatory rounded="lg" density="compact" color="primary">
              <v-btn value="dark" size="small">
                <v-icon size="16" class="mr-1">mdi-weather-night</v-icon>{{ t('settings.dark') }}
              </v-btn>
              <v-btn value="light" size="small">
                <v-icon size="16" class="mr-1">mdi-weather-sunny</v-icon>{{ t('settings.light') }}
              </v-btn>
            </v-btn-toggle>
          </div>

          <div class="setting-row">
            <div>
              <div class="text-body-2 text-high-emphasis">{{ t('settings.language') }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('settings.language_desc') }}</div>
            </div>
            <v-btn-toggle v-model="form.language" mandatory rounded="lg" density="compact" color="primary">
              <v-btn value="en" size="small">
                <v-icon size="16" class="mr-1">mdi-translate</v-icon>EN
              </v-btn>
              <v-btn value="th" size="small">
                <v-icon size="16" class="mr-1">mdi-translate</v-icon>ไทย
              </v-btn>
            </v-btn-toggle>
          </div>
        </v-card>

        <!-- Currency -->
        <v-card class="glass-card pa-6 mb-4" rounded="xl">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-2">mdi-currency-usd</v-icon>
            <span class="text-body-1 font-weight-semibold text-high-emphasis">{{ t('settings.currency') }}</span>
          </div>

          <v-row dense>
            <v-col cols="7">
              <v-select
                v-model="form.currency"
                :label="t('settings.currency')"
                :items="currencies"
                hide-details
                @update:modelValue="onCurrencyChange"
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="form.currency_symbol"
                :label="t('settings.symbol')"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card>

        <!-- Budget -->
        <v-card class="glass-card pa-6" rounded="xl">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-2">mdi-wallet-outline</v-icon>
            <span class="text-body-1 font-weight-semibold text-high-emphasis">{{ t('settings.budget') }}</span>
          </div>
          <v-text-field
            v-model="form.monthly_budget"
            :label="t('settings.budget_label')"
            type="number"
            prepend-inner-icon="mdi-currency-usd"
            hide-details
            clearable
          />
        </v-card>
      </v-col>

      <!-- Notifications -->
      <v-col cols="12" md="6">
        <v-card class="glass-card pa-6" rounded="xl">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-2">mdi-bell-outline</v-icon>
            <span class="text-body-1 font-weight-semibold text-high-emphasis">{{ t('settings.notifications') }}</span>
          </div>

          <div
            v-for="item in notifSettings"
            :key="item.key"
            class="setting-row mb-3"
          >
            <div>
              <div class="text-body-2 text-high-emphasis">{{ t(item.labelKey) }}</div>
              <div class="text-caption text-medium-emphasis">{{ t(item.descKey) }}</div>
            </div>
            <v-switch
              v-model="form[item.key]"
              color="primary"
              hide-details
              density="compact"
              inset
            />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Save Button -->
    <div class="d-flex justify-end mt-6">
      <v-btn class="btn-gold" size="large" :loading="saving" @click="save" min-width="140">
        {{ t('settings.save') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'

definePageMeta({ middleware: 'auth' })

const settingsStore = useSettingsStore()
const toast         = useToast()
const { t }         = useLocale()
const saving        = ref(false)

const form = reactive({
  theme:           'light',
  currency:        'USD',
  currency_symbol: '$',
  language:        'en',
  timezone:        'UTC',
  notify_daily:    true,
  notify_weekly:   true,
  notify_monthly:  true,
  notify_bill:     true,
  notify_expense:  true,
  notify_income:   true,
  monthly_budget:  null as number | null,
})

const currencies = [
  { title: 'USD — US Dollar',         value: 'USD' },
  { title: 'EUR — Euro',              value: 'EUR' },
  { title: 'GBP — British Pound',     value: 'GBP' },
  { title: 'JPY — Japanese Yen',      value: 'JPY' },
  { title: 'THB — Thai Baht',         value: 'THB' },
  { title: 'SGD — Singapore Dollar',  value: 'SGD' },
  { title: 'AUD — Australian Dollar', value: 'AUD' },
  { title: 'CAD — Canadian Dollar',   value: 'CAD' },
]

const currencySymbols: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', THB: '฿', SGD: 'S$', AUD: 'A$', CAD: 'C$',
}

const notifSettings = [
  { key: 'notify_daily',   labelKey: 'settings.notify_daily'   as const, descKey: 'settings.notify_daily_desc'   as const },
  { key: 'notify_weekly',  labelKey: 'settings.notify_weekly'  as const, descKey: 'settings.notify_weekly_desc'  as const },
  { key: 'notify_monthly', labelKey: 'settings.notify_monthly' as const, descKey: 'settings.notify_monthly_desc' as const },
  { key: 'notify_bill',    labelKey: 'settings.notify_bill'    as const, descKey: 'settings.notify_bill_desc'    as const },
  { key: 'notify_expense', labelKey: 'settings.notify_expense' as const, descKey: 'settings.notify_expense_desc' as const },
  { key: 'notify_income',  labelKey: 'settings.notify_income'  as const, descKey: 'settings.notify_income_desc'  as const },
]

function onCurrencyChange(val: string) {
  if (currencySymbols[val]) form.currency_symbol = currencySymbols[val]
}

async function save() {
  saving.value = true
  try {
    await settingsStore.update(form)
    toast.success(t('settings.saved'))
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

watch(() => form.theme, (val) => {
  settingsStore.settings.theme = val
})

watch(() => form.language, (val) => {
  settingsStore.settings.language = val
})

onMounted(async () => {
  await settingsStore.fetch()
  Object.assign(form, settingsStore.settings)
})
</script>

<style scoped lang="scss">
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
</style>
