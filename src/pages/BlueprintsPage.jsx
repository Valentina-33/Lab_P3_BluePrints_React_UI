import { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchByAuthor, fetchBlueprint } from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { byAuthor, current, status } = useSelector((s) => s.blueprints)
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

  const openBlueprint = (bp) => {
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
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
          {status === 'loading' && <p className="muted">Cargando...</p>}
          {!items.length && status !== 'loading' && <p className="muted">Sin resultados.</p>}
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
                      <td>
                        <button className="btn sm" onClick={() => openBlueprint(bp)}>
                          Open
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
      </section>

      <section className="card">
        <h3>Current blueprint: {current?.name || '—'}</h3>
        <BlueprintCanvas points={current?.points || []} />
      </section>
    </div>
  )
}
