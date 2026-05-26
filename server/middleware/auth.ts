// server/middleware/auth.ts
import prisma from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const protectedRoutes = ['/api/tasks']

  const isProtected = protectedRoutes.some((route) =>
    event.path?.startsWith(route)
  )

  if (!isProtected) return

  const session = await useSession(event, {
    password: useRuntimeConfig().sessionSecret,
  })

  if (!session.data?.userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.data.userId as string },
    select: { id: true, email: true, name: true },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    })
  }

  event.context.user = user
})
