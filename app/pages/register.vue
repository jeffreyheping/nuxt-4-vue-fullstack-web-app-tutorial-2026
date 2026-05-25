<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { register } = useAuth()
const error = ref('')
const loading = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

async function handleSubmit() {
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  error.value = ''
  loading.value = true
  try {
    await register(form.name, form.email, form.password)
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Registration error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-16">
    <UCard>
      <template #header>
        <h2 class="text-2xl font-bold text-center">Sign Up</h2>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UAlert
          v-if="error"
          color="red"
          :title="error"
          variant="subtle"
        />

        <UFormGroup label="Name">
          <UInput
            v-model="form.name"
            placeholder="Your name"
            required
          />
        </UFormGroup>

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

        <UFormGroup label="Confirm Password">
          <UInput
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
          />
        </UFormGroup>

        <UButton
          type="submit"
          block
          :loading="loading"
        >
          Create Account
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-500">
          Already have an account?
          <NuxtLink to="/login" class="text-primary font-medium">
            Login
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
