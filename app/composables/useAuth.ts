interface User {
  id: string
  email: string
  name: string
}

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string) {
    const data = await $fetch<User>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = data
    return data
  }

  async function register(name: string, email: string, password: string) {
    const data = await $fetch<User>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    })
    user.value = data
    return data
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  async function fetchUser() {
    try {
      const data = await $fetch<User>('/api/auth/me')
      user.value = data
    } catch {
      user.value = null
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
  }
}
