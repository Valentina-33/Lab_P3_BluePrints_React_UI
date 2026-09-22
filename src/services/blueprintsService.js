// Elige el servicio de blueprints (mock o real) según una sola variable
// de entorno: VITE_USE_MOCK=true usa el mock, cualquier otro valor usa
// la API real.
import * as mockClient from './blueprintsMockClient.js'
import * as apiClient from './blueprintsApiClient.js'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

const blueprintsService = useMock ? mockClient : apiClient

export default blueprintsService
