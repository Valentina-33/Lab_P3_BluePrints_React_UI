import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // El login real vive en /auth/login (sin el prefijo /api que usa
      // apiClient.js), así que acá no reutilizamos esa instancia de axios.
      const { data } = await axios.post('/auth/login', { username, password })
      localStorage.setItem('token', data.access_token)
      onLogin?.()
      navigate('/')
    } catch (e) {
      setError('Credenciales inválidas o servidor no disponible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Login</h2>
      <div className="grid cols-2">
        <div>
          <label htmlFor="login-username">Usuario</label>
          <input
            id="login-username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password">Contraseña</label>
          <input
            id="login-password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="error-text">{error}</p>}
      <button className="btn primary" style={{ marginTop: 12 }} disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )
}
