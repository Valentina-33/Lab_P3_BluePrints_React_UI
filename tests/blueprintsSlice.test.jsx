import { describe, it, expect } from 'vitest'
import reducer, {
  fetchByAuthor,
  fetchBlueprint,
  createBlueprint,
} from '../src/features/blueprints/blueprintsSlice.js'

describe('blueprints slice', () => {
  it('should initialize correctly', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.authors).toEqual([])
  })

  it('fetchByAuthor.fulfilled guarda los items bajo el autor correspondiente', () => {
    const state = reducer(undefined, {
      type: fetchByAuthor.fulfilled.type,
      payload: { author: 'john', items: [{ name: 'house', points: [] }] },
    })
    expect(state.byAuthor.john).toEqual([{ name: 'house', points: [] }])
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
})
