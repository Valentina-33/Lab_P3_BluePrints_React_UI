import { describe, it, expect } from 'vitest'
import * as mockClient from '../src/services/blueprintsMockClient.js'

describe('blueprintsMockClient', () => {
  it('getAll devuelve todos los blueprints sembrados', async () => {
    const all = await mockClient.getAll()
    expect(all.length).toBeGreaterThanOrEqual(3)
  })

  it('getByAuthor filtra solo los blueprints del autor pedido', async () => {
    const items = await mockClient.getByAuthor('maria')
    expect(items.every((bp) => bp.author === 'maria')).toBe(true)
    expect(items.map((bp) => bp.name)).toEqual(expect.arrayContaining(['garage', 'pool']))
  })

  it('getByAuthorAndName devuelve el blueprint puntual con sus puntos', async () => {
    const bp = await mockClient.getByAuthorAndName('maria', 'garage')
    expect(bp.points).toHaveLength(3)
  })

  it('getByAuthorAndName rechaza la promesa si el blueprint no existe', async () => {
    await expect(mockClient.getByAuthorAndName('nadie', 'nada')).rejects.toThrow()
  })

  it('create agrega un blueprint nuevo que luego aparece en getByAuthor', async () => {
    const payload = { author: 'test-author', name: 'shed', points: [{ x: 1, y: 1 }] }
    const created = await mockClient.create(payload)
    expect(created).toEqual(payload)

    const items = await mockClient.getByAuthor('test-author')
    expect(items).toContainEqual(payload)
  })
})
