// server/api/auth/logout.post.ts
export default defineEventHandler(async (event) => {
  const session = await useSession(event, {
    password: useRuntimeConfig().sessionSecret,
  })
  await session.clear()
  return { success: true }
})
