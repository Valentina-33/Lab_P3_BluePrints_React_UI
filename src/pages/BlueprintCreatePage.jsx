import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import BlueprintForm from '../components/BlueprintForm.jsx'
import { createBlueprint } from '../features/blueprints/blueprintsSlice.js'

export default function BlueprintCreatePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { status, error } = useSelector((s) => s.blueprints.save)
  const [done, setDone] = useState(false)

  const handleSubmit = async (payload) => {
    setDone(false)
    const result = await dispatch(createBlueprint(payload))
    if (createBlueprint.fulfilled.match(result)) {
      setDone(true)
      setTimeout(() => navigate('/'), 800)
    }
  }

  return (
    <div className="card">
      <h2>Crear blueprint</h2>
      <p className="muted">Requiere estar logueado (el POST va protegido con JWT).</p>
      {status === 'loading' && <p className="muted">Guardando...</p>}
      {error && <p className="error-text">{error}</p>}
      {done && <p className="muted">Blueprint creado. Volviendo al listado...</p>}
      <BlueprintForm onSubmit={handleSubmit} />
    </div>
  )
}
