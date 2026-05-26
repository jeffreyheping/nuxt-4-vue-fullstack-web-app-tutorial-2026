// server/api/tasks/[id]/index.patch.ts
import prisma from '~~/server/utils/prisma'
import { updateTaskSchema } from '~~/server/utils/validate'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const result = updateTaskSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message,
    })
  }

  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
  })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found',
    })
  }

  const updated = await prisma.task.update({
    where: { id },
    data: result.data,
  })

  return updated
})
