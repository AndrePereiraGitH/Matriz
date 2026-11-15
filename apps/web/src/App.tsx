import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthResponse {
  user: AuthUser
  csrfToken: string
  expiresAt: string
}

interface Team {
  id: string
  name: string
}

interface Project {
  id: string
  teamId: string
  ownerId: string | null
  name: string
  description: string | null
}

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

interface DashboardProject {
  project: Project
  taskCountsByStatus: Record<TaskStatus, number>
}

interface Task {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
}

interface ApiError {
  code: string
  message: string
  details?: Array<{ field: string; message: string }>
}

type ProjectView = 'list' | 'create' | 'detail' | 'edit'
type TaskView = 'list' | 'create' | 'detail' | 'edit'

const TASK_STATUSES: Array<{ value: TaskStatus; label: string }> = [
  { value: 'TODO', label: 'Por fazer' },
  { value: 'IN_PROGRESS', label: 'Em curso' },
  { value: 'DONE', label: 'Concluída' },
]
const TASK_PRIORITIES: Array<{ value: TaskPriority; label: string }> = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
]

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
const AUTH_URL = `${API_BASE}/auth`

async function readError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as
    | (Partial<ApiError> & {
        details?: Array<{ field: string; message: string }>
      })
    | null
  return {
    code: body?.code ?? 'REQUEST_FAILED',
    message:
      body?.details?.[0]?.message ??
      body?.message ??
      'Não foi possível concluir o pedido. Tente novamente.',
  }
}

function sessionExpiredMessage(error: ApiError): string {
  return error.message || 'A sessão deixou de ser válida. Inicie sessão novamente.'
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sessionMessage, setSessionMessage] = useState<string | null>(null)
  const [projectMessage, setProjectMessage] = useState<string | null>(null)
  const [taskMessage, setTaskMessage] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectTaskCounts, setProjectTaskCounts] = useState<
    Record<string, Record<TaskStatus, number>>
  >({})
  const [tasks, setTasks] = useState<Task[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [projectView, setProjectView] = useState<ProjectView>('list')
  const [taskView, setTaskView] = useState<TaskView>('list')
  const [searchText, setSearchText] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectTeamId, setProjectTeamId] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('TODO')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM')
  const [taskStatusFilter, setTaskStatusFilter] = useState<TaskStatus | ''>('')
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<TaskPriority | ''>('')
  const sessionCheckInProgress = useRef(false)

  const clearSession = useCallback((message: string) => {
    setUser(null)
    setCsrfToken(null)
    setExpiresAt(null)
    setProjects([])
    setProjectTaskCounts({})
    setTasks([])
    setTeams([])
    setSelectedProject(null)
    setSelectedTask(null)
    setProjectView('list')
    setTaskView('list')
    setSessionMessage(message)
  }, [])

  const checkSession = useCallback(
    async (wasAuthenticated: boolean) => {
      if (sessionCheckInProgress.current) {
        return
      }

      sessionCheckInProgress.current = true
      try {
        const response = await fetch(`${AUTH_URL}/me`, {
          credentials: 'include',
        })
        if (!response.ok) {
          const error = await readError(response)
          if (response.status === 401) {
            if (wasAuthenticated) {
              clearSession(sessionExpiredMessage(error))
            } else {
              setUser(null)
              setCsrfToken(null)
              setExpiresAt(null)
            }
            return
          }
          setErrorMessage(error.message)
          return
        }

        const profile = (await response.json()) as AuthResponse
        setUser(profile.user)
        setCsrfToken(profile.csrfToken)
        setExpiresAt(profile.expiresAt)
        setSessionMessage(null)
        setErrorMessage(null)
      } catch {
        setErrorMessage(
          'Não foi possível contactar a aplicação. Verifique a ligação e tente novamente.',
        )
      } finally {
        sessionCheckInProgress.current = false
        setIsLoading(false)
      }
    },
    [clearSession],
  )

  async function refreshCsrfToken(): Promise<string | null> {
    const response = await fetch(`${AUTH_URL}/me`, {
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await readError(response)
      if (response.status === 401) {
        clearSession(sessionExpiredMessage(error))
      } else {
        setErrorMessage(error.message)
      }
      return null
    }

    const session = (await response.json()) as AuthResponse
    setUser(session.user)
    setCsrfToken(session.csrfToken)
    setExpiresAt(session.expiresAt)
    return session.csrfToken
  }

  async function sendCsrfMutation(
    url: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    csrf: string,
    body?: Record<string, string | null>,
  ): Promise<Response> {
    const send = (token: string) =>
      fetch(url, {
        method,
        credentials: 'include',
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          'X-CSRF-Token': token,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })

    const response = await send(csrf)
    if (response.status !== 403) {
      return response
    }

    const error = await readError(response.clone())
    if (error.code !== 'CSRF_VALIDATION_FAILED') {
      return response
    }

    const refreshedCsrf = await refreshCsrfToken()
    return refreshedCsrf ? send(refreshedCsrf) : response
  }

  const loadProjects = useCallback(
    async (search: string) => {
      setProjectsLoading(true)
      setProjectMessage(null)
      try {
        const query = search.trim()
          ? `?search=${encodeURIComponent(search.trim())}`
          : ''
        const [response, dashboardResponse] = await Promise.all([
          fetch(`${API_BASE}/projects${query}`, {
            credentials: 'include',
          }),
          fetch(`${API_BASE}/dashboard`, { credentials: 'include' }),
        ])
        if (!response.ok) {
          const error = await readError(response)
          if (response.status === 401) {
            clearSession(sessionExpiredMessage(error))
            return
          }
          setProjectMessage(error.message)
          return
        }
        if (!dashboardResponse.ok) {
          const error = await readError(dashboardResponse)
          if (dashboardResponse.status === 401) {
            clearSession(sessionExpiredMessage(error))
            return
          }
          setProjectMessage(error.message)
          return
        }
        const [availableProjects, dashboard] = await Promise.all([
          response.json() as Promise<Project[]>,
          dashboardResponse.json() as Promise<DashboardProject[]>,
        ])
        setProjects(availableProjects)
        setProjectTaskCounts(
          Object.fromEntries(
            dashboard.map(({ project, taskCountsByStatus }) => [
              project.id,
              taskCountsByStatus,
            ]),
          ),
        )
        setActiveSearch(search.trim())
      } catch {
        setProjectMessage(
          'Não foi possível carregar os projetos. Verifique a ligação e tente novamente.',
        )
      } finally {
        setProjectsLoading(false)
      }
    },
    [clearSession],
  )

  const loadTasks = useCallback(
    async (
      projectId: string,
      status: TaskStatus | '' = '',
      priority: TaskPriority | '' = '',
    ) => {
      setTasksLoading(true)
      setTaskMessage(null)
      try {
        const query = new URLSearchParams()
        if (status) {
          query.set('status', status)
        }
        if (priority) {
          query.set('priority', priority)
        }
        const queryString = query.size > 0 ? `?${query.toString()}` : ''
        const response = await fetch(
          `${API_BASE}/projects/${projectId}/tasks${queryString}`,
          { credentials: 'include' },
        )
        if (!response.ok) {
          const error = await readError(response)
          if (response.status === 401) {
            clearSession(sessionExpiredMessage(error))
            return
          }
          if (response.status === 404) {
            setTasks([])
            setTaskMessage(
              'Este projeto já não está disponível ou não tem autorização para consultar as tarefas.',
            )
            return
          }
          setTaskMessage(error.message)
          return
        }
        setTasks((await response.json()) as Task[])
      } catch {
        setTaskMessage(
          'Não foi possível carregar as tarefas. Verifique a ligação e tente novamente.',
        )
      } finally {
        setTasksLoading(false)
      }
    },
    [clearSession],
  )

  const loadTeams = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/teams`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await readError(response)
        if (response.status === 401) {
          clearSession(sessionExpiredMessage(error))
          return
        }
        setProjectMessage(error.message)
        return
      }
      const availableTeams = (await response.json()) as Team[]
      setTeams(availableTeams)
      if (availableTeams.length > 0) {
        setProjectTeamId((current) => current || availableTeams[0]?.id || '')
      }
    } catch {
      setProjectMessage(
        'Não foi possível carregar as equipas. Verifique a ligação e tente novamente.',
      )
    }
  }, [clearSession])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void checkSession(false)
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [checkSession])

  useEffect(() => {
    if (!user) {
      return
    }
    const timeoutId = window.setTimeout(() => {
      void loadProjects('')
      void loadTeams()
    }, 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadProjects, loadTeams, user])

  useEffect(() => {
    if (!user) {
      return
    }

    const intervalId = window.setInterval(() => {
      void checkSession(true)
    }, 60_000)
    const handleFocus = () => {
      void checkSession(true)
    }

    window.addEventListener('focus', handleFocus)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [checkSession, user])

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSessionMessage(null)

    const formData = new FormData(event.currentTarget)
    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password'),
        }),
      })

      if (!response.ok) {
        const error = await readError(response)
        setErrorMessage(error.message)
        return
      }

      const session = (await response.json()) as AuthResponse
      setUser(session.user)
      setCsrfToken(session.csrfToken)
      setExpiresAt(session.expiresAt)
      setErrorMessage(null)
      setSessionMessage(null)
    } catch {
      setErrorMessage(
        'Não foi possível contactar a aplicação. Verifique a ligação e tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleLogout() {
    if (!csrfToken) {
      await checkSession(true)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await fetch(`${AUTH_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-CSRF-Token': csrfToken },
      })
      if (!response.ok) {
        const error = await readError(response)
        if (response.status === 401) {
          clearSession(sessionExpiredMessage(error))
        } else {
          setErrorMessage(error.message)
        }
        return
      }

      setUser(null)
      setCsrfToken(null)
      setExpiresAt(null)
      setProjects([])
      setTeams([])
      setSelectedProject(null)
      setSessionMessage(null)
    } catch {
      setErrorMessage(
        'Não foi possível terminar a sessão. Verifique a ligação e tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function startCreateProject() {
    setSelectedProject(null)
    setProjectName('')
    setProjectDescription('')
    setProjectTeamId(teams[0]?.id ?? '')
    setProjectMessage(null)
    setProjectView('create')
  }

  async function openProject(projectId: string) {
    setProjectView('detail')
    setSelectedProject(null)
    setSelectedTask(null)
    setTaskView('list')
    setTaskStatusFilter('')
    setTaskPriorityFilter('')
    setTasks([])
    setProjectMessage(null)
    setTaskMessage(null)
    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await readError(response)
        if (response.status === 401) {
          clearSession(sessionExpiredMessage(error))
          return
        }
        if (response.status === 404) {
          await loadProjects(activeSearch)
          setProjectMessage(
            'Este projeto já não está disponível ou não tem autorização para o consultar.',
          )
          setProjectView('list')
          return
        }
        setProjectMessage(error.message)
        setProjectView('list')
        return
      }
      const project = (await response.json()) as Project
      setSelectedProject(project)
      await loadTasks(project.id)
    } catch {
      setProjectMessage(
        'Não foi possível carregar o projeto. Verifique a ligação e tente novamente.',
      )
      setProjectView('list')
    }
  }

  function startEditProject() {
    if (!selectedProject) {
      return
    }
    setProjectName(selectedProject.name)
    setProjectDescription(selectedProject.description ?? '')
    setProjectView('edit')
    setProjectMessage(null)
  }

  async function handleProjectSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!csrfToken) {
      await checkSession(true)
      return
    }

    setIsSubmitting(true)
    setProjectMessage(null)
    const isEditing = projectView === 'edit' && selectedProject
    const url = isEditing
      ? `${API_BASE}/projects/${selectedProject.id}`
      : `${API_BASE}/projects`
    try {
      const response = await sendCsrfMutation(
        url,
        isEditing ? 'PATCH' : 'POST',
        csrfToken,
        isEditing
          ? {
              name: projectName,
              description: projectDescription || null,
            }
          : {
              teamId: projectTeamId,
              name: projectName,
              description: projectDescription || null,
            },
      )
      if (!response.ok) {
        const error = await readError(response)
        if (response.status === 401) {
          clearSession(sessionExpiredMessage(error))
          return
        }
        if (response.status === 403) {
          setProjectMessage(
            error.code === 'CSRF_VALIDATION_FAILED'
              ? 'A validação de segurança falhou. Atualize a sessão e tente novamente.'
              : 'Não tem autorização para criar ou editar este projeto.',
          )
          return
        }
        setProjectMessage(error.message)
        return
      }

      const savedProject = (await response.json()) as Project
      setSelectedProject(savedProject)
      setProjectView('detail')
      await loadProjects(activeSearch)
      setProjectMessage(
        isEditing
          ? 'Projeto atualizado com sucesso.'
          : 'Projeto criado com sucesso.',
      )
    } catch {
      setProjectMessage(
        'Não foi possível guardar o projeto. Verifique a ligação e tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function startCreateTask() {
    setSelectedTask(null)
    setTaskTitle('')
    setTaskDescription('')
    setTaskStatus('TODO')
    setTaskPriority('MEDIUM')
    setTaskMessage(null)
    setTaskView('create')
  }

  async function openTask(taskId: string) {
    if (!selectedProject) {
      return
    }
    setSelectedTask(null)
    setTaskMessage(null)
    setTaskView('detail')
    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        const error = await readError(response)
        if (response.status === 401) {
          clearSession(sessionExpiredMessage(error))
          return
        }
        if (response.status === 404) {
          await loadTasks(
            selectedProject.id,
            taskStatusFilter,
            taskPriorityFilter,
          )
          await loadProjects(activeSearch)
          setTaskMessage(
            'Esta tarefa já não está disponível ou não tem autorização para a consultar.',
          )
          setTaskView('list')
          return
        }
        setTaskMessage(error.message)
        setTaskView('list')
        return
      }
      setSelectedTask((await response.json()) as Task)
    } catch {
      setTaskMessage(
        'Não foi possível carregar a tarefa. Verifique a ligação e tente novamente.',
      )
      setTaskView('list')
    }
  }

  function startEditTask() {
    if (!selectedTask) {
      return
    }
    setTaskTitle(selectedTask.title)
    setTaskDescription(selectedTask.description ?? '')
    setTaskStatus(selectedTask.status)
    setTaskPriority(selectedTask.priority)
    setTaskMessage(null)
    setTaskView('edit')
  }

  async function handleTaskSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedProject) {
      return
    }
    if (!csrfToken) {
      await checkSession(true)
      return
    }

    setIsSubmitting(true)
    setTaskMessage(null)
    const isEditing = taskView === 'edit' && selectedTask
    const url = isEditing
      ? `${API_BASE}/tasks/${selectedTask.id}`
      : `${API_BASE}/projects/${selectedProject.id}/tasks`
    try {
      const response = await sendCsrfMutation(
        url,
        isEditing ? 'PATCH' : 'POST',
        csrfToken,
        {
          title: taskTitle,
          description: taskDescription || null,
          status: taskStatus,
          priority: taskPriority,
        },
      )
      if (!response.ok) {
        const error = await readError(response)
        if (response.status === 401) {
          clearSession(sessionExpiredMessage(error))
          return
        }
        if (response.status === 403) {
          setTaskMessage(
            error.code === 'CSRF_VALIDATION_FAILED'
              ? 'A validação de segurança falhou. Atualize a sessão e tente novamente.'
              : 'Não tem autorização para gerir tarefas neste projeto.',
          )
          return
        }
        if (response.status === 404) {
          setTaskMessage(
            'Este projeto ou tarefa já não está disponível para a sua conta.',
          )
          return
        }
        setTaskMessage(error.message)
        return
      }

      const savedTask = (await response.json()) as Task
      setSelectedTask(savedTask)
      setTaskView('detail')
      await loadTasks(
        selectedProject.id,
        taskStatusFilter,
        taskPriorityFilter,
      )
      await loadProjects(activeSearch)
      setTaskMessage(
        isEditing ? 'Tarefa atualizada com sucesso.' : 'Tarefa criada com sucesso.',
      )
    } catch {
      setTaskMessage(
        'Não foi possível guardar a tarefa. Verifique a ligação e tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteTask() {
    if (!selectedTask || !csrfToken || !selectedProject) {
      if (!csrfToken) {
        await checkSession(true)
      }
      return
    }
    if (
      !window.confirm(
        `Eliminar a tarefa «${selectedTask.title}»? Esta ação não pode ser desfeita.`,
      )
    ) {
      return
    }

    setIsSubmitting(true)
    setTaskMessage(null)
    try {
      const response = await sendCsrfMutation(
        `${API_BASE}/tasks/${selectedTask.id}`,
        'DELETE',
        csrfToken,
      )
      if (!response.ok) {
        const error = await readError(response)
        if (response.status === 401) {
          clearSession(sessionExpiredMessage(error))
          return
        }
        if (response.status === 403) {
          setTaskMessage(
            error.code === 'CSRF_VALIDATION_FAILED'
              ? 'A validação de segurança falhou. Atualize a sessão e tente novamente.'
              : 'Não tem autorização para eliminar esta tarefa.',
          )
          return
        }
        if (response.status === 404) {
          await loadTasks(
            selectedProject.id,
            taskStatusFilter,
            taskPriorityFilter,
          )
          setTaskMessage('A tarefa já não está disponível.')
          setSelectedTask(null)
          setTaskView('list')
          return
        }
        if (response.status === 409) {
          setTaskMessage(
            'A tarefa não pode ser eliminada porque tem comentários ou responsáveis associados.',
          )
          return
        }
        setTaskMessage(error.message)
        return
      }

      setSelectedTask(null)
      setTaskView('list')
      await loadTasks(
        selectedProject.id,
        taskStatusFilter,
        taskPriorityFilter,
      )
      await loadProjects(activeSearch)
      setTaskMessage('Tarefa eliminada com sucesso.')
    } catch {
      setTaskMessage(
        'Não foi possível eliminar a tarefa. Verifique a ligação e tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteProject() {
    if (!selectedProject || !csrfToken) {
      if (!csrfToken) {
        await checkSession(true)
      }
      return
    }
    if (
      !window.confirm(
        `Eliminar o projeto «${selectedProject.name}»? Esta ação não pode ser desfeita.`,
      )
    ) {
      return
    }

    setIsSubmitting(true)
    setProjectMessage(null)
    try {
      const response = await sendCsrfMutation(
        `${API_BASE}/projects/${selectedProject.id}`,
        'DELETE',
        csrfToken,
      )
      if (!response.ok) {
        const error = await readError(response)
        if (response.status === 401) {
          clearSession(sessionExpiredMessage(error))
          return
        }
        if (response.status === 403) {
          setProjectMessage(
            error.code === 'CSRF_VALIDATION_FAILED'
              ? 'A validação de segurança falhou. Atualize a sessão e tente novamente.'
              : 'Só o proprietário do projeto o pode eliminar.',
          )
          return
        }
        if (response.status === 409) {
          setProjectMessage(
            'O projeto não pode ser eliminado porque ainda tem tarefas associadas.',
          )
          return
        }
        if (response.status === 404) {
          await loadProjects(activeSearch)
          setProjectMessage('O projeto já não está disponível.')
          setProjectView('list')
          return
        }
        setProjectMessage(error.message)
        return
      }

      setSelectedProject(null)
      setProjectView('list')
      await loadProjects(activeSearch)
      setProjectMessage('Projeto eliminado com sucesso.')
    } catch {
      setProjectMessage(
        'Não foi possível eliminar o projeto. Verifique a ligação e tente novamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="app-shell" aria-busy="true">
        <p role="status">A verificar a sessão…</p>
      </main>
    )
  }

  return (
    <main className="app-shell">
      {!user ? (
        <section className="auth-card" aria-labelledby="page-title">
          <p className="app-name">Matriz</p>
          <h1 id="page-title">Iniciar sessão</h1>
          <p className="intro">Aceda à sua conta para continuar.</p>
          {sessionMessage && (
            <p className="message message-notice" role="status">
              {sessionMessage}
            </p>
          )}
          {errorMessage && (
            <p className="message message-error" role="alert">
              {errorMessage}
            </p>
          )}
          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>
            <input
              autoComplete="username"
              id="email"
              name="email"
              type="email"
              required
            />
            <label htmlFor="password">Palavra-passe</label>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              type="password"
              required
            />
            <button
              className="primary-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A iniciar sessão…' : 'Iniciar sessão'}
            </button>
          </form>
        </section>
      ) : (
        <section className="workspace" aria-labelledby="page-title">
          <header className="workspace-header">
            <div>
              <p className="app-name">Matriz</p>
              <h1 id="page-title">Gestão de projetos</h1>
              <p className="workspace-user">
                Sessão de {user.name}
                {expiresAt && (
                  <> · válida até {new Date(expiresAt).toLocaleString('pt-PT')}</>
                )}
              </p>
            </div>
            <button
              className="secondary-button"
              type="button"
              onClick={() => void handleLogout()}
              disabled={isSubmitting}
            >
              Terminar sessão
            </button>
          </header>

          {errorMessage && (
            <p className="message message-error" role="alert">
              {errorMessage}
            </p>
          )}
          {projectMessage && (
            <p
              className={`message ${
                projectMessage.includes('sucesso')
                  ? 'message-success'
                  : 'message-error'
              }`}
              role={
                projectMessage.includes('sucesso') ? 'status' : 'alert'
              }
            >
              {projectMessage}
            </p>
          )}

          {projectView === 'list' && (
            <section className="project-panel" aria-labelledby="projects-title">
              <div className="panel-heading">
                <div>
                  <h2 id="projects-title">Os seus projetos</h2>
                  <p className="panel-description">
                    Projetos das equipas a que pertence.
                  </p>
                </div>
                <button
                  className="primary-button compact-button"
                  type="button"
                  onClick={startCreateProject}
                  disabled={teams.length === 0}
                >
                  Criar projeto
                </button>
              </div>

              <form
                className="search-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  setProjectView('list')
                  void loadProjects(searchText)
                }}
              >
                <label className="visually-hidden" htmlFor="project-search">
                  Pesquisar projetos pelo nome
                </label>
                <input
                  id="project-search"
                  name="search"
                  type="search"
                  placeholder="Pesquisar pelo nome do projeto"
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                />
                <button className="secondary-button" type="submit">
                  Pesquisar
                </button>
                {activeSearch && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => {
                      setSearchText('')
                      void loadProjects('')
                    }}
                  >
                    Limpar
                  </button>
                )}
              </form>

              {projectsLoading ? (
                <p className="empty-state" role="status">
                  A carregar projetos…
                </p>
              ) : projects.length === 0 ? (
                <div className="empty-state">
                  <p>
                    {activeSearch
                      ? 'Não foram encontrados projetos com esse nome.'
                      : 'Ainda não existem projetos nas suas equipas.'}
                  </p>
                  {teams.length === 0 ? (
                    <p>Não pertence a nenhuma equipa onde possa criar projetos.</p>
                  ) : (
                    <button
                      className="text-button"
                      type="button"
                      onClick={startCreateProject}
                    >
                      Criar o primeiro projeto
                    </button>
                  )}
                </div>
              ) : (
                <ul className="project-list">
                  {projects.map((project) => (
                    <li className="project-card" key={project.id}>
                      <div>
                        <h3>{project.name}</h3>
                        <p>
                          {project.description || 'Sem descrição.'}
                        </p>
                        <span className="project-meta">
                          {teams.find((team) => team.id === project.teamId)?.name ??
                            'Equipa'}
                          {project.ownerId === user.id && ' · Proprietário'}
                        </span>
                        <dl
                          className="project-task-counts"
                          aria-label={`Tarefas de ${project.name} por estado`}
                        >
                          {TASK_STATUSES.map(({ value, label }) => (
                            <div key={value}>
                              <dt>{label}</dt>
                              <dd>
                                {projectTaskCounts[project.id]?.[value] ?? 0}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => void openProject(project.id)}
                      >
                        Consultar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {(projectView === 'create' || projectView === 'edit') && (
            <section className="project-panel form-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    {projectView === 'create'
                      ? 'Criar projeto'
                      : 'Editar projeto'}
                  </h2>
                  <p className="panel-description">
                    {projectView === 'create'
                      ? 'O projeto será associado a uma das suas equipas.'
                      : 'Atualize o nome ou a descrição do projeto.'}
                  </p>
                </div>
              </div>
              <form className="project-form" onSubmit={handleProjectSubmit}>
                {projectView === 'create' && (
                  <>
                    <label htmlFor="project-team">Equipa</label>
                    <select
                      id="project-team"
                      value={projectTeamId}
                      onChange={(event) => setProjectTeamId(event.target.value)}
                      required
                    >
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </>
                )}
                <label htmlFor="project-name">Nome do projeto</label>
                <input
                  id="project-name"
                  required
                  minLength={3}
                  maxLength={100}
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  aria-describedby="project-name-hint"
                />
                <p className="field-hint" id="project-name-hint">
                  Entre 3 e 100 caracteres; não pode conter apenas espaços.
                </p>
                <label htmlFor="project-description">Descrição (opcional)</label>
                <textarea
                  id="project-description"
                  maxLength={1000}
                  rows={4}
                  value={projectDescription}
                  onChange={(event) => setProjectDescription(event.target.value)}
                  aria-describedby="project-description-hint"
                />
                <p className="field-hint" id="project-description-hint">
                  Até 1000 caracteres.
                </p>
                <div className="form-actions">
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={isSubmitting || !projectName.trim()}
                  >
                    {isSubmitting
                      ? 'A guardar…'
                      : projectView === 'create'
                        ? 'Criar projeto'
                        : 'Guardar alterações'}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => {
                      setProjectView(selectedProject ? 'detail' : 'list')
                      setProjectMessage(null)
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </section>
          )}

          {projectView === 'detail' && (
            <section className="project-panel">
              <button
                className="text-button back-button"
                type="button"
                onClick={() => {
                  setProjectView('list')
                  setProjectMessage(null)
                }}
              >
                ← Voltar aos projetos
              </button>
              {!selectedProject ? (
                <p className="empty-state" role="status">
                  A carregar projeto…
                </p>
              ) : (
                <>
                  <article className="project-detail">
                    <div className="panel-heading">
                      <div>
                        <p className="eyebrow">Detalhe do projeto</p>
                        <h2>{selectedProject.name}</h2>
                      </div>
                      {selectedProject.ownerId === user.id && (
                        <div className="form-actions detail-actions">
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={startEditProject}
                          >
                            Editar
                          </button>
                          <button
                            className="danger-button"
                            type="button"
                            onClick={() => void handleDeleteProject()}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'A eliminar…' : 'Eliminar'}
                          </button>
                        </div>
                      )}
                    </div>
                    <dl className="project-details">
                      <div>
                        <dt>Equipa</dt>
                        <dd>
                          {teams.find(
                            (team) => team.id === selectedProject.teamId,
                          )?.name ?? selectedProject.teamId}
                        </dd>
                      </div>
                      <div>
                        <dt>Proprietário</dt>
                        <dd>
                          {selectedProject.ownerId === user.id
                            ? 'Tu'
                            : 'Outro membro da equipa'}
                        </dd>
                      </div>
                      <div>
                        <dt>Descrição</dt>
                        <dd>
                          {selectedProject.description || 'Sem descrição.'}
                        </dd>
                      </div>
                    </dl>
                  </article>

                  <section className="task-section" aria-labelledby="tasks-title">
                    {taskView === 'list' && (
                      <>
                        <div className="panel-heading">
                          <div>
                            <h2 id="tasks-title">Tarefas</h2>
                            <p className="panel-description">
                              Trabalho associado a este projeto.
                            </p>
                          </div>
                          <button
                            className="primary-button compact-button"
                            type="button"
                            onClick={startCreateTask}
                          >
                            Criar tarefa
                          </button>
                        </div>
                        <form
                          className="task-filters"
                          onSubmit={(event) => {
                            event.preventDefault()
                            void loadTasks(
                              selectedProject.id,
                              taskStatusFilter,
                              taskPriorityFilter,
                            )
                          }}
                        >
                          <label htmlFor="task-status-filter">Estado</label>
                          <select
                            id="task-status-filter"
                            value={taskStatusFilter}
                            onChange={(event) =>
                              setTaskStatusFilter(
                                event.target.value as TaskStatus | '',
                              )
                            }
                          >
                            <option value="">Todos os estados</option>
                            {TASK_STATUSES.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <label htmlFor="task-priority-filter">Prioridade</label>
                          <select
                            id="task-priority-filter"
                            value={taskPriorityFilter}
                            onChange={(event) =>
                              setTaskPriorityFilter(
                                event.target.value as TaskPriority | '',
                              )
                            }
                          >
                            <option value="">Todas as prioridades</option>
                            {TASK_PRIORITIES.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button
                            className="secondary-button"
                            type="submit"
                            disabled={tasksLoading}
                          >
                            Filtrar
                          </button>
                          {(taskStatusFilter || taskPriorityFilter) && (
                            <button
                              className="text-button"
                              type="button"
                              onClick={() => {
                                setTaskStatusFilter('')
                                setTaskPriorityFilter('')
                                void loadTasks(selectedProject.id)
                              }}
                              disabled={tasksLoading}
                            >
                              Limpar filtros
                            </button>
                          )}
                        </form>
                        {taskMessage && (
                          <p
                            className={`message ${
                              taskMessage.includes('sucesso')
                                ? 'message-success'
                                : 'message-error'
                            }`}
                            role={
                              taskMessage.includes('sucesso')
                                ? 'status'
                                : 'alert'
                            }
                          >
                            {taskMessage}
                          </p>
                        )}
                        {tasksLoading ? (
                          <p className="empty-state" role="status">
                            A carregar tarefas…
                          </p>
                        ) : tasks.length === 0 ? (
                          <p className="empty-state">
                            {taskStatusFilter || taskPriorityFilter
                              ? 'Não existem tarefas com os filtros selecionados.'
                              : 'Ainda não existem tarefas neste projeto.'}
                          </p>
                        ) : (
                          <ul className="task-list">
                            {tasks.map((task) => (
                              <li className="task-card" key={task.id}>
                                <div>
                                  <h3>{task.title}</h3>
                                  <p>
                                    {task.description || 'Sem descrição.'}
                                  </p>
                                  <span className="task-meta">
                                    Estado:{' '}
                                    {
                                      TASK_STATUSES.find(
                                        ({ value }) => value === task.status,
                                      )?.label
                                    }
                                    {' · Prioridade: '}
                                    {
                                      TASK_PRIORITIES.find(
                                        ({ value }) => value === task.priority,
                                      )?.label
                                    }
                                  </span>
                                </div>
                                <button
                                  className="secondary-button"
                                  type="button"
                                  onClick={() => void openTask(task.id)}
                                >
                                  Consultar
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}

                    {(taskView === 'create' || taskView === 'edit') && (
                      <>
                        <button
                          className="text-button back-button"
                          type="button"
                          onClick={() => {
                            setTaskView('list')
                            setTaskMessage(null)
                          }}
                          disabled={isSubmitting}
                        >
                          ← Voltar às tarefas
                        </button>
                        <div className="panel-heading">
                          <div>
                            <h2>
                              {taskView === 'create'
                                ? 'Criar tarefa'
                                : 'Editar tarefa'}
                            </h2>
                            <p className="panel-description">
                              Defina o título, a descrição, o estado e a prioridade.
                            </p>
                          </div>
                        </div>
                        {taskMessage && (
                          <p className="message message-error" role="alert">
                            {taskMessage}
                          </p>
                        )}
                        <form className="project-form" onSubmit={handleTaskSubmit}>
                          <label htmlFor="task-title">Título</label>
                          <input
                            id="task-title"
                            required
                            minLength={3}
                            maxLength={150}
                            value={taskTitle}
                            onChange={(event) => setTaskTitle(event.target.value)}
                            aria-describedby="task-title-hint"
                          />
                          <p className="field-hint" id="task-title-hint">
                            Obrigatório, entre 3 e 150 caracteres; não pode conter
                            apenas espaços.
                          </p>
                          <label htmlFor="task-description">
                            Descrição (opcional)
                          </label>
                          <textarea
                            id="task-description"
                            maxLength={2000}
                            rows={4}
                            value={taskDescription}
                            onChange={(event) =>
                              setTaskDescription(event.target.value)
                            }
                            aria-describedby="task-description-hint"
                          />
                          <p className="field-hint" id="task-description-hint">
                            Até 2000 caracteres.
                          </p>
                          <label htmlFor="task-status">Estado</label>
                          <select
                            id="task-status"
                            value={taskStatus}
                            onChange={(event) =>
                              setTaskStatus(event.target.value as TaskStatus)
                            }
                          >
                            {TASK_STATUSES.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <label htmlFor="task-priority">Prioridade</label>
                          <select
                            id="task-priority"
                            value={taskPriority}
                            onChange={(event) =>
                              setTaskPriority(event.target.value as TaskPriority)
                            }
                          >
                            {TASK_PRIORITIES.map(({ value, label }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <div className="form-actions">
                            <button
                              className="primary-button"
                              type="submit"
                              disabled={isSubmitting || !taskTitle.trim()}
                            >
                              {isSubmitting
                                ? 'A guardar…'
                                : taskView === 'create'
                                  ? 'Criar tarefa'
                                  : 'Guardar alterações'}
                            </button>
                            <button
                              className="secondary-button"
                              type="button"
                              onClick={() => {
                                setTaskView('list')
                                setTaskMessage(null)
                              }}
                              disabled={isSubmitting}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </>
                    )}

                    {taskView === 'detail' && (
                      <>
                        <button
                          className="text-button back-button"
                          type="button"
                          onClick={() => {
                            setTaskView('list')
                            setTaskMessage(null)
                          }}
                        >
                          ← Voltar às tarefas
                        </button>
                        {!selectedTask ? (
                          <p className="empty-state" role="status">
                            A carregar tarefa…
                          </p>
                        ) : (
                          <article className="task-detail">
                            <div className="panel-heading">
                              <div>
                                <p className="eyebrow">Detalhe da tarefa</p>
                                <h2>{selectedTask.title}</h2>
                              </div>
                              <div className="form-actions detail-actions">
                                <button
                                  className="secondary-button"
                                  type="button"
                                  onClick={startEditTask}
                                >
                                  Editar
                                </button>
                                <button
                                  className="danger-button"
                                  type="button"
                                  onClick={() => void handleDeleteTask()}
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? 'A eliminar…' : 'Eliminar'}
                                </button>
                              </div>
                            </div>
                            {taskMessage && (
                              <p
                                className={`message ${
                                  taskMessage.includes('sucesso')
                                    ? 'message-success'
                                    : 'message-error'
                                }`}
                                role={
                                  taskMessage.includes('sucesso')
                                    ? 'status'
                                    : 'alert'
                                }
                              >
                                {taskMessage}
                              </p>
                            )}
                            <dl className="project-details">
                              <div>
                                <dt>Estado</dt>
                                <dd>
                                  {
                                    TASK_STATUSES.find(
                                      ({ value }) =>
                                        value === selectedTask.status,
                                    )?.label
                                  }
                                </dd>
                              </div>
                              <div>
                                <dt>Prioridade</dt>
                                <dd>
                                  {
                                    TASK_PRIORITIES.find(
                                      ({ value }) =>
                                        value === selectedTask.priority,
                                    )?.label
                                  }
                                </dd>
                              </div>
                              <div>
                                <dt>Descrição</dt>
                                <dd>
                                  {selectedTask.description || 'Sem descrição.'}
                                </dd>
                              </div>
                            </dl>
                          </article>
                        )}
                      </>
                    )}
                  </section>
                </>
              )}
            </section>
          )}
        </section>
      )}
    </main>
  )
}

export default App
