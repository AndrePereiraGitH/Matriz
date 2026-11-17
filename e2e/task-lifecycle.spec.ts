import { expect, test } from '@playwright/test'

test.describe('Fluxo E2E: Tarefas da Matriz (Exercício 4)', () => {
  test('autenticar, abrir projeto, criar tarefa e verificar persistência na listagem', async ({
    page,
  }) => {
    const timestamp = Date.now()
    const taskTitle = `Preparar relatório E2E ${timestamp}`
    const taskDescription =
      'Tarefa criada e verificada no percurso E2E através da interface.'

    // 1. Aceder à aplicação e autenticar
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Iniciar sessão' }),
    ).toBeVisible()

    await page.getByLabel('Email').fill('ana.demo@example.test')
    await page
      .getByLabel('Palavra-passe')
      .fill('local-demo-password-a-change-me')
    await page.getByRole('button', { name: 'Iniciar sessão' }).click()

    // 2. Verificar acesso ao painel de gestão de projetos
    await expect(
      page.getByRole('heading', { name: 'Gestão de projetos' }),
    ).toBeVisible()
    await expect(page.getByText('Ana Demonstração')).toBeVisible()

    // 3. Abrir o projeto de demonstração
    const projectCard = page.locator('.project-card', {
      hasText: 'Projeto de Demonstração A',
    })
    await expect(projectCard).toBeVisible()
    await projectCard.getByRole('button', { name: 'Consultar' }).click()

    // 4. Confirmar que estamos no detalhe do projeto
    await expect(
      page.getByRole('heading', { name: 'Projeto de Demonstração A' }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tarefas' })).toBeVisible()

    // 5. Iniciar criação de tarefa
    await page.getByRole('button', { name: 'Criar tarefa' }).click()
    await expect(
      page.getByRole('heading', { name: 'Criar tarefa' }),
    ).toBeVisible()

    // 6. Preencher dados da tarefa (título obrigatório e descrição)
    await page.getByLabel('Título').fill(taskTitle)
    await page.getByLabel('Descrição (opcional)').fill(taskDescription)
    await page.getByRole('button', { name: 'Criar tarefa' }).click()

    // 7. Validar feedback de criação bem-sucedida e detalhe imediato
    await expect(page.getByRole('status')).toHaveText(
      'Tarefa criada com sucesso.',
    )
    await expect(
      page.getByRole('heading', { name: taskTitle }),
    ).toBeVisible()

    // 8. Voltar à listagem de tarefas do projeto
    await page
      .getByRole('button', { name: /voltar às tarefas/i })
      .click()

    // 9. Comprovar que a nova tarefa surge na listagem do projeto sem recarregar a página
    const taskCard = page.locator('.task-card', { hasText: taskTitle })
    await expect(taskCard).toBeVisible()
    await expect(taskCard.locator('.task-meta')).toContainText(
      'Estado: Por fazer',
    )
    await expect(taskCard.locator('.task-meta')).toContainText(
      'Prioridade: Média',
    )
  })
})
