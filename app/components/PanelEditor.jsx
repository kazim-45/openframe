'use client'
import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ShotTemplateGrid, ShotTemplateSVG } from './ShotTemplates'

const DrawingCanvas = dynamic(() => import('./DrawingCanvas'), { ssr: false })

const SHOT_TYPES = ['ECU','CU','MCU','MS','MWS','WS','EWS','OTS','POV','AERIAL','2-SHOT','INSERT']
const CAM_MOVES  = ['STATIC','PAN LEFT','PAN RIGHT','TILT UP','TILT DOWN','DOLLY IN','DOLLY OUT','TRACKING','HANDHELD','CRANE UP','CRANE DOWN','ZOOM IN','ZOOM OUT']
const LENSES     = ['18mm','24mm','28mm','35mm','50mm','85mm','100mm','135mm','200mm']

export default function PanelEditor({ panel, sceneNumber, onSave, onClose }) {
  const [data, setData] = useState({
    shotType:    panel?.shotType    || 'WS',
    cameraMove:  panel?.cameraMove  || 'STATIC',
    lens:        panel?.lens        || '35mm',
    duration:    panel?.duration    || 3,
    dialogue:    panel?.dialogue    || '',
    action:      panel?.action      || '',
    notes:       panel?.notes       || '',
    visualMode:  panel?.visualMode  || 'template',
    templateKey: panel?.templateKey || 'WS',
    canvasData:  panel?.canvasData  || null,
    imageData:   panel?.imageData   || null,
    aiPrompt:    panel?.aiPrompt    || '',
    aiImageUrl:  panel?.aiImageUrl  || null,
  })
  const [tab,       setTab]      = useState('info')
  const [aiLoading, setAiLoading]= useState(false)
  const [aiError,   setAiError]  = useState('')
  const fileRef = useRef()
  const set = (k,v) => setData(d=>({...d,[k]:v}))

  const generateAI = async () => {
    if(!data.aiPrompt.trim()) return
    setAiLoading(true); setAiError('')
    try {
      const prompt = encodeURIComponent(`cinematic film still, ${data.shotType} shot, ${data.aiPrompt}, dramatic lighting, film grain, professional cinematography`)
      set('aiImageUrl', `https://image.pollinations.ai/prompt/${prompt}?width=640&height=360&nologo=true&seed=${Date.now()}`)
      set('visualMode','ai')
    } catch { setAiError('Generation failed. Try again.') }
    setAiLoading(false)
  }

  const handleUpload = (e) => {
    const file = e.target.files?.[0]; if(!file) return
    const reader = new FileReader()
    reader.onload = () => { set('imageData', reader.result); set('visualMode','upload') }
    reader.readAsDataURL(file)
  }

  const VisualPreview = () => (
    <div className="w-full aspect-video bg-[#111] rounded border border-[#2a2a2a] overflow-hidden">
      {data.visualMode==='template' && <ShotTemplateSVG templateKey={data.templateKey||data.shotType}/>}
      {data.visualMode==='canvas'   && data.canvasData   && <img src={data.canvasData}  alt="sketch" className="w-full h-full object-contain"/>}
      {data.visualMode==='upload'   && data.imageData    && <img src={data.imageData}   alt="ref"    className="w-full h-full object-cover"/>}
      {data.visualMode==='ai'       && data.aiImageUrl   && <img src={data.aiImageUrl}  alt="AI"     className="w-full h-full object-cover"/>}
    </div>
  )

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="bg-[#141414] border border-[#333] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col fade-up mx-2 sm:mx-4" onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#2a2a2a] flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-bebas text-xl sm:text-2xl text-[#c9a84c] tracking-widest">Panel Editor</span>
            <span className="text-xs sm:text-sm text-[#555]">Scene {sceneNumber} · Shot {panel?.number}</span>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#d8d6cc] text-xl w-8 h-8 flex items-center justify-center">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2a2a2a] flex-shrink-0">
          {[{id:'info',l:'📋 Info'},{id:'visual',l:'🎨 Visual'}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 text-sm border-b-2 transition-all ${tab===t.id?'border-[#c9a84c] text-[#c9a84c]':'border-transparent text-[#555] hover:text-[#d8d6cc]'}`}>
              {t.l}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {/* INFO TAB */}
          {tab==='info' && (
            <div className="flex flex-col lg:flex-row gap-5">
              {/* Left */}
              <div className="flex flex-col gap-4 lg:w-1/2">
                <VisualPreview/>
                <div>
                  <label className="block text-xs text-[#555] uppercase tracking-widest mb-2">Shot Type</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SHOT_TYPES.map(s=>(
                      <button key={s} onClick={()=>{set('shotType',s);if(data.visualMode==='template')set('templateKey',s)}}
                        className={`px-2.5 py-1.5 rounded text-xs border transition-all ${data.shotType===s?'bg-[#c9a84c] text-black border-[#c9a84c] font-medium':'border-[#333] text-[#555] hover:text-[#d8d6cc]'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[{label:'Camera',field:'cameraMove',opts:CAM_MOVES},{label:'Lens',field:'lens',opts:LENSES}].map(({label,field,opts})=>(
                    <div key={field}>
                      <label className="block text-xs text-[#555] uppercase tracking-widest mb-1.5">{label}</label>
                      <select value={data[field]} onChange={e=>set(field,e.target.value)}
                        className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] text-sm rounded px-2 py-2 outline-none focus:border-[#c9a84c]">
                        {opts.map(o=><option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-[#555] uppercase tracking-widest mb-1.5">Duration — {data.duration}s</label>
                  <input type="range" min="1" max="60" value={data.duration} onChange={e=>set('duration',Number(e.target.value))} className="w-full"/>
                </div>
              </div>
              {/* Right */}
              <div className="flex flex-col gap-4 lg:w-1/2">
                {[{l:'Action',f:'action',p:'What happens in this shot…'},{l:'Dialogue',f:'dialogue',p:'What is said…'},{l:'Notes',f:'notes',p:'Technical notes, lighting, props…'}].map(({l,f,p})=>(
                  <div key={f}>
                    <label className="block text-xs text-[#555] uppercase tracking-widest mb-1.5">{l}</label>
                    <textarea value={data[f]} onChange={e=>set(f,e.target.value)} placeholder={p} rows={3}
                      className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] text-sm rounded px-3 py-2 font-courier outline-none focus:border-[#c9a84c] resize-none"/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISUAL TAB */}
          {tab==='visual' && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[{id:'template',l:'📐 Templates'},{id:'canvas',l:'✏️ Draw'},{id:'upload',l:'📷 Upload'},{id:'ai',l:'🤖 AI'}].map(m=>(
                  <button key={m.id} onClick={()=>set('visualMode',m.id)}
                    className={`py-2.5 text-sm rounded border transition-all ${data.visualMode===m.id?'bg-[#c9a84c] text-black border-[#c9a84c] font-medium':'border-[#333] text-[#555] hover:text-[#d8d6cc]'}`}>
                    {m.l}
                  </button>
                ))}
              </div>

              {data.visualMode==='template' && (
                <ShotTemplateGrid selected={data.templateKey} onSelect={k=>{set('templateKey',k);set('shotType',k)}}/>
              )}

              {data.visualMode==='canvas' && (
                <DrawingCanvas width={640} height={360} initialData={data.canvasData} onChange={d=>set('canvasData',d)}/>
              )}

              {data.visualMode==='upload' && (
                <div>
                  {data.imageData
                    ? <div className="flex flex-col gap-2">
                        <img src={data.imageData} alt="uploaded" className="w-full rounded border border-[#2a2a2a] object-contain max-h-64"/>
                        <button onClick={()=>fileRef.current?.click()} className="text-xs text-[#555] hover:text-[#d8d6cc]">Replace image</button>
                      </div>
                    : <div onClick={()=>fileRef.current?.click()} className="border-2 border-dashed border-[#333] rounded-lg p-12 text-center cursor-pointer hover:border-[#7a6030]">
                        <div className="text-4xl mb-3">📷</div>
                        <p className="text-sm text-[#555]">Tap to upload a reference image</p>
                      </div>
                  }
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/>
                </div>
              )}

              {data.visualMode==='ai' && (
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs text-[#555] uppercase tracking-widest mb-1.5">Describe the shot</label>
                    <textarea value={data.aiPrompt} onChange={e=>set('aiPrompt',e.target.value)} rows={3}
                      placeholder="detective staring out a rain-covered window at night, neon reflections, noir atmosphere"
                      className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] text-sm rounded px-3 py-2 font-courier outline-none focus:border-[#c9a84c] resize-none"/>
                    <p className="text-xs text-[#555] mt-1">Shot type <span className="text-[#c9a84c]">{data.shotType}</span> added automatically</p>
                  </div>
                  <button onClick={generateAI} disabled={!data.aiPrompt.trim()||aiLoading}
                    className="px-4 py-2.5 bg-[#c9a84c] text-black text-sm font-medium rounded hover:opacity-85 disabled:opacity-40 self-start">
                    {aiLoading?'Generating…':'🤖 Generate Image'}
                  </button>
                  {aiError && <p className="text-[#c85050] text-xs">{aiError}</p>}
                  {data.aiImageUrl && <img src={data.aiImageUrl} alt="AI generated" className="w-full rounded border border-[#2a2a2a] object-cover max-h-64" onError={()=>setAiError('Image failed. Try a different prompt.')}/>}
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] rounded p-3 text-xs text-[#555]">🆓 Powered by Pollinations.ai — free, no API key</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-[#2a2a2a] flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#555] hover:text-[#d8d6cc]">Cancel</button>
          <button onClick={()=>onSave(data)} className="px-5 sm:px-6 py-2 bg-[#c9a84c] text-black text-sm font-medium rounded hover:opacity-85 active:scale-95">
            Save Panel
          </button>
        </div>
      </div>
    </div>
  )
}
