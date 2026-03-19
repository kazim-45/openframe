'use client'
import { useRef, useEffect, useState, useCallback } from 'react'

const TOOLS = [
  { id: 'pencil',    label: '✏️', title: 'Pencil' },
  { id: 'eraser',    label: '⬜', title: 'Eraser' },
  { id: 'line',      label: '╱',  title: 'Line' },
  { id: 'rect',      label: '□',  title: 'Rectangle' },
  { id: 'ellipse',   label: '○',  title: 'Ellipse' },
]

const COLORS = ['#ffffff','#c9a84c','#e05252','#5a8fc8','#5a9a5a','#aaaaaa','#555555','#000000']

export default function DrawingCanvas({ width = 640, height = 360, onChange, initialData }) {
  const canvasRef = useRef(null)
  const [tool,      setTool]      = useState('pencil')
  const [color,     setColor]     = useState('#ffffff')
  const [lineWidth, setLineWidth] = useState(2)
  const [drawing,   setDrawing]   = useState(false)
  const startRef = useRef({ x: 0, y: 0 })
  const snapshotRef = useRef(null)

  // Load initial data
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (initialData) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0)
      img.src = initialData
    }
  }, []) // eslint-disable-line

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    }
  }

  const startDraw = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const pos    = getPos(e, canvas)
    startRef.current = pos

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    }
    // Snapshot for shape drawing
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setDrawing(true)
  }, [tool])

  const draw = useCallback((e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const pos    = getPos(e, canvas)

    ctx.lineWidth   = tool === 'eraser' ? lineWidth * 6 : lineWidth
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.strokeStyle = tool === 'eraser' ? '#111111' : color

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    } else {
      // Restore snapshot then draw shape preview
      ctx.putImageData(snapshotRef.current, 0, 0)
      const { x: sx, y: sy } = startRef.current
      ctx.beginPath()
      ctx.strokeStyle = color

      if (tool === 'line') {
        ctx.moveTo(sx, sy)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      } else if (tool === 'rect') {
        ctx.strokeRect(sx, sy, pos.x - sx, pos.y - sy)
      } else if (tool === 'ellipse') {
        const rx = Math.abs(pos.x - sx) / 2
        const ry = Math.abs(pos.y - sy) / 2
        ctx.ellipse(sx + (pos.x - sx) / 2, sy + (pos.y - sy) / 2, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }, [drawing, tool, color, lineWidth])

  const endDraw = useCallback(() => {
    if (!drawing) return
    setDrawing(false)
    // Export canvas data
    const canvas = canvasRef.current
    if (onChange) onChange(canvas.toDataURL())
  }, [drawing, onChange])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    ctx.fillStyle = '#111111'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    if (onChange) onChange(canvas.toDataURL())
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-surface2 border border-border rounded px-3 py-2 flex-wrap">
        {/* Tools */}
        <div className="flex gap-1">
          {TOOLS.map(t => (
            <button
              key={t.id}
              title={t.title}
              onClick={() => setTool(t.id)}
              className={`w-8 h-8 rounded text-sm flex items-center justify-center transition-all ${
                tool === t.id
                  ? 'bg-accent text-black'
                  : 'text-muted hover:text-text hover:bg-surface3'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Colors */}
        <div className="flex gap-1.5 items-center">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                color === c ? 'border-accent scale-125' : 'border-border2'
              }`}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Stroke width */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-sans">Size</span>
          <input
            type="range" min="1" max="12" value={lineWidth}
            onChange={e => setLineWidth(Number(e.target.value))}
            className="w-16 accent-amber-500"
          />
        </div>

        <div className="ml-auto">
          <button
            onClick={clearCanvas}
            className="text-xs text-muted hover:text-red font-sans transition-colors px-2 py-1"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`w-full rounded border border-border bg-[#111] ${
          tool === 'eraser' ? 'canvas-eraser' : 'canvas-pencil'
        }`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        style={{ touchAction: 'none' }}
      />
    </div>
  )
}
