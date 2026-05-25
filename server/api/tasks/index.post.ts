import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const body = await readBody(event)

  if (!body.title) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title is required',
    })
  }

  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      priority: body.priority || 'MEDIUM',
      userId: user.id,
    },
  })

  return task
})
