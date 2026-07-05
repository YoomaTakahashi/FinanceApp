<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-high-emphasis mb-1">{{ t('cat.title') }}</h1>
        <p class="text-body-2 text-medium-emphasis">{{ t('cat.subtitle') }}</p>
      </div>
      <v-btn class="btn-gold" prepend-icon="mdi-plus" @click="openAdd">
        {{ t('cat.add') }}
      </v-btn>
    </div>

    <!-- Default Categories -->
    <div class="text-body-2 font-weight-medium mb-3 text-medium-emphasis">
      {{ t('cat.default') }}
    </div>
    <v-row dense class="mb-6">
      <v-col
        v-for="cat in catStore.defaultCategories"
        :key="cat.id"
        cols="6" sm="4" md="3" lg="2"
      >
        <v-card class="glass-card pa-4 text-center" rounded="xl">
          <div
            class="cat-icon mx-auto mb-2"
            :style="{ background: cat.color + '22', color: cat.color }"
          >
            <v-icon :icon="cat.icon" size="24" />
          </div>
          <div class="text-body-2 text-high-emphasis font-weight-medium">{{ cat.name }}</div>
          <v-chip :color="typeColor(cat.type)" size="x-small" class="mt-1">{{ typeLabel(cat.type) }}</v-chip>
        </v-card>
      </v-col>
    </v-row>

    <!-- Custom Categories -->
    <div class="d-flex align-center mb-3">
      <div class="text-body-2 font-weight-medium text-medium-emphasis">
        {{ t('cat.mine') }}
      </div>
    </div>

    <div v-if="catStore.loading && !catStore.customCategories.length">
      <v-row dense>
        <v-col v-for="i in 6" :key="i" cols="6" sm="4" md="3">
          <div class="skeleton" style="height:120px;border-radius:16px" />
        </v-col>
      </v-row>
    </div>
    <div v-else-if="!catStore.customCategories.length" class="empty-state">
      <v-icon size="56" class="text-disabled">mdi-tag-plus-outline</v-icon>
      <p class="text-body-2 mt-3 text-medium-emphasis">{{ t('cat.no_custom') }}</p>
      <v-btn class="btn-gold mt-3" size="small" @click="openAdd">{{ t('cat.create_first') }}</v-btn>
    </div>
    <v-row v-else dense>
      <v-col
        v-for="cat in catStore.customCategories"
        :key="cat.id"
        cols="6" sm="4" md="3" lg="2"
      >
        <v-card
          class="glass-card pa-4 text-center card-hover"
          rounded="xl"
        >
          <div
            class="cat-icon mx-auto mb-2"
            :style="{ background: cat.color + '22', color: cat.color }"
          >
            <v-icon :icon="cat.icon" size="24" />
          </div>
          <div class="text-body-2 text-high-emphasis font-weight-medium mb-1">{{ cat.name }}</div>
          <v-chip :color="typeColor(cat.type)" size="x-small" class="mb-3">{{ typeLabel(cat.type) }}</v-chip>
          <div class="d-flex justify-center ga-1">
            <v-btn icon size="x-small" variant="text" @click.stop="openEdit(cat)">
              <v-icon size="14">mdi-pencil-outline</v-icon>
            </v-btn>
            <v-btn icon size="x-small" variant="text" color="error" @click.stop="confirmDelete(cat)">
              <v-icon size="14">mdi-delete-outline</v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="showDialog" max-width="480">
      <v-card class="glass-card" rounded="xl">
        <v-card-title class="pa-6 pb-3 d-flex align-center">
          <span class="text-h6 font-weight-bold text-high-emphasis">
            {{ editItem ? t('cat.edit') : t('cat.new') }}
          </span>
          <v-spacer />
          <v-btn icon variant="text" @click="showDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider class="divider-gold" />
        <v-card-text class="pa-6">
          <v-text-field
            v-model="form.name"
            :label="t('cat.name')"
            prepend-inner-icon="mdi-tag-outline"
            :error-messages="formErrors.name"
            class="mb-3"
          />
          <v-select
            v-model="form.type"
            :label="t('cat.type')"
            :items="[{title:t('tx.type_income'),value:'income'},{title:t('tx.type_expense'),value:'expense'},{title:t('cat.both'),value:'both'}]"
            prepend-inner-icon="mdi-swap-horizontal"
            class="mb-3"
          />
          <!-- Icon Picker -->
          <div class="mb-3">
            <div class="text-body-2 mb-2 text-medium-emphasis">{{ t('icon') }}</div>
            <div class="icon-grid">
              <div
                v-for="ic in iconOptions"
                :key="ic"
                class="icon-option"
                :class="{ selected: form.icon === ic }"
                @click="form.icon = ic"
              >
                <v-icon :icon="ic" size="20" />
              </div>
            </div>
          </div>
          <!-- Color Picker -->
          <div>
            <div class="text-body-2 mb-2 text-medium-emphasis">{{ t('color') }}</div>
            <div class="color-grid">
              <div
                v-for="col in colorOptions"
                :key="col"
                class="color-dot"
                :class="{ selected: form.color === col }"
                :style="{ background: col }"
                @click="form.color = col"
              />
            </div>
          </div>
        </v-card-text>
        <v-divider class="divider-gold" />
        <v-card-actions class="pa-6 pt-4">
          <v-btn variant="tonal" @click="showDialog = false">{{ t('cancel') }}</v-btn>
          <v-spacer />
          <v-btn class="btn-gold" :loading="saving" @click="handleSave">
            {{ editItem ? t('save') : t('create') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model="showConfirm"
      :title="t('cat.delete_title')"
      :message="t('cat.delete_msg')"
      :loading="deleting"
      @confirm="doDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'

definePageMeta({ middleware: 'auth' })

const catStore = useCategoryStore()
const toast    = useToast()
const { t }    = useLocale()

const showDialog  = ref(false)
const showConfirm = ref(false)
const saving      = ref(false)
const deleting    = ref(false)
const editItem    = ref<any>(null)
const deleteItem  = ref<any>(null)
const formErrors  = reactive({ name: '' })

const form = reactive({ name: '', type: 'expense', icon: 'mdi-tag', color: '#0084C6' })

const iconOptions = [
  'mdi-food', 'mdi-car', 'mdi-home', 'mdi-shopping', 'mdi-receipt',
  'mdi-hospital-box', 'mdi-school', 'mdi-gamepad-variant', 'mdi-airplane',
  'mdi-gift', 'mdi-cash-multiple', 'mdi-trending-up', 'mdi-trending-down',
  'mdi-star-circle', 'mdi-laptop', 'mdi-phone', 'mdi-heart', 'mdi-music',
  'mdi-dumbbell', 'mdi-palette', 'mdi-book-open', 'mdi-briefcase',
  'mdi-shield-check', 'mdi-tag', 'mdi-plus-circle', 'mdi-minus-circle',
]

const colorOptions = [
  '#0084C6', '#052962', '#4CAF50', '#F44336', '#9C27B0',
  '#FF9800', '#00BCD4', '#E91E63', '#607D8B', '#795548',
  '#3F51B5', '#009688', '#FF5722', '#8BC34A', '#FFC107',
]

function typeColor(type: string) {
  return type === 'income' ? 'success' : type === 'expense' ? 'error' : 'warning'
}

function typeLabel(type: string) {
  if (type === 'income') return t('tx.type_income')
  if (type === 'expense') return t('tx.type_expense')
  return t('cat.both')
}

function openAdd() {
  editItem.value = null
  Object.assign(form, { name: '', type: 'expense', icon: 'mdi-tag', color: '#0084C6' })
  formErrors.name = ''
  showDialog.value = true
}

function openEdit(cat: any) {
  editItem.value = cat
  Object.assign(form, { name: cat.name, type: cat.type, icon: cat.icon, color: cat.color })
  formErrors.name = ''
  showDialog.value = true
}

function confirmDelete(cat: any) { deleteItem.value = cat; showConfirm.value = true }

async function handleSave() {
  formErrors.name = form.name ? '' : 'Name is required'
  if (formErrors.name) return

  saving.value = true
  try {
    if (editItem.value) {
      await catStore.update(editItem.value.id, form)
      toast.success(t('cat.updated'))
    } else {
      await catStore.create(form)
      toast.success(t('cat.created'))
    }
    showDialog.value = false
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!deleteItem.value) return
  deleting.value = true
  try {
    await catStore.remove(deleteItem.value.id)
    showConfirm.value = false
    deleteItem.value = null
    toast.success(t('cat.deleted'))
    await catStore.fetch()
  } catch (err: any) {
    toast.error(err.message || 'Delete failed')
  } finally {
    deleting.value = false
  }
}

onMounted(() => catStore.fetch())
</script>

<style scoped lang="scss">
.cat-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}
.icon-option {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(var(--v-theme-on-surface), 0.5);
  &:hover { border-color: #0084C6; color: #0084C6; }
  &.selected { border-color: #0084C6; background: rgba(0,132,198,0.15); color: #0084C6; }
}
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.color-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s, border-color 0.2s;
  &:hover { transform: scale(1.2); }
  &.selected { border-color: rgb(var(--v-theme-on-surface)); transform: scale(1.2); }
}
</style>
