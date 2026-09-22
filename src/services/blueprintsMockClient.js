// Servicio "apimock": datos de prueba en memoria, sin backend.
// Misma interfaz que blueprintsApiClient.js para poder intercambiarlos.

const seed = [
  {
    author: 'maria',
    name: 'garage',
    points: [
      { x: 20, y: 20 },
      { x: 100, y: 20 },
      { x: 100, y: 80 },
    ],
  },
  {
    author: 'maria',
    name: 'pool',
    points: [
      { x: 10, y: 10 },
      { x: 50, y: 50 },
    ],
  },
  {
    author: 'carlos',
    name: 'office',
    points: [
      { x: 5, y: 5 },
      { x: 60, y: 5 },
      { x: 60, y: 60 },
      { x: 5, y: 60 },
    ],
  },
]

let blueprints = seed.map((bp) => ({ ...bp }))

export function getAll() {
  return Promise.resolve(blueprints)
}

export function getByAuthor(author) {
  return Promise.resolve(blueprints.filter((bp) => bp.author === author))
}

export function getByAuthorAndName(author, name) {
  const found = blueprints.find((bp) => bp.author === author && bp.name === name)
  if (!found) return Promise.reject(new Error(`No existe el blueprint ${author}/${name}`))
  return Promise.resolve(found)
}

export function create(payload) {
  blueprints = [...blueprints, payload]
  return Promise.resolve(payload)
}

export function update(author, name, payload) {
  const idx = blueprints.findIndex((bp) => bp.author === author && bp.name === name)
  if (idx === -1) return Promise.reject(new Error(`No existe el blueprint ${author}/${name}`))
  const updated = { ...blueprints[idx], ...payload, author, name }
  blueprints = blueprints.map((bp, i) => (i === idx ? updated : bp))
  return Promise.resolve(updated)
}

export function remove(author, name) {
  const exists = blueprints.some((bp) => bp.author === author && bp.name === name)
  if (!exists) return Promise.reject(new Error(`No existe el blueprint ${author}/${name}`))
  blueprints = blueprints.filter((bp) => !(bp.author === author && bp.name === name))
  return Promise.resolve({ author, name })
}
