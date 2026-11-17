export type TaskTitleValidation =
  | { ok: true; title: string }
  | { ok: false; field: 'title'; message: string }

export function validateTaskTitle(title: unknown): TaskTitleValidation {
  if (typeof title !== 'string') {
    return {
      ok: false,
      field: 'title',
      message: 'O título da tarefa tem de ser texto.',
    }
  }

  const trimmed = title.trim()
  if (!trimmed) {
    return {
      ok: false,
      field: 'title',
      message: 'O título da tarefa não pode conter apenas espaços.',
    }
  }

  const titleLength = Array.from(trimmed).length
  if (titleLength < 3 || titleLength > 150) {
    return {
      ok: false,
      field: 'title',
      message: 'O título da tarefa deve ter entre 3 e 150 caracteres.',
    }
  }

  return { ok: true, title: trimmed }
}
