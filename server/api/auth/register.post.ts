import bcrypt from 'bcryptjs'
import prisma from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email || !body.password || !body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email, name, and password are required',
    })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'An account with this email already exists',
    })
  }

  const hashedPassword = await bcrypt.hash(body.password, 12)

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  const session = await useSession(event, {
    password: useRuntimeConfig().sessionSecret,
  })
  await session.update({ userId: user.id })

  return user
})
