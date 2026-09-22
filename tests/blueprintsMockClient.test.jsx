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

  it('update reemplaza los puntos de un blueprint existente', async () => {
    await mockClient.create({ author: 'update-author', name: 'shed', points: [] })
    const updated = await mockClient.update('update-author', 'shed', {
      points: [{ x: 9, y: 9 }],
    })
    expect(updated.points).toEqual([{ x: 9, y: 9 }])

    const bp = await mockClient.getByAuthorAndName('update-author', 'shed')
    expect(bp.points).toEqual([{ x: 9, y: 9 }])
  })

  it('update rechaza la promesa si el blueprint no existe', async () => {
    await expect(mockClient.update('nadie', 'nada', { points: [] })).rejects.toThrow()
  })

  it('remove borra el blueprint para que ya no aparezca en getByAuthor', async () => {
    await mockClient.create({ author: 'remove-author', name: 'shed', points: [] })
    await mockClient.remove('remove-author', 'shed')

    const items = await mockClient.getByAuthor('remove-author')
    expect(items).toHaveLength(0)
  })

  it('remove rechaza la promesa si el blueprint no existe', async () => {
    await expect(mockClient.remove('nadie', 'nada')).rejects.toThrow()
  })
})
