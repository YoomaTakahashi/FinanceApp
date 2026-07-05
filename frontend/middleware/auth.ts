export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.loadFromStorage()

  const publicRoutes = ['/auth/login', '/auth/register']
  const isPublic     = publicRoutes.includes(to.path)

  if (!authStore.accessToken && !isPublic) {
    return navigateTo('/auth/login')
  }

  if (authStore.accessToken && isPublic) {
    return navigateTo('/')
  }
})
