import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const id = getRouterParam(event, 'id')

  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
  })

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found',
    })
  }

  await prisma.task.delete({ where: { id } })

  return { success: true }
})
