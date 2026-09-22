import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import PrivateRoute from '../src/routes/PrivateRoute.jsx'

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={['/protegido']}>
      <Routes>
        <Route
          path="/protegido"
          element={
            <PrivateRoute>
              <p>Contenido protegido</p>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<p>Página de login</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirige a /login si no hay token', () => {
    renderWithRoute()
    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('renderiza el contenido si hay un token guardado', () => {
    localStorage.setItem('token', 'fake-jwt')
    renderWithRoute()
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })
})
