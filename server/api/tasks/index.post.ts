// server/api/tasks/index.post.ts
import prisma from '~~/server/utils/prisma'
import { createTaskSchema } from '~~/server/utils/validate'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)

  const result = createTaskSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: result.error.issues[0].message,
    })
  }

  const task = await prisma.task.create({
    data: {
      ...result.data,
      description: result.data.description || null,
      userId: user.id,
    },
  })

  return task
})
