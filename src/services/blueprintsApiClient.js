// Servicio "apiclient": consume el API REST real con Axios.
// Misma interfaz que blueprintsMockClient.js para poder intercambiarlos.
//
// Nota de nombres: el archivo con la instancia de Axios se llama
// apiClient.js. No lo llamamos "apiclient.js" (minúsculas) porque en un
// sistema de archivos que no distingue mayúsculas/minúsculas (como
// Windows) sería el mismo archivo y uno pisaría al otro.
import api from './apiClient.js'

// La API real envuelve toda respuesta en { code, message, data }.
function unwrap(request) {
  return request.then(({ data }) => data.data)
}

export function getAll() {
  return unwrap(api.get('/v1/blueprints'))
}

export function getByAuthor(author) {
  return unwrap(api.get(`/v1/blueprints/${encodeURIComponent(author)}`))
}

export function getByAuthorAndName(author, name) {
  return unwrap(api.get(`/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`))
}

export function create(payload) {
  // El endpoint real no devuelve el blueprint creado (data: null), así que
  // devolvemos el payload para que quien llame pueda actualizar su estado.
  return api.post('/v1/blueprints', payload).then(() => payload)
}

// Nota: PUT/DELETE no se verificaron contra el backend real (los labs
// anteriores solo confirmaron GET/POST con curl), se implementan siguiendo
// la misma convención REST que el resto de la API.
export function update(author, name, payload) {
  return api
    .put(`/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`, payload)
    .then(() => ({ ...payload, author, name }))
}

export function remove(author, name) {
  return api
    .delete(`/v1/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`)
    .then(() => ({ author, name }))
}
