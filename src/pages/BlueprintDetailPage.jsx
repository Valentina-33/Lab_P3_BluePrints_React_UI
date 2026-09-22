import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchBlueprint, updateBlueprint } from '../features/blueprints/blueprintsSlice.js'

const WIDTH = 520
const HEIGHT = 360

export default function BlueprintDetailPage() {
  const { author, name } = useParams()
  const dispatch = useDispatch()
  const bp = useSelector((s) => s.blueprints.current)
  const { status: detailStatus, error: detailError } = useSelector((s) => s.blueprints.detail)
  const { error: saveError } = useSelector((s) => s.blueprints.save)
  const [points, setPoints] = useState([])
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const canvasRef = useRef(null)

  useEffect(() => {
    dispatch(fetchBlueprint({ author, name }))
  }, [author, name, dispatch])

  useEffect(() => {
    if (bp && bp.author === author && bp.name === name) {
      setPoints(bp.points || [])
    }
  }, [bp, author, name])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, WIDTH, HEIGHT)
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x < WIDTH; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, HEIGHT)
      ctx.stroke()
    }
    for (let y = 0; y < HEIGHT; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(WIDTH, y)
      ctx.stroke()
    }
    if (points.length > 1) {
      ctx.strokeStyle = '#93c5fd'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y))
      ctx.stroke()
    }
    ctx.fillStyle = '#fbbf24'
    points.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [points])

  const addPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) * WIDTH) / rect.width)
    const y = Math.round(((e.clientY - rect.top) * HEIGHT) / rect.height)
    setPoints((prev) => [...prev, { x, y }])
    setJustSaved(false)
  }

  const undoLastPoint = () => {
    setPoints((prev) => prev.slice(0, -1))
    setJustSaved(false)
  }

  const save = async () => {
    setSaving(true)
    setJustSaved(false)
    const result = await dispatch(updateBlueprint({ author, name, points }))
    setSaving(false)
    if (updateBlueprint.fulfilled.match(result)) {
      setJustSaved(true)
    }
  }

  if (detailStatus === 'loading' && !bp) {
    return (
      <div className="card">
        <p className="muted">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2>{name}</h2>
      <p>
        <strong>Autor:</strong> {author}
      </p>
      <p className="muted">Haz click en el lienzo para agregar puntos, luego dale a Guardar.</p>
      <canvas
        id="blueprint-editor-canvas"
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onClick={addPoint}
        style={{
          background: '#0b1220',
          border: '1px solid #334155',
          borderRadius: 12,
          width: '100%',
          maxWidth: WIDTH,
          cursor: 'crosshair',
        }}
      />
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button className="btn" onClick={undoLastPoint} disabled={!points.length}>
          Deshacer último punto
        </button>
        <button className="btn primary" onClick={save} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
      {justSaved && <p className="muted">Guardado ✓</p>}
      {saveError && <p className="error-text">{saveError}</p>}
      {detailError && <p className="error-text">{detailError}</p>}
    </div>
  )
}
