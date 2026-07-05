<template>
  <v-app :theme="settingsStore.settings?.theme || 'light'">
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :width="256"
      class="nav-drawer"
      border="0"
    >
      <!-- Logo -->
      <div class="nav-logo pa-5">
        <div class="d-flex align-center">
          <div class="nav-logo__icon">
            <span class="text-h5 font-weight-black gold-text">₣</span>
          </div>
          <div class="ml-3">
            <div class="text-body-1 font-weight-bold text-high-emphasis">{{ t('app.name') }}</div>
            <div class="text-caption text-medium-emphasis">{{ t('app.tagline') }}</div>
          </div>
        </div>
      </div>

      <v-divider class="divider-gold mx-4 mb-2" />

      <!-- Nav Items -->
      <v-list density="compact" nav class="px-2">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          class="nav-item mb-1"
          rounded="lg"
          active-color="primary"
        />
      </v-list>

      <template #append>
        <div class="pa-4">
          <v-divider class="divider-gold mb-4" />

          <!-- User Card -->
          <div class="user-card glass-card pa-3 rounded-xl mb-3">
            <div class="d-flex align-center">
              <v-avatar size="36" color="primary" class="mr-3">
                <v-img v-if="authStore.userAvatar" :src="avatarUrl" />
                <span v-else class="text-body-2 font-weight-bold text-black">
                  {{ authStore.userName?.charAt(0) }}
                </span>
              </v-avatar>
              <div class="flex-1 overflow-hidden">
                <div class="text-body-2 font-weight-medium text-high-emphasis text-truncate">
                  {{ authStore.userName }}
                </div>
                <div class="text-caption text-truncate text-medium-emphasis">
                  {{ authStore.user?.email }}
                </div>
              </div>
            </div>
          </div>

          <v-btn
            block
            variant="tonal"
            color="error"
            prepend-icon="mdi-logout"
            @click="handleLogout"
            rounded="lg"
            size="small"
          >{{ t('logout') }}</v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar flat class="app-bar" border="b" height="64">
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
      />

      <v-app-bar-title>
        <span class="text-body-1 font-weight-medium">{{ pageTitle }}</span>
      </v-app-bar-title>

      <template #append>
        <div class="d-flex align-center ga-1 mr-2">
          <!-- Notifications -->
          <v-btn icon @click="goTo('/notifications')" variant="text">
            <v-badge
              v-if="notifStore.unreadCount > 0"
              :content="notifStore.unreadCount"
              color="primary"
              class="notif-badge"
            >
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell-outline</v-icon>
          </v-btn>

          <!-- Language Toggle -->
          <v-btn @click="toggleLanguage" variant="text" size="small" rounded="lg" class="lang-btn">
            <span class="lang-label">{{ locale === 'en' ? 'TH' : 'EN' }}</span>
          </v-btn>

          <!-- Theme Toggle -->
          <v-btn icon @click="toggleTheme" variant="text">
            <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
          </v-btn>

          <!-- Profile -->
          <v-btn icon @click="goTo('/profile')" variant="text">
            <v-avatar size="32" color="primary">
              <v-img v-if="authStore.userAvatar" :src="avatarUrl" />
              <span v-else class="text-caption font-weight-bold text-black">
                {{ authStore.userName?.charAt(0) }}
              </span>
            </v-avatar>
          </v-btn>
        </div>
      </template>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="main-content">
      <div class="page-container">
        <slot />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
const authStore     = useAuthStore()
const notifStore    = useNotificationStore()
const settingsStore = useSettingsStore()
const route         = useRoute()
const router        = useRouter()
const config        = useRuntimeConfig()
const { t, locale } = useLocale()

const drawer = ref(true)

const navItems = computed(() => [
  { to: '/',              icon: 'mdi-view-dashboard-outline', title: t('nav.dashboard') },
  { to: '/transactions',  icon: 'mdi-swap-horizontal',        title: t('nav.transactions') },
  { to: '/categories',    icon: 'mdi-tag-multiple-outline',   title: t('nav.categories') },
  { to: '/reports',       icon: 'mdi-chart-bar',              title: t('nav.reports') },
  { to: '/notifications', icon: 'mdi-bell-outline',           title: t('nav.notifications') },
  { to: '/settings',      icon: 'mdi-cog-outline',            title: t('nav.settings') },
  { to: '/profile',       icon: 'mdi-account-circle-outline', title: t('nav.profile') },
])

const pageTitleMap = computed<Record<string, string>>(() => ({
  '/':              t('nav.dashboard'),
  '/transactions':  t('nav.transactions'),
  '/categories':    t('nav.categories'),
  '/reports':       t('nav.reports'),
  '/notifications': t('nav.notifications'),
  '/settings':      t('nav.settings'),
  '/profile':       t('nav.profile'),
}))

const pageTitle = computed(() => pageTitleMap.value[route.path] || 'FinanceApp')
const isDark    = computed(() => settingsStore.settings?.theme === 'dark')
const avatarUrl = computed(() => {
  if (!authStore.userAvatar) return null
  return `${config.public.apiBase.replace('/api', '')}${authStore.userAvatar}`
})

function goTo(path: string) { router.push(path) }

function toggleTheme() {
  const newTheme = isDark.value ? 'light' : 'dark'
  settingsStore.settings.theme = newTheme
  settingsStore.update({ ...settingsStore.settings, theme: newTheme }).catch(() => {})
}

function toggleLanguage() {
  const newLang = locale.value === 'en' ? 'th' : 'en'
  settingsStore.settings.language = newLang
  settingsStore.update({ ...settingsStore.settings, language: newLang }).catch(() => {})
}

async function handleLogout() {
  await authStore.logout()
}

// Apply font class based on locale
watch(locale, (lang) => {
  if (process.client) {
    document.documentElement.classList.remove('lang-en', 'lang-th')
    document.documentElement.classList.add(`lang-${lang}`)
  }
}, { immediate: true })

// Poll unread count
onMounted(() => {
  notifStore.fetchUnreadCount().catch(() => {})
  const interval = setInterval(() => notifStore.fetchUnreadCount().catch(() => {}), 60_000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped lang="scss">
.nav-drawer {
  background: rgb(var(--v-theme-surface)) !important;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.05) !important;
}
.nav-logo {
  &__icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, rgba(0,132,198,0.2), rgba(0,132,198,0.05));
    border: 1px solid rgba(0,132,198,0.3);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.app-bar {
  background: rgb(var(--v-theme-surface)) !important;
  backdrop-filter: blur(10px);
}
.main-content {
  background: rgb(var(--v-theme-background)) !important;
}
.page-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}
.user-card {
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
}
.lang-btn { min-width: 36px !important; padding: 0 8px !important; }
.lang-label { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
:deep(.v-list-item--active) {
  background: linear-gradient(135deg, rgba(0,132,198,0.15), rgba(0,132,198,0.05)) !important;
  border-left: 3px solid #0084C6 !important;
}
:deep(.v-list-item__prepend .v-icon) {
  opacity: 0.7;
}
:deep(.v-list-item--active .v-list-item__prepend .v-icon) {
  opacity: 1;
  color: #0084C6 !important;
}
</style>
