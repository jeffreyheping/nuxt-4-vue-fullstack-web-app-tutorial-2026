// app/middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  await fetchUser()

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
