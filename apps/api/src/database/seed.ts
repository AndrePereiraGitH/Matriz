import { prisma } from './prisma.js'
import { seedDemoData } from './seed-data.js'

async function main(): Promise<void> {
  const userAPassword = process.env.DEMO_USER_A_PASSWORD
  const userBPassword = process.env.DEMO_USER_B_PASSWORD

  if (!userAPassword || !userBPassword) {
    throw new Error(
      'Set DEMO_USER_A_PASSWORD and DEMO_USER_B_PASSWORD in apps/api/.env before seeding',
    )
  }

  await prisma.$connect()
  await seedDemoData(prisma, {
    userA: userAPassword,
    userB: userBPassword,
  })

  console.log(
    'Demo data is ready: ana.demo@example.test and bruno.demo@example.test',
  )
}

main()
  .catch((error: unknown) => {
    console.error('Failed to seed demo data:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
