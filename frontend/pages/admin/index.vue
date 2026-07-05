<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold text-high-emphasis mb-1">
          <v-icon color="primary" class="mr-1">mdi-shield-account-outline</v-icon>
          {{ t('admin.title') }}
        </h1>
        <p class="text-body-2 text-medium-emphasis">{{ t('admin.subtitle') }}</p>
      </div>
    </div>

    <!-- Stats -->
    <v-row dense class="mb-4">
      <v-col v-for="s in statCards" :key="s.label" cols="6" md="3">
        <v-card class="glass-card stat-card pa-4" rounded="xl">
          <div class="d-flex align-center">
            <v-avatar :color="s.color" variant="tonal" size="42" class="mr-3">
              <v-icon :icon="s.icon" size="22" />
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold text-high-emphasis">{{ s.value ?? '—' }}</div>
              <div class="text-caption text-medium-emphasis">{{ s.label }}</div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Users Table -->
    <v-card class="glass-card" rounded="xl">
      <div class="d-flex align-center pa-4 pb-0">
        <span class="text-body-1 font-weight-semibold text-high-emphasis">{{ t('admin.users') }}</span>
        <v-spacer />
        <v-text-field
          v-model="search"
          :label="t('admin.search_users')"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          density="compact"
          style="max-width: 280px"
          @update:modelValue="onSearch"
        />
      </div>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="adminStore.users"
        :items-length="adminStore.meta?.total || 0"
        :loading="adminStore.loading"
        :page="page"
        class="finance-table transparent-bg"
        @update:page="onPageChange"
      >
        <!-- User -->
        <template #item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="32" color="primary" class="mr-3">
              <v-img v-if="item.avatar" :src="avatarUrl(item.avatar)" />
              <span v-else class="text-caption font-weight-bold">{{ item.name?.charAt(0) }}</span>
            </v-avatar>
            <div>
              <div class="text-body-2 font-weight-medium text-high-emphasis">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Role -->
        <template #item.role="{ item }">
          <v-chip
            :color="item.role === 'admin' ? 'primary' : undefined"
            variant="tonal"
            size="small"
            :prepend-icon="item.role === 'admin' ? 'mdi-shield-account' : 'mdi-account'"
          >{{ item.role === 'admin' ? t('profile.admin') : t('profile.user') }}</v-chip>
        </template>

        <!-- Status -->
        <template #item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            variant="tonal"
            size="small"
          >{{ item.is_active ? t('admin.active') : t('admin.suspended') }}</v-chip>
        </template>

        <!-- Transactions -->
        <template #item.transaction_count="{ item }">
          {{ item.transaction_count }}
        </template>

        <!-- Joined -->
        <template #item.created_at="{ item }">
          {{ f.formatDate(item.created_at) }}
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn icon size="x-small" variant="text" @click="openEdit(item)">
            <v-icon size="16">mdi-pencil-outline</v-icon>
          </v-btn>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Edit User Dialog -->
    <v-dialog v-model="showEdit" max-width="480">
      <v-card class="glass-card" rounded="xl">
        <v-card-title class="pa-6 pb-3 d-flex align-center">
          <span class="text-h6 font-weight-bold text-high-emphasis">{{ t('admin.edit_user') }}</span>
          <v-spacer />
          <v-btn icon variant="text" @click="showEdit = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>

        <v-divider class="divider-gold" />

        <v-card-text class="pa-6">
          <v-text-field
            v-model="editForm.name"
            :label="t('profile.full_name')"
            prepend-inner-icon="mdi-account-outline"
            class="mb-3"
          />
          <v-text-field
            v-model="editForm.email"
            :label="t('profile.email')"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            class="mb-3"
          />
          <v-select
            v-model="editForm.role"
            :label="t('admin.col_role')"
            :items="roleItems"
            prepend-inner-icon="mdi-shield-account-outline"
            :disabled="isSelf"
            class="mb-3"
          />
          <v-switch
            v-model="editForm.is_active"
            :label="t('admin.account_active')"
            color="success"
            :disabled="isSelf"
            hide-details
          />
        </v-card-text>

        <v-divider class="divider-gold" />

        <v-card-actions class="pa-6 pt-4">
          <v-btn variant="tonal" @click="showEdit = false" :disabled="saving">{{ t('cancel') }}</v-btn>
          <v-spacer />
          <v-btn class="btn-gold" :loading="saving" min-width="120" @click="saveUser">
            {{ t('save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { useDebounceFn } from '@vueuse/core'

definePageMeta({ middleware: ['auth', 'admin'] })

const adminStore = useAdminStore()
const authStore  = useAuthStore()
const toast      = useToast()
const config     = useRuntimeConfig()
const f          = useFormatters()
const { t }      = useLocale()

const page         = ref(1)
const itemsPerPage = ref(20)
const search       = ref('')
const showEdit     = ref(false)
const saving       = ref(false)
const editItem     = ref<any>(null)
const editForm     = reactive({ name: '', email: '', role: 'user', is_active: true })

const isSelf = computed(() => editItem.value?.id === authStore.user?.id)

const headers = computed(() => [
  { title: t('admin.col_user'),   key: 'name',              sortable: false },
  { title: t('admin.col_role'),   key: 'role',              sortable: false },
  { title: t('admin.col_status'), key: 'is_active',         sortable: false },
  { title: t('admin.col_tx'),     key: 'transaction_count', sortable: false },
  { title: t('admin.col_joined'), key: 'created_at',        sortable: false },
  { title: t('tx.col_actions'),   key: 'actions',           sortable: false },
])

const roleItems = computed(() => [
  { title: t('profile.user'),  value: 'user' },
  { title: t('profile.admin'), value: 'admin' },
])

const statCards = computed(() => [
  { label: t('admin.total_users'),  value: adminStore.stats?.total_users,        icon: 'mdi-account-group-outline', color: 'primary' },
  { label: t('admin.active_users'), value: adminStore.stats?.active_users,       icon: 'mdi-account-check-outline', color: 'success' },
  { label: t('admin.admins'),       value: adminStore.stats?.admins,             icon: 'mdi-shield-account-outline', color: 'info' },
  { label: t('admin.total_tx'),     value: adminStore.stats?.total_transactions, icon: 'mdi-swap-horizontal',       color: 'warning' },
])

function avatarUrl(path: string) {
  return `${config.public.apiBase.replace('/api', '')}${path}`
}

const onSearch = useDebounceFn(() => {
  page.value = 1
  adminStore.fetchUsers({ page: 1, limit: itemsPerPage.value, search: search.value })
}, 400)

function onPageChange(p: number) {
  page.value = p
  adminStore.fetchUsers({ page: p, limit: itemsPerPage.value, search: search.value })
}

function openEdit(user: any) {
  editItem.value = user
  Object.assign(editForm, {
    name:      user.name,
    email:     user.email,
    role:      user.role,
    is_active: !!user.is_active,
  })
  showEdit.value = true
}

async function saveUser() {
  if (!editItem.value) return
  saving.value = true
  try {
    await adminStore.updateUser(editItem.value.id, { ...editForm })
    toast.success(t('admin.updated'))
    showEdit.value = false
    adminStore.fetchStats().catch(() => {})
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  adminStore.fetchUsers({ page: 1, limit: itemsPerPage.value }).catch(() => {})
  adminStore.fetchStats().catch(() => {})
})
</script>

<style scoped lang="scss">
:deep(.transparent-bg) { background: transparent !important; }
:deep(.v-data-table__td) { border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05) !important; }
:deep(.v-data-table-header__content) { color: rgba(var(--v-theme-on-surface), 0.5) !important; font-size: 11px; text-transform: uppercase; }
</style>
