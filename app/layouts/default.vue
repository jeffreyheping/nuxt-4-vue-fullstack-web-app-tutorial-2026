<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
const config = useRuntimeConfig()
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <NuxtLink to="/" class="text-xl font-bold text-primary">
            {{ config.public.appName }}
          </NuxtLink>

          <nav class="flex items-center gap-4">
            <template v-if="isAuthenticated">
              <span class="text-sm text-gray-600 dark:text-gray-300">
                {{ user?.name }}
              </span>
              <UButton
                variant="ghost"
                color="red"
                @click="logout"
              >
                Logout
              </UButton>
            </template>
            <template v-else>
              <UButton to="/login" variant="ghost">Login</UButton>
              <UButton to="/register" color="primary">Sign Up</UButton>
            </template>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>
