import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required',
    })
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  const session = await useSession(event, {
    password: useRuntimeConfig().sessionSecret,
  })
  await session.update({ userId: user.id })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
})
