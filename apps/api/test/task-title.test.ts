import { describe, expect, it } from 'vitest'
import { validateTaskTitle } from '../src/domain/task-title.js'

describe('validateTaskTitle', () => {
  it('accepts a valid title and trims the surrounding spaces', () => {
    expect(validateTaskTitle('  Preparar relatório  ')).toEqual({
      ok: true,
      title: 'Preparar relatório',
    })
  })

  it('rejects a title containing only whitespace and identifies the field', () => {
    expect(validateTaskTitle('   ')).toEqual({
      ok: false,
      field: 'title',
      message: 'O título da tarefa não pode conter apenas espaços.',
    })
  })

  it.each([
    { label: '3 caracteres', title: 'abc', accepted: true },
    { label: '2 caracteres', title: 'ab', accepted: false },
    { label: '150 caracteres', title: 'a'.repeat(150), accepted: true },
    { label: '151 caracteres', title: 'a'.repeat(151), accepted: false },
  ])('aplica o limite de 3 a 150 caracteres ($label)', ({ title, accepted }) => {
    const result = validateTaskTitle(title)

    if (accepted) {
      expect(result).toEqual({ ok: true, title })
      return
    }

    expect(result).toEqual({
      ok: false,
      field: 'title',
      message: 'O título da tarefa deve ter entre 3 e 150 caracteres.',
    })
  })
})
