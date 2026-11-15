import type { Prisma, PrismaClient } from '@prisma/client'
import { hashPassword } from '../auth/password.js'

const DEMO_USERS = [
  {
    id: 'demo-user-a',
    name: 'Ana Demonstração',
    email: 'ana.demo@example.test',
    teamId: 'demo-team-a',
    teamName: 'Equipa de Demonstração A',
    projectId: 'demo-project-a',
    projectName: 'Projeto de Demonstração A',
    taskId: 'demo-task-a',
    taskTitle: 'Preparar o primeiro projeto',
    status: 'TODO',
    priority: 'MEDIUM',
  },
  {
    id: 'demo-user-b',
    name: 'Bruno Demonstração',
    email: 'bruno.demo@example.test',
    teamId: 'demo-team-b',
    teamName: 'Equipa de Demonstração B',
    projectId: 'demo-project-b',
    projectName: 'Projeto de Demonstração B',
    taskId: 'demo-task-b',
    taskTitle: 'Rever o segundo projeto',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
  },
] as const

function validatePassword(password: string, label: string): void {
  if (password.length < 12) {
    throw new Error(`${label} must contain at least 12 characters`)
  }
}

export async function seedDemoData(
  prisma: PrismaClient,
  passwords: { userA: string; userB: string },
): Promise<void> {
  validatePassword(passwords.userA, 'DEMO_USER_A_PASSWORD')
  validatePassword(passwords.userB, 'DEMO_USER_B_PASSWORD')

  const transaction = async (tx: Prisma.TransactionClient) => {
    for (const [index, demoUser] of DEMO_USERS.entries()) {
      const password = index === 0 ? passwords.userA : passwords.userB

      const user = await tx.user.upsert({
        where: { email: demoUser.email },
        create: {
          id: demoUser.id,
          name: demoUser.name,
          email: demoUser.email,
          passwordHash: hashPassword(password),
        },
        update: {},
      })

      await tx.team.upsert({
        where: { id: demoUser.teamId },
        create: {
          id: demoUser.teamId,
          name: demoUser.teamName,
        },
        update: {},
      })

      await tx.teamMembership.upsert({
        where: {
          teamId_userId: {
            teamId: demoUser.teamId,
            userId: user.id,
          },
        },
        create: {
          teamId: demoUser.teamId,
          userId: user.id,
        },
        update: {},
      })

      await tx.project.upsert({
        where: { id: demoUser.projectId },
        create: {
          id: demoUser.projectId,
          name: demoUser.projectName,
          teamId: demoUser.teamId,
          ownerId: user.id,
          description: 'Dados fictícios para desenvolvimento local.',
        },
        update: { ownerId: user.id },
      })

      await tx.task.upsert({
        where: { id: demoUser.taskId },
        create: {
          id: demoUser.taskId,
          title: demoUser.taskTitle,
          projectId: demoUser.projectId,
          status: demoUser.status,
          priority: demoUser.priority,
        },
        update: {},
      })
    }
  }

  await prisma.$transaction(transaction)
}
