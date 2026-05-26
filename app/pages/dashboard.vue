<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
}

const activeFilter = ref<string | null>(null)

// 注意：不使用 await，避免阻塞组件渲染导致表单 v-model 绑定异常
const { data: tasks, pending, refresh } = useFetch<Task[]>('/api/tasks', {
  query: computed(() => ({
    status: activeFilter.value || undefined,
  })),
})

const showCreateModal = ref(false)

// 用独立 ref 替代 reactive，确保 UModal 内 v-model 绑定可靠
const taskTitle = ref('')
const taskDescription = ref('')
const taskPriority = ref<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')

function resetForm() {
  taskTitle.value = ''
  taskDescription.value = ''
  taskPriority.value = 'MEDIUM'
}

async function createTask() {
  await $fetch('/api/tasks', {
    method: 'POST',
    body: {
      title: taskTitle.value,
      description: taskDescription.value || null,
      priority: taskPriority.value,
    },
  })
  resetForm()
  showCreateModal.value = false
  refresh()
}

async function updateTaskStatus(taskId: string, status: string) {
  await $fetch(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: { status },
  })
  refresh()
}

async function deleteTask(taskId: string) {
  await $fetch(`/api/tasks/${taskId}`, {
    method: 'DELETE',
  })
  refresh()
}

const filters = [
  { label: 'All', value: null },
  { label: 'To Do', value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
]

const priorityColors = {
  LOW: 'green',
  MEDIUM: 'yellow',
  HIGH: 'red',
} as const
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        My Tasks
      </h1>
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        @click="showCreateModal = true"
      >
        New Task
      </UButton>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 mb-6">
      <UButton
        v-for="filter in filters"
        :key="filter.label"
        :variant="activeFilter === filter.value ? 'solid' : 'ghost'"
        size="sm"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </UButton>
    </div>

    <!-- Task List -->
    <div v-if="pending" class="text-center py-12 text-gray-500">
      <p class="text-lg">Loading tasks...</p>
    </div>

    <div v-else class="space-y-3">
      <UCard
        v-for="task in tasks"
        :key="task.id"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3
                class="font-medium"
                :class="task.status === 'DONE' ? 'line-through text-gray-400' : ''"
              >
                {{ task.title }}
              </h3>
              <UBadge :color="priorityColors[task.priority]" size="xs">
                {{ task.priority }}
              </UBadge>
            </div>
            <p v-if="task.description" class="text-sm text-gray-500">
              {{ task.description }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <USelect
              :model-value="task.status"
              :options="[
                { label: 'To Do', value: 'TODO' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
                { label: 'Done', value: 'DONE' },
              ]"
              size="sm"
              @update:model-value="updateTaskStatus(task.id, $event)"
            />
            <UButton
              icon="i-heroicons-trash"
              color="red"
              variant="ghost"
              size="sm"
              @click="deleteTask(task.id)"
            />
          </div>
        </div>
      </UCard>

      <div
        v-if="!tasks?.length"
        class="text-center py-12 text-gray-500"
      >
        <p class="text-lg mb-2">No tasks found</p>
        <p class="text-sm">Click "New Task" to get started</p>
      </div>
    </div>

    <!-- Create Modal -->
    <UModal v-model="showCreateModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-medium">New Task</h3>
        </template>

        <form @submit.prevent="createTask" class="space-y-4">
          <UFormGroup label="Title" required>
            <UInput
              v-model="taskTitle"
              placeholder="Task title"
              required
            />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea
              v-model="taskDescription"
              placeholder="Optional description"
            />
          </UFormGroup>

          <UFormGroup label="Priority">
            <USelect
              v-model="taskPriority"
              :options="[
                { label: 'Low', value: 'LOW' },
                { label: 'Medium', value: 'MEDIUM' },
                { label: 'High', value: 'HIGH' },
              ]"
            />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              @click="showCreateModal = false"
            >
              Cancel
            </UButton>
            <UButton type="submit" color="primary">
              Create
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
