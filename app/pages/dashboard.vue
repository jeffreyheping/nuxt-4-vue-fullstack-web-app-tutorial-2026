<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  createdAt: string
}

const { isAuthenticated, fetchUser } = useAuth()
const tasks = ref<Task[]>([])
const loading = ref(true)
const error = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)

const newTask = reactive({
  title: '',
  description: '',
  priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
})

const editingTask = reactive<Task | null>(null)

const statusLabels: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

const priorityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
}

const priorityColors: Record<string, string> = {
  LOW: 'gray',
  MEDIUM: 'yellow',
  HIGH: 'red',
}

async function loadTasks() {
  loading.value = true
  error.value = ''
  try {
    tasks.value = await $fetch('/api/tasks')
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Failed to load tasks'
    if (e.status === 401) {
      navigateTo('/login')
    }
  } finally {
    loading.value = false
  }
}

async function createTask() {
  if (!newTask.title.trim()) return
  
  try {
    await $fetch('/api/tasks', {
      method: 'POST',
      body: {
        title: newTask.title,
        description: newTask.description || null,
        priority: newTask.priority,
      },
    })
    showCreateModal.value = false
    newTask.title = ''
    newTask.description = ''
    newTask.priority = 'MEDIUM'
    await loadTasks()
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Failed to create task'
  }
}

async function updateTask() {
  if (!editingTask?.id || !editingTask.title.trim()) return

  try {
    await $fetch(`/api/tasks/${editingTask.id}`, {
      method: 'PATCH',
      body: {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        priority: editingTask.priority,
      },
    })
    showEditModal.value = false
    editingTask.id = ''
    editingTask.title = ''
    editingTask.description = ''
    editingTask.status = 'TODO'
    editingTask.priority = 'MEDIUM'
    await loadTasks()
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Failed to update task'
  }
}

async function deleteTask(id: string) {
  try {
    await $fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    })
    await loadTasks()
  } catch (e: any) {
    error.value = e.data?.statusMessage || 'Failed to delete task'
  }
}

function openEditModal(task: Task) {
  editingTask.id = task.id
  editingTask.title = task.title
  editingTask.description = task.description
  editingTask.status = task.status
  editingTask.priority = task.priority
  editingTask.createdAt = task.createdAt
  showEditModal.value = true
}

onMounted(async () => {
  await fetchUser()
  if (!isAuthenticated.value) {
    navigateTo('/login')
    return
  }
  await loadTasks()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
      <UButton color="primary" @click="showCreateModal = true">
        Add Task
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="red"
      :title="error"
      variant="subtle"
      class="mb-6"
    />

    <div v-if="loading" class="flex justify-center py-12">
      <ULoading />
    </div>

    <div v-else-if="tasks.length === 0" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">No tasks yet. Create your first task!</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="status in ['TODO', 'IN_PROGRESS', 'DONE']" :key="status" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {{ statusLabels[status] }}
          <span class="ml-2 text-sm font-normal text-gray-500">
            ({{ tasks.filter(t => t.status === status).length }})
          </span>
        </h2>
        
        <div class="space-y-3">
          <UCard
            v-for="task in tasks.filter(t => t.status === status)"
            :key="task.id"
            class="cursor-pointer hover:shadow-md transition-shadow"
            @click="openEditModal(task)"
          >
            <template #content>
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900 dark:text-white">{{ task.title }}</h3>
                  <p v-if="task.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ task.description }}
                  </p>
                  <div class="flex items-center gap-2 mt-2">
                    <UBadge :color="priorityColors[task.priority]" variant="subtle">
                      {{ priorityLabels[task.priority] }}
                    </UBadge>
                  </div>
                </div>
                <UButton
                  variant="ghost"
                  color="red"
                  size="sm"
                  class="ml-2"
                  @click.stop="deleteTask(task.id)"
                >
                  <component :is="icons.trash2" class="w-4 h-4" />
                </UButton>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </div>

    <UDialog v-model="showCreateModal" :title="'Create New Task'">
      <form @submit.prevent="createTask" class="space-y-4">
        <UFormGroup label="Title">
          <UInput
            v-model="newTask.title"
            placeholder="Enter task title"
            required
          />
        </UFormGroup>

        <UFormGroup label="Description">
          <UTextarea
            v-model="newTask.description"
            placeholder="Enter task description (optional)"
          />
        </UFormGroup>

        <UFormGroup label="Priority">
          <USelect
            v-model="newTask.priority"
            :options="[
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
            ]"
          />
        </UFormGroup>

        <div class="flex gap-3 justify-end">
          <UButton variant="ghost" @click="showCreateModal = false">Cancel</UButton>
          <UButton type="submit" color="primary">Create</UButton>
        </div>
      </form>
    </UDialog>

    <UDialog v-model="showEditModal" :title="'Edit Task'">
      <form @submit.prevent="updateTask" class="space-y-4">
        <UFormGroup label="Title">
          <UInput
            v-model="editingTask.title"
            placeholder="Enter task title"
            required
          />
        </UFormGroup>

        <UFormGroup label="Description">
          <UTextarea
            v-model="editingTask.description"
            placeholder="Enter task description (optional)"
          />
        </UFormGroup>

        <UFormGroup label="Status">
          <USelect
            v-model="editingTask.status"
            :options="[
              { label: 'To Do', value: 'TODO' },
              { label: 'In Progress', value: 'IN_PROGRESS' },
              { label: 'Done', value: 'DONE' },
            ]"
          />
        </UFormGroup>

        <UFormGroup label="Priority">
          <USelect
            v-model="editingTask.priority"
            :options="[
              { label: 'Low', value: 'LOW' },
              { label: 'Medium', value: 'MEDIUM' },
              { label: 'High', value: 'HIGH' },
            ]"
          />
        </UFormGroup>

        <div class="flex gap-3 justify-end">
          <UButton variant="ghost" @click="showEditModal = false">Cancel</UButton>
          <UButton type="submit" color="primary">Update</UButton>
        </div>
      </form>
    </UDialog>
  </div>
</template>
