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
