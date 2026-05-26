// server/api/auth/me.get.ts
export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: useRuntimeConfig().sessionSecret,
  })

  if (!session.data?.userId) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const prisma = (await import('~~/server/utils/prisma')).default
  const user = await prisma.user.findUnique({
    where: { id: session.data.userId as string },
    select: { id: true, email: true, name: true },
  })

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'User not found' })
  }

  return user
})
