import { describe, it, expect } from 'vitest'
import reducer, {
  fetchByAuthor,
  fetchBlueprint,
  createBlueprint,
  updateBlueprint,
  removeBlueprint,
  selectTopBlueprints,
} from '../src/features/blueprints/blueprintsSlice.js'

describe('blueprints slice', () => {
  it('should initialize correctly', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.byAuthor).toEqual({})
    expect(state.list).toEqual({ status: 'idle', error: null })
  })

  it('fetchByAuthor.pending pone list.status en loading', () => {
    const state = reducer(undefined, { type: fetchByAuthor.pending.type })
    expect(state.list.status).toBe('loading')
  })

  it('fetchByAuthor.fulfilled guarda los items bajo el autor correspondiente', () => {
    const state = reducer(undefined, {
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: [{ name: 'house', points: [] }] },
    })
    expect(state.byAuthor.john).toEqual([{ name: 'house', points: [] }])
    expect(state.list.status).toBe('succeeded')
  })

  it('fetchByAuthor.rejected guarda el error en list.error', () => {
    const state = reducer(undefined, {
      type: fetchByAuthor.rejected.type,
      payload: 'boom',
    })
    expect(state.list.status).toBe('failed')
    expect(state.list.error).toBe('boom')
  })

  it('fetchBlueprint.fulfilled actualiza el blueprint actual', () => {
    const blueprint = { author: 'john', name: 'house', points: [{ x: 1, y: 1 }] }
    const state = reducer(undefined, { type: fetchBlueprint.fulfilled.type, payload: blueprint })
    expect(state.current).toEqual(blueprint)
  })

  it('createBlueprint.fulfilled agrega el blueprint a la lista de su autor si ya existe', () => {
    const withAuthor = reducer(undefined, {
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: [{ name: 'house', points: [] }] },
    })
    const newBp = { author: 'john', name: 'garage', points: [{ x: 0, y: 0 }] }
    const state = reducer(withAuthor, { type: createBlueprint.fulfilled.type, payload: newBp })

    expect(state.byAuthor.john).toHaveLength(2)
    expect(state.byAuthor.john).toContainEqual(newBp)
  })

  it('updateBlueprint aplica el cambio de forma optimista en pending', () => {
    const withAuthor = reducer(undefined, {
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: [{ author: 'john', name: 'house', points: [] }] },
    })
    const payload = { author: 'john', name: 'house', points: [{ x: 1, y: 1 }] }
    const state = reducer(withAuthor, {
      type: updateBlueprint.pending.type,
      meta: { arg: payload },
    })

    expect(state.byAuthor.john[0].points).toEqual([{ x: 1, y: 1 }])
    expect(state.save.status).toBe('loading')
  })

  it('updateBlueprint.rejected revierte al valor anterior', () => {
    const withAuthor = reducer(undefined, {
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: [{ author: 'john', name: 'house', points: [] }] },
    })
    const optimistic = reducer(withAuthor, {
      type: updateBlueprint.pending.type,
      meta: { arg: { author: 'john', name: 'house', points: [{ x: 1, y: 1 }] } },
    })
    const state = reducer(optimistic, {
      type: updateBlueprint.rejected.type,
      payload: {
        author: 'john',
        name: 'house',
        previous: { author: 'john', name: 'house', points: [] },
        message: 'network error',
      },
    })

    expect(state.byAuthor.john[0].points).toEqual([])
    expect(state.save.status).toBe('failed')
    expect(state.save.error).toBe('network error')
  })

  it('removeBlueprint quita el item de forma optimista en pending', () => {
    const withAuthor = reducer(undefined, {
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: [{ author: 'john', name: 'house', points: [] }] },
    })
    const state = reducer(withAuthor, {
      type: removeBlueprint.pending.type,
      meta: { arg: { author: 'john', name: 'house' } },
    })

    expect(state.byAuthor.john).toEqual([])
  })

  it('removeBlueprint.rejected restaura el item borrado', () => {
    const withAuthor = reducer(undefined, {
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: [{ author: 'john', name: 'house', points: [] }] },
    })
    const optimistic = reducer(withAuthor, {
      type: removeBlueprint.pending.type,
      meta: { arg: { author: 'john', name: 'house' } },
    })
    const state = reducer(optimistic, {
      type: removeBlueprint.rejected.type,
      payload: {
        author: 'john',
        name: 'house',
        removed: { author: 'john', name: 'house', points: [] },
        message: 'no se pudo borrar',
      },
    })

    expect(state.byAuthor.john).toHaveLength(1)
    expect(state.remove.status).toBe('failed')
  })

  it('selectTopBlueprints ordena por cantidad de puntos, de mayor a menor', () => {
    const state = {
      blueprints: {
        byAuthor: {
          john: [{ name: 'a', points: [1] }, { name: 'b', points: [1, 2, 3] }],
          maria: [{ name: 'c', points: [1, 2] }],
        },
      },
    }
    const top = selectTopBlueprints(state)
    expect(top.map((bp) => bp.name)).toEqual(['b', 'c', 'a'])
  })
})
