<script setup lang="ts">
const { isAuthenticated } = useAuth()
</script>

<template>
  <div class="text-center py-20">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
      Manage Your Tasks Efficiently
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
      TaskFlow is a simple and powerful task manager.
      Organize, prioritize, and track the progress of your projects.
    </p>
    <div class="flex gap-4 justify-center">
      <UButton
        v-if="!isAuthenticated"
        to="/register"
        size="lg"
        color="primary"
      >
        Get Started Free
      </UButton>
      <UButton
        v-if="isAuthenticated"
        to="/dashboard"
        size="lg"
        color="primary"
      >
        Go to Dashboard
      </UButton>
    </div>
  </div>
</template>
