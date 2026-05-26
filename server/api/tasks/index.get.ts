// server/api/tasks/index.get.ts
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  const query = getQuery(event)

  const where: any = { userId: user.id }

  if (query.status) {
    where.status = query.status
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return tasks
})
