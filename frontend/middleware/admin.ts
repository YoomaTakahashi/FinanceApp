// Frontend guard for admin-only pages (UX only — the real enforcement is
// the backend requireAdmin middleware, which checks the role in the DB
// on every /api/admin request).
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  if (!authStore.accessToken) {
    return navigateTo('/auth/login')
  }

  // On a hard refresh the user object isn't loaded yet — fetch it
  // so the role check below is accurate.
  if (!authStore.user) {
    try {
      await authStore.fetchMe()
    } catch {
      return navigateTo('/auth/login')
    }
  }

  if (!authStore.isAdmin) {
    return navigateTo('/')
  }
})
