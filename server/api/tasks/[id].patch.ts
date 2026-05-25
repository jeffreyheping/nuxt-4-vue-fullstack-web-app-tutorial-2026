import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

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
    data: {
      title: body.title ?? task.title,
      description: body.description ?? task.description,
      status: body.status ?? task.status,
      priority: body.priority ?? task.priority,
    },
  })

  return updated
})
