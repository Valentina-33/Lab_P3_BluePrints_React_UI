import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  fetchByAuthor,
  fetchBlueprint,
  removeBlueprint,
  selectTopBlueprints,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, list, detail } = useSelector((s) => s.blueprints)
  const topBlueprints = useSelector(selectTopBlueprints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const items = byAuthor[selectedAuthor] || []

  const totalPoints = useMemo(
    () => items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0),
    [items],
  )

  const getBlueprints = () => {
    if (!authorInput) return
    setSelectedAuthor(authorInput)
    dispatch(fetchByAuthor(authorInput))
  }

  const retry = () => {
    if (selectedAuthor) dispatch(fetchByAuthor(selectedAuthor))
  }

  const openBlueprint = (bp) => {
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const deleteBlueprint = (bp) => {
    if (!window.confirm(`¿Borrar "${bp.name}"?`)) return
    dispatch(removeBlueprint({ author: bp.author, name: bp.name }))
  }

  return (
    <div className="page-layout">
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2>Blueprints</h2>
          <div className="search-row">
            <input
              className="input"
              placeholder="Author"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
            />
            <button className="btn primary" onClick={getBlueprints}>
              Get blueprints
            </button>
          </div>
        </div>

        <div className="card">
          <h3>{selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}</h3>
          {list.status === 'loading' && <p className="muted">Cargando...</p>}
          {list.status === 'failed' && (
            <div>
              <p className="error-text">{list.error}</p>
              <button className="btn sm" onClick={retry}>
                Reintentar
              </button>
            </div>
          )}
          {!items.length && list.status === 'succeeded' && <p className="muted">Sin resultados.</p>}
          {!!items.length && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Blueprint name</th>
                    <th className="text-right">Number of points</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((bp) => (
                    <tr key={bp.name}>
                      <td>{bp.name}</td>
                      <td className="text-right">{bp.points?.length || 0}</td>
                      <td style={{ display: 'flex', gap: 6 }}>
                        <button className="btn sm" onClick={() => openBlueprint(bp)}>
                          Open
                        </button>
                        <Link className="btn sm" to={`/blueprints/${bp.author}/${bp.name}`}>
                          Edit
                        </Link>
                        <button className="btn sm" onClick={() => deleteBlueprint(bp)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="stat-line">Total user points: {totalPoints}</p>
        </div>

        {!!topBlueprints.length && (
          <div className="card">
            <h3>Top 5 blueprints (por puntos)</h3>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              {topBlueprints.map((bp) => (
                <li key={`${bp.author}/${bp.name}`}>
                  {bp.name} <span className="muted">({bp.author})</span> — {bp.points?.length || 0}{' '}
                  puntos
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Current blueprint: {current?.name || '—'}</h3>
        {detail.status === 'loading' && <p className="muted">Cargando plano...</p>}
        {detail.status === 'failed' && <p className="error-text">{detail.error}</p>}
        <BlueprintCanvas points={current?.points || []} />
      </section>
    </div>
  )
}
