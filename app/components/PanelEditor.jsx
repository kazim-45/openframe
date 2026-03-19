'use client'
import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ShotTemplateGrid, ShotTemplateSVG } from './ShotTemplates'

const DrawingCanvas = dynamic(() => import('./DrawingCanvas'), { ssr: false })

const SHOT_TYPES = ['ECU','CU','MCU','MS','MWS','WS','EWS','OTS','POV','AERIAL','2-SHOT','INSERT']
const CAM_MOVES  = ['STATIC','PAN LEFT','PAN RIGHT','TILT UP','TILT DOWN','DOLLY IN','DOLLY OUT','TRACKING','HANDHELD','CRANE UP','CRANE DOWN','ZOOM IN','ZOOM OUT']
const LENSES     = ['18mm','24mm','28mm','35mm','50mm','85mm','100mm','135mm','200mm','Wide Angle','Telephoto']

export default function PanelEditor({ panel, sceneNumber, onSave, onClose }) {
  const [data, setData] = useState({
    shotType:      panel?.shotType      || 'WS',
    cameraMove:    panel?.cameraMove    || 'STATIC',
    lens:          panel?.lens          || '35mm',
    duration:      panel?.duration      || 3,
    dialogue:      panel?.dialogue      || '',
    action:        panel?.action        || '',
    notes:         panel?.notes         || '',
    visualMode:    panel?.visualMode    || 'template',
    templateKey:   panel?.templateKey   || 'WS',
    canvasData:    panel?.canvasData    || null,
    imageData:     panel?.imageData     || null,
    aiPrompt:      panel?.aiPrompt      || '',
    aiImageUrl:    panel?.aiImageUrl    || null,
  })

  const [tab,       setTab]      = useState('info')         // info | visual
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError,   setAiError]   = useState('')
  const fileRef = useRef()

  const set = (key, val) => setData(d => ({ ...d, [key]: val }))

  /* ── AI image generation via Pollinations (free, no key) ── */
  const generateAI = async () => {
    if (!data.aiPrompt.trim()) return
    setAiLoading(true); setAiError('')
    try {
      const shotLabel = data.shotType.replace(/_/g,' ')
      const prompt    = encodeURIComponent(
        `cinematic film still, ${shotLabel} shot, ${data.aiPrompt}, dramatic lighting, film grain, professional cinematography, movie scene`
      )
      const url = `https://image.pollinations.ai/prompt/${prompt}?width=640&height=360&nologo=true&seed=${Date.now()}`
      set('aiImageUrl', url)
      set('visualMode', 'ai')
    } catch {
      setAiError('Generation failed. Try again.')
    }
    setAiLoading(false)
  }

  /* ── Image upload ── */
  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { set('imageData', reader.result); set('visualMode', 'upload') }
    reader.readAsDataURL(file)
  }

  /* ── Visual preview (small, in the editor header) ── */
  const VisualPreview = () => (
    <div className="w-full aspect-video bg-[#111] rounded border border-border overflow-hidden">
      {data.visualMode === 'template' && (
        <ShotTemplateSVG templateKey={data.templateKey || data.shotType} />
      )}
      {data.visualMode === 'canvas' && data.canvasData && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.canvasData} alt="sketch" className="w-full h-full object-contain"/>
      )}
      {data.visualMode === 'upload' && data.imageData && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.imageData} alt="reference" className="w-full h-full object-cover"/>
      )}
      {data.visualMode === 'ai' && data.aiImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.aiImageUrl} alt="AI generated" className="w-full h-full object-cover"/>
      )}
      {!data.visualMode && (
        <div className="w-full h-full flex items-center justify-center text-text-dim text-xs font-sans">
          No visual yet
        </div>
      )}
    </div>
  )

  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className="bg-surface border border-border2 rounded-xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col fade-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bebas text-2xl text-accent tracking-widest">Panel Editor</span>
            <span className="text-sm text-muted font-sans">
              Scene {sceneNumber} · Shot {panel?.number}
            </span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text transition-colors text-xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border flex-shrink-0">
          {['info','visual'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-sans capitalize border-b-2 transition-all ${
                tab === t
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              {t === 'info' ? '📋 Shot Info' : '🎨 Visual'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-6">

          {/* ── INFO TAB ── */}
          {tab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: preview + shot type */}
              <div className="flex flex-col gap-4">
                <VisualPreview />

                <div>
                  <label className="block text-xs text-muted uppercase tracking-widest mb-2 font-sans">Shot Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SHOT_TYPES.map(s => (
                      <button
                        key={s}
                        onClick={() => { set('shotType', s); if (data.visualMode === 'template') set('templateKey', s) }}
                        className={`px-2.5 py-1 rounded text-xs font-sans border transition-all ${
                          data.shotType === s
                            ? 'bg-accent text-black border-accent font-medium'
                            : 'border-border2 text-muted hover:border-accent-dim hover:text-text'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">Camera</label>
                    <select
                      value={data.cameraMove}
                      onChange={e => set('cameraMove', e.target.value)}
                      className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-2 py-1.5 font-sans outline-none focus:border-accent"
                    >
                      {CAM_MOVES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">Lens</label>
                    <select
                      value={data.lens}
                      onChange={e => set('lens', e.target.value)}
                      className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-2 py-1.5 font-sans outline-none focus:border-accent"
                    >
                      {LENSES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">
                    Duration — {data.duration}s
                  </label>
                  <input
                    type="range" min="1" max="60" value={data.duration}
                    onChange={e => set('duration', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Right: text fields */}
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">Action</label>
                  <textarea
                    value={data.action}
                    onChange={e => set('action', e.target.value)}
                    placeholder="What happens in this shot…"
                    rows={3}
                    className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-3 py-2 font-courier outline-none focus:border-accent resize-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">Dialogue</label>
                  <textarea
                    value={data.dialogue}
                    onChange={e => set('dialogue', e.target.value)}
                    placeholder="What is said in this shot…"
                    rows={3}
                    className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-3 py-2 font-courier outline-none focus:border-accent resize-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">Notes</label>
                  <textarea
                    value={data.notes}
                    onChange={e => set('notes', e.target.value)}
                    placeholder="Technical notes, lighting, props…"
                    rows={3}
                    className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-3 py-2 font-courier outline-none focus:border-accent resize-none transition-colors"
                  />
                </div>

                {/* Duration summary */}
                <div className="bg-surface2 border border-border rounded p-3 text-xs font-sans text-muted">
                  <span className="text-accent font-medium">{data.shotType}</span>
                  {' · '}
                  <span>{data.cameraMove}</span>
                  {' · '}
                  <span>{data.lens}</span>
                  {' · '}
                  <span>{data.duration}s</span>
                </div>
              </div>
            </div>
          )}

          {/* ── VISUAL TAB ── */}
          {tab === 'visual' && (
            <div className="flex flex-col gap-6">
              {/* Mode selector */}
              <div className="flex gap-2">
                {[
                  { id: 'template', label: '📐 Templates' },
                  { id: 'canvas',   label: '✏️ Draw' },
                  { id: 'upload',   label: '📷 Upload' },
                  { id: 'ai',       label: '🤖 AI Generate' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => set('visualMode', m.id)}
                    className={`flex-1 py-2 text-sm font-sans rounded border transition-all ${
                      data.visualMode === m.id
                        ? 'bg-accent text-black border-accent font-medium'
                        : 'border-border2 text-muted hover:border-accent-dim hover:text-text'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Template grid */}
              {data.visualMode === 'template' && (
                <div>
                  <p className="text-xs text-muted font-sans mb-3">Pick a shot composition template</p>
                  <ShotTemplateGrid
                    selected={data.templateKey}
                    onSelect={key => { set('templateKey', key); set('shotType', key) }}
                  />
                </div>
              )}

              {/* Drawing canvas */}
              {data.visualMode === 'canvas' && (
                <DrawingCanvas
                  width={640} height={360}
                  initialData={data.canvasData}
                  onChange={d => set('canvasData', d)}
                />
              )}

              {/* Upload */}
              {data.visualMode === 'upload' && (
                <div>
                  {data.imageData ? (
                    <div className="flex flex-col gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={data.imageData} alt="uploaded" className="w-full rounded border border-border object-contain max-h-64"/>
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="text-xs text-muted hover:text-text font-sans transition-colors"
                      >
                        Replace image
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-border2 rounded-lg p-12 text-center cursor-pointer hover:border-accent-dim transition-colors"
                    >
                      <div className="text-4xl mb-3">📷</div>
                      <p className="text-sm font-sans text-muted">Click to upload a reference image</p>
                      <p className="text-xs font-sans text-text-dim mt-1">PNG, JPG, GIF — any size</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/>
                </div>
              )}

              {/* AI generation */}
              {data.visualMode === 'ai' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">
                      Describe the shot
                    </label>
                    <textarea
                      value={data.aiPrompt}
                      onChange={e => set('aiPrompt', e.target.value)}
                      placeholder="e.g. detective staring out a rain-covered window at night, neon reflections, noir atmosphere"
                      rows={3}
                      className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-3 py-2 font-courier outline-none focus:border-accent resize-none transition-colors"
                    />
                    <p className="text-xs text-muted font-sans mt-1">
                      Shot type <span className="text-accent">{data.shotType}</span> will be added automatically
                    </p>
                  </div>

                  <button
                    onClick={generateAI}
                    disabled={!data.aiPrompt.trim() || aiLoading}
                    className="px-4 py-2 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85 transition-opacity disabled:opacity-40 self-start"
                  >
                    {aiLoading ? 'Generating…' : '🤖 Generate Image'}
                  </button>

                  {aiError && <p className="text-red text-xs font-sans">{aiError}</p>}

                  {data.aiImageUrl && (
                    <div>
                      <p className="text-xs text-muted font-sans mb-2">Generated result:</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.aiImageUrl}
                        alt="AI generated shot"
                        className="w-full rounded border border-border object-cover max-h-64"
                        onError={() => setAiError('Image failed to load. Try a different prompt.')}
                      />
                    </div>
                  )}

                  <div className="bg-surface2 border border-border rounded p-3 text-xs font-sans text-muted">
                    🆓 Powered by Pollinations.ai — free, no API key needed
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-sans text-muted hover:text-text transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(data)}
            className="px-6 py-2 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85 transition-opacity"
          >
            Save Panel
          </button>
        </div>
      </div>
    </div>
  )
}
