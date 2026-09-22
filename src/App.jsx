import { useState } from 'react'
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import BlueprintsPage from './pages/BlueprintsPage.jsx'
import BlueprintDetailPage from './pages/BlueprintDetailPage.jsx'
import BlueprintCreatePage from './pages/BlueprintCreatePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFound from './pages/NotFound.jsx'
import PrivateRoute from './routes/PrivateRoute.jsx'

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('token'))
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem('token')
    setAuthed(false)
    navigate('/')
  }

  return (
    <div className="container">
      <header>
        <h1>ECI - Laboratorio de Blueprints en React</h1>
        <nav>
          <NavLink to="/" end>
            Blueprints
          </NavLink>
          {authed && <NavLink to="/blueprints/new">Nuevo blueprint</NavLink>}
          {authed ? (
            <button className="link" onClick={logout}>
              Cerrar sesión
            </button>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<BlueprintsPage />} />
        <Route
          path="/blueprints/new"
          element={
            <PrivateRoute>
              <BlueprintCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/blueprints/:author/:name"
          element={
            <PrivateRoute>
              <BlueprintDetailPage />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<LoginPage onLogin={() => setAuthed(true)} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
