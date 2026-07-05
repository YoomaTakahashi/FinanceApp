<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold text-high-emphasis mb-1">{{ t('profile.title') }}</h1>
      <p class="text-body-2 text-medium-emphasis">{{ t('profile.subtitle') }}</p>
    </div>

    <v-row>
      <!-- Avatar Card -->
      <v-col cols="12" md="4">
        <v-card class="glass-card pa-6 text-center" rounded="xl">
          <div class="avatar-wrapper mx-auto mb-4">
            <v-avatar size="120" color="primary">
              <v-img v-if="avatarPreview || authStore.userAvatar" :src="avatarPreview || fullAvatarUrl" />
              <span v-else class="text-h4 font-weight-bold text-black">
                {{ authStore.userName?.charAt(0) }}
              </span>
            </v-avatar>
            <div class="avatar-overlay" @click="triggerAvatarUpload">
              <v-icon color="white" size="24">mdi-camera</v-icon>
            </div>
          </div>
          <input
            ref="avatarInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            class="d-none"
            @change="onAvatarSelected"
          />

          <div class="text-h6 font-weight-bold text-high-emphasis mb-1">{{ authStore.userName }}</div>
          <div class="text-body-2 mb-3 text-medium-emphasis">{{ authStore.user?.email }}</div>
          <v-chip :color="authStore.isAdmin ? 'warning' : 'primary'" size="small">
            {{ authStore.isAdmin ? t('profile.admin') : t('profile.user') }}
          </v-chip>

          <div class="mt-4 pt-4" style="border-top:1px solid rgba(var(--v-theme-on-surface), 0.08)">
            <div class="text-caption text-medium-emphasis">{{ t('profile.member_since') }}</div>
            <div class="text-body-2 text-high-emphasis">{{ memberSince }}</div>
          </div>
        </v-card>
      </v-col>

      <!-- Edit Form -->
      <v-col cols="12" md="8">
        <!-- Personal Info -->
        <v-card class="glass-card pa-6 mb-4" rounded="xl">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-2">mdi-account-outline</v-icon>
            <span class="text-body-1 font-weight-semibold text-high-emphasis">{{ t('profile.personal') }}</span>
          </div>

          <v-text-field
            v-model="profileForm.name"
            :label="t('profile.full_name')"
            prepend-inner-icon="mdi-account-outline"
            :error-messages="profileErrors.name"
            class="mb-3"
          />

          <v-text-field
            :model-value="authStore.user?.email"
            :label="t('profile.email')"
            prepend-inner-icon="mdi-email-outline"
            disabled
            :hint="t('profile.email_hint')"
            persistent-hint
          />

          <div class="d-flex justify-end mt-4">
            <v-btn class="btn-gold" :loading="savingProfile" @click="saveProfile">
              {{ t('profile.save') }}
            </v-btn>
          </div>
        </v-card>

        <!-- Change Password -->
        <v-card class="glass-card pa-6" rounded="xl">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-2">mdi-lock-outline</v-icon>
            <span class="text-body-1 font-weight-semibold text-high-emphasis">{{ t('profile.change_password') }}</span>
          </div>

          <v-text-field
            v-model="passForm.currentPassword"
            :label="t('profile.current_pass')"
            :type="showPass.current ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPass.current ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPass.current = !showPass.current"
            :error-messages="passErrors.current"
            class="mb-3"
          />

          <v-text-field
            v-model="passForm.newPassword"
            :label="t('profile.new_pass')"
            :type="showPass.new ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-reset"
            :append-inner-icon="showPass.new ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPass.new = !showPass.new"
            :error-messages="passErrors.new"
            class="mb-3"
          />

          <v-text-field
            v-model="passForm.confirmPassword"
            :label="t('profile.confirm_pass')"
            :type="showPass.confirm ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-check-outline"
            :append-inner-icon="showPass.confirm ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPass.confirm = !showPass.confirm"
            :error-messages="passErrors.confirm"
            class="mb-4"
          />

          <div class="d-flex justify-end">
            <v-btn color="error" variant="tonal" :loading="savingPass" @click="changePassword">
              {{ t('profile.change_password') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'vue-toastification'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const toast     = useToast()
const config    = useRuntimeConfig()
const f         = useFormatters()
const { t }     = useLocale()

const avatarInput   = ref<HTMLInputElement>()
const avatarPreview = ref('')
const avatarFile    = ref<File | null>(null)
const savingProfile = ref(false)
const savingPass    = ref(false)

const profileForm   = reactive({ name: authStore.userName || '' })
const profileErrors = reactive({ name: '' })
const passForm      = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const passErrors    = reactive({ current: '', new: '', confirm: '' })
const showPass      = reactive({ current: false, new: false, confirm: false })

const fullAvatarUrl = computed(() => {
  if (!authStore.userAvatar) return ''
  return `${config.public.apiBase.replace('/api', '')}${authStore.userAvatar}`
})

const memberSince = computed(() =>
  authStore.user?.created_at ? f.formatDate(authStore.user.created_at, 'MMMM YYYY') : ''
)

function triggerAvatarUpload() { avatarInput.value?.click() }

function onAvatarSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarFile.value    = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function saveProfile() {
  profileErrors.name = profileForm.name ? '' : 'Name is required'
  if (profileErrors.name) return

  savingProfile.value = true
  try {
    const fd = new FormData()
    fd.append('name', profileForm.name)
    if (avatarFile.value) fd.append('avatar', avatarFile.value)
    await authStore.updateProfile(fd)
    toast.success(t('profile.updated'))
    avatarFile.value    = null
    avatarPreview.value = ''
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  passErrors.current = passForm.currentPassword ? '' : 'Current password required'
  passErrors.new     = passForm.newPassword.length >= 6 ? '' : 'Min 6 characters'
  passErrors.confirm = passForm.newPassword === passForm.confirmPassword ? '' : 'Passwords do not match'
  if (passErrors.current || passErrors.new || passErrors.confirm) return

  savingPass.value = true
  try {
    const { put } = useApi()
    await put('/auth/change-password', {
      currentPassword: passForm.currentPassword,
      newPassword:     passForm.newPassword,
    })
    toast.success(t('profile.pass_changed'))
    await authStore.logout()
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    savingPass.value = false
  }
}
</script>

<style scoped lang="scss">
.avatar-wrapper {
  position: relative;
  width: 120px;
  &:hover .avatar-overlay { opacity: 1; }
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}
</style>
