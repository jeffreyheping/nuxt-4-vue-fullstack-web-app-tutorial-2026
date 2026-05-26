<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { login } = useAuth()
const error = ref('')
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
})

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login(form.email, form.password)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Login error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold text-center">Login</h2>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UAlert
          v-if="error"
          color="red"
          :title="error"
          variant="subtle"
        />

        <UFormGroup label="Email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="you@email.com"
            required
          />
        </UFormGroup>

        <UFormGroup label="Password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Your password"
            required
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          :loading="loading"
        >
          Sign In
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500">
          No account yet?
          <NuxtLink to="/register" class="text-primary font-medium">
            Sign up
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
