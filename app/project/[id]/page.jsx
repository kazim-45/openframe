'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'
import dynamic from 'next/dynamic'
import { ShotTemplateSVG } from '../../components/ShotTemplates'

const PanelEditor = dynamic(() => import('../../components/PanelEditor'), { ssr: false })

/* ─── storage ─── */
function loadProjects() { try { return JSON.parse(localStorage.getItem('openframe_projects')||'[]') } catch { return [] } }
function saveProjects(list) { localStorage.setItem('openframe_projects', JSON.stringify(list)) }

/* ─── export helpers ─── */
function exportJSON(project) {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${project.title.replace(/\s+/g,'_')}_openframe.json`
  a.click()
}

function printMode(cls, title, project) {
  // Build the print-root content based on mode
  let html = ''
  if (cls === 'print-storyboard') {
    html = buildStoryboardPrint(project)
  } else if (cls === 'print-shotlist') {
    html = buildShotListPrint(project)
  } else if (cls === 'print-callsheet') {
    html = buildCallSheetPrint(project)
  }

  // Write into print-root, print, then clean up
  let root = document.getElementById('print-root')
  if (!root) {
    root = document.createElement('div')
    root.id = 'print-root'
    document.body.appendChild(root)
  }
  root.className = cls
  root.innerHTML = html
  document.body.dataset.printing = cls
  window.print()
  document.body.dataset.printing = ''
  root.innerHTML = ''
}

function buildStoryboardPrint(project) {
  const scenes = project.scenes || []
  if (!scenes.length) return '<p>No scenes yet.</p>'
  let html = `<h1 style="font-family:sans-serif;font-size:16pt;font-weight:700;margin-bottom:4mm">${project.title}</h1>`
  scenes.forEach(scene => {
    html += `<div class="print-scene-title">${scene.number}. ${scene.name}</div>`
    html += `<div class="print-panel-grid">`
    scene.shots.forEach(shot => {
      const visual = shot.visualMode === 'upload' ? shot.imageData
        : shot.visualMode === 'canvas'  ? shot.canvasData
        : shot.visualMode === 'ai'      ? shot.aiImageUrl
        : null
      html += `<div class="print-panel">
        <div class="print-panel-img" style="display:flex;align-items:center;justify-content:center;background:#eee">
          ${visual ? `<img src="${visual}" style="width:100%;height:100%;object-fit:cover"/>` : `<span style="font-size:8pt;color:#999">${shot.shotType||'—'}</span>`}
        </div>
        <div class="print-panel-meta">
          <strong>${scene.number}.${shot.number} · ${shot.shotType||''}</strong>
          ${shot.cameraMove && shot.cameraMove!=='STATIC'?` · ${shot.cameraMove}`:''}
          ${shot.lens?` · ${shot.lens}`:''}
          ${shot.duration?` · ${shot.duration}s`:''}
          ${shot.action?`<br><em>${shot.action.slice(0,80)}${shot.action.length>80?'…':''}</em>`:''}
        </div>
      </div>`
    })
    html += `</div>`
  })
  return html
}

function buildShotListPrint(project) {
  const all = (project.scenes||[]).flatMap(s => s.shots.map(sh=>({...sh,sceneName:s.name,sceneNum:s.number})))
  const total = all.reduce((a,s)=>a+(s.duration||0),0)
  return `
    <div class="print-shotlist">
      <h1 style="font-family:sans-serif;font-size:16pt;font-weight:700;margin-bottom:1mm">${project.title}</h1>
      <p style="font-family:sans-serif;font-size:9pt;color:#666;margin-bottom:5mm">Shot List · ${all.length} shots · ~${Math.floor(total/60)}m ${total%60}s</p>
      <table>
        <thead>
          <tr>
            ${['#','Scene','Type','Camera','Lens','Dur.','Action','Dialogue'].map(h=>`<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${all.map(s=>`
            <tr>
              <td>${s.sceneNum}.${s.number}</td>
              <td>${s.sceneName||''}</td>
              <td><strong>${s.shotType||''}</strong></td>
              <td>${s.cameraMove||''}</td>
              <td>${s.lens||''}</td>
              <td>${s.duration||''}s</td>
              <td>${s.action||'—'}</td>
              <td>${s.dialogue||'—'}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`
}

function buildCallSheetPrint(project) {
  const cs = project.callsheet || {}
  const dates = cs.shootDates || []
  const crew  = cs.crew || []
  return `
    <div class="print-callsheet">
      <div class="cs-header">
        <h1>${project.title}</h1>
        <p>Call Sheet · OpenFrame by OpenSlate</p>
      </div>
      ${dates.length ? `
      <div class="cs-section">
        <h2>Shoot Schedule</h2>
        <table>
          <thead><tr>${['Date','Call Time','Location','Scenes','Notes'].map(h=>`<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${dates.map(d=>`<tr><td>${d.date||''}</td><td>${d.callTime||''}</td><td>${d.location||''}</td><td>${d.scenes||''}</td><td>${d.notes||''}</td></tr>`).join('')}</tbody>
        </table>
      </div>` : ''}
      ${crew.length ? `
      <div class="cs-section">
        <h2>Crew</h2>
        <table>
          <thead><tr>${['Name','Role','Phone','Call Time'].map(h=>`<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${crew.map(c=>`<tr><td>${c.name||''}</td><td>${c.role||''}</td><td>${c.phone||''}</td><td>${c.callTime||''}</td></tr>`).join('')}</tbody>
        </table>
      </div>` : ''}
      ${cs.notes ? `<div class="cs-section"><h2>Production Notes</h2><p class="cs-notes">${cs.notes}</p></div>` : ''}
    </div>`
}

/* ─── Panel thumbnail ─── */
function PanelThumb({ shot, sceneNum, onClick }) {
  return (
    <div className="flex flex-col gap-1.5 cursor-pointer group" onClick={onClick}>
      <div className="panel-frame">
        {shot.visualMode==='template' && <ShotTemplateSVG templateKey={shot.templateKey||shot.shotType}/>}
        {shot.visualMode==='canvas'   && shot.canvasData  && <img src={shot.canvasData}  alt="sketch" className="w-full h-full object-contain"/>}
        {shot.visualMode==='upload'   && shot.imageData   && <img src={shot.imageData}   alt="ref"    className="w-full h-full object-cover"/>}
        {shot.visualMode==='ai'       && shot.aiImageUrl  && <img src={shot.aiImageUrl}  alt="AI"     className="w-full h-full object-cover"/>}
        {!shot.visualMode && <div className="w-full h-full flex items-center justify-center bg-[#1c1c1c] text-2xl text-[#333]">+</div>}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent px-2 pt-1.5 pb-3 z-10">
          <span className="text-[9px] text-white/80">{sceneNum}.{shot.number} · {shot.shotType}</span>
        </div>
        {shot.cameraMove && shot.cameraMove!=='STATIC' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-3 z-10">
            <span className="text-[9px] text-[#c9a84c]/90">{shot.cameraMove}</span>
          </div>
        )}
      </div>
      <div className="px-0.5">
        <p className="text-[10px] text-[#d8d6cc] truncate">{shot.action||'No description'}</p>
        <span className="text-[9px] text-[#555]">{shot.duration}s · {shot.lens}</span>
      </div>
    </div>
  )
}

/* ─── Storyboard ─── */
function StoryboardTab({ project, updateProject }) {
  const [editingPanel, setEditingPanel] = useState(null)
  const [addingScene,  setAddingScene]  = useState(false)
  const [sceneName,    setSceneName]    = useState('')

  const addScene = () => {
    if(!sceneName.trim()) return
    const scene = { id:uuid(), number:project.scenes.length+1, name:sceneName.trim(), shots:[] }
    updateProject({ scenes:[...project.scenes, scene] })
    setSceneName(''); setAddingScene(false)
  }

  const addShot = (sceneId) => {
    const scenes = project.scenes.map(s => {
      if(s.id!==sceneId) return s
      const shot = { id:uuid(), number:s.shots.length+1, shotType:'WS', cameraMove:'STATIC', lens:'35mm', duration:3,
        dialogue:'', action:'', notes:'', visualMode:'template', templateKey:'WS', canvasData:null, imageData:null, aiPrompt:'', aiImageUrl:null }
      return { ...s, shots:[...s.shots, shot] }
    })
    updateProject({ scenes })
  }

  const deleteScene = (sceneId) => {
    if(!confirm('Delete this scene?')) return
    updateProject({ scenes:project.scenes.filter(s=>s.id!==sceneId) })
  }

  const deleteShot = (sceneId, shotId) => {
    updateProject({ scenes:project.scenes.map(s => s.id!==sceneId ? s : { ...s, shots:s.shots.filter(sh=>sh.id!==shotId) }) })
  }

  const savePanel = (sceneId, shotId, data) => {
    updateProject({ scenes:project.scenes.map(s => s.id!==sceneId ? s : { ...s, shots:s.shots.map(sh=>sh.id===shotId?{...sh,...data}:sh) }) })
    setEditingPanel(null)
  }

  const totalShots = project.scenes.reduce((a,s)=>a+s.shots.length,0)
  const totalSecs  = project.scenes.reduce((a,s)=>a+s.shots.reduce((b,sh)=>b+(sh.duration||0),0),0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#555]">
          {project.scenes.length} scene{project.scenes.length!==1?'s':''} · {totalShots} shots · ~{Math.round(totalSecs/60)}min
        </p>
        <button onClick={()=>setAddingScene(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#c9a84c] text-black text-sm font-medium rounded hover:opacity-85 active:scale-95">
          + Add Scene
        </button>
      </div>

      {addingScene && (
        <div className="modal-bg" onClick={()=>setAddingScene(false)}>
          <div className="bg-[#141414] border border-[#333] rounded-xl p-5 w-full max-w-md fade-up mx-4" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bebas text-2xl text-[#c9a84c] tracking-widest mb-4">New Scene</h3>
            <input autoFocus className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] rounded px-3 py-2.5 mb-4 font-courier text-sm outline-none focus:border-[#c9a84c]"
              placeholder="INT. POLICE STATION - NIGHT" value={sceneName} onChange={e=>setSceneName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addScene()}/>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setAddingScene(false)} className="px-4 py-2 text-sm text-[#555] hover:text-[#d8d6cc]">Cancel</button>
              <button onClick={addScene} className="px-4 py-2 bg-[#c9a84c] text-black text-sm font-medium rounded">Add</button>
            </div>
          </div>
        </div>
      )}

      {project.scenes.length===0 ? (
        <div className="text-center py-20 text-[#555]">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-sm">No scenes yet. Add your first scene to begin storyboarding.</p>
        </div>
      ) : (
        project.scenes.map(scene => (
          <div key={scene.id}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-[#555] bg-[#1c1c1c] border border-[#2a2a2a] px-2 py-0.5 rounded">Scene {scene.number}</span>
              <span className="font-courier text-sm text-[#d8d6cc] font-bold uppercase truncate flex-1">{scene.name}</span>
              <span className="text-xs text-[#555] hidden sm:inline">{scene.shots.length} shots</span>
              <button onClick={()=>addShot(scene.id)} className="text-xs text-[#c9a84c] border border-[#7a6030] rounded px-2 py-1 hover:border-[#c9a84c] whitespace-nowrap">+ Shot</button>
              <button onClick={()=>deleteScene(scene.id)} className="text-xs text-[#555] hover:text-[#c85050] hidden sm:inline">Delete</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-2">
              {scene.shots.map(shot => (
                <div key={shot.id} className="relative group">
                  <PanelThumb shot={shot} sceneNum={scene.number} onClick={()=>setEditingPanel({scene,shot})}/>
                  <button onClick={()=>deleteShot(scene.id,shot.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center hover:bg-[#c85050]">
                    ×
                  </button>
                </div>
              ))}
              <div onClick={()=>addShot(scene.id)} className="flex flex-col items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded hover:border-[#7a6030] cursor-pointer aspect-video">
                <span className="text-2xl text-[#555]">+</span>
                <span className="text-[9px] text-[#555] mt-1">Add Shot</span>
              </div>
            </div>
          </div>
        ))
      )}

      {editingPanel && (
        <PanelEditor panel={editingPanel.shot} sceneNumber={editingPanel.scene.number}
          onClose={()=>setEditingPanel(null)}
          onSave={data=>savePanel(editingPanel.scene.id,editingPanel.shot.id,data)}/>
      )}
    </div>
  )
}

/* ─── Shot List ─── */
function ShotListTab({ project, onPrint }) {
  const all = (project.scenes||[]).flatMap(s=>s.shots.map(sh=>({...sh,sceneName:s.name,sceneNum:s.number})))
  const total = all.reduce((a,s)=>a+(s.duration||0),0)
  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3">
        <p className="text-sm text-[#555]">{all.length} shots · ~{Math.floor(total/60)}m {total%60}s</p>
        <button onClick={onPrint} className="px-4 py-2 text-sm border border-[#333] text-[#555] rounded hover:text-[#d8d6cc] hover:border-[#c9a84c] whitespace-nowrap">
          🖨 Print / PDF
        </button>
      </div>
      <div className="border border-[#2a2a2a] rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-[#1c1c1c] border-b border-[#2a2a2a]">
              {['#','Scene','Type','Camera','Lens','Dur.','Action','Dialogue'].map(h=>(
                <th key={h} className="text-left px-3 py-2.5 text-xs text-[#555] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {all.length===0 ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-[#555] text-xs">No shots yet.</td></tr>
            ) : all.map((s,i)=>(
              <tr key={s.id} className={`border-b border-[#2a2a2a] ${i%2===0?'bg-[#0a0a0a]':'bg-[#141414]'}`}>
                <td className="px-3 py-2 text-[#555] text-xs">{s.sceneNum}.{s.number}</td>
                <td className="px-3 py-2 text-[#555] text-xs max-w-[100px] truncate">{s.sceneName}</td>
                <td className="px-3 py-2"><span className="text-[#c9a84c] text-xs font-medium">{s.shotType}</span></td>
                <td className="px-3 py-2 text-[#555] text-xs">{s.cameraMove}</td>
                <td className="px-3 py-2 text-[#555] text-xs">{s.lens}</td>
                <td className="px-3 py-2 text-[#555] text-xs">{s.duration}s</td>
                <td className="px-3 py-2 text-[#d8d6cc] text-xs max-w-[160px] truncate">{s.action||'—'}</td>
                <td className="px-3 py-2 text-[#555] text-xs max-w-[160px] truncate font-courier">{s.dialogue||'—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Characters ─── */
function CharactersTab({ project, updateProject }) {
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState({})

  const save=()=>{ if(!form.name?.trim())return
    const chars=editing==='new'?[...project.characters,{id:uuid(),...form}]:project.characters.map(c=>c.id===editing?{...c,...form}:c)
    updateProject({characters:chars}); setEditing(null) }
  const del=(id)=>{ if(!confirm('Delete?'))return; updateProject({characters:project.characters.filter(c=>c.id!==id)}) }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#555]">{project.characters.length} character{project.characters.length!==1?'s':''}</p>
        <button onClick={()=>{setForm({name:'',actor:'',description:'',notes:''});setEditing('new')}}
          className="px-4 py-2 bg-[#c9a84c] text-black text-sm font-medium rounded hover:opacity-85">
          + Add Character
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.characters.map(c=>(
          <div key={c.id} className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-courier font-bold uppercase text-[#d8d6cc]">{c.name}</h3>
                {c.actor && <p className="text-xs text-[#555] mt-0.5">Played by {c.actor}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={()=>{setForm(c);setEditing(c.id)}} className="text-xs text-[#555] hover:text-[#c9a84c]">Edit</button>
                <button onClick={()=>del(c.id)} className="text-xs text-[#555] hover:text-[#c85050]">Del</button>
              </div>
            </div>
            {c.description && <p className="text-xs text-[#555] line-clamp-3">{c.description}</p>}
          </div>
        ))}
      </div>
      {editing && (
        <div className="modal-bg" onClick={()=>setEditing(null)}>
          <div className="bg-[#141414] border border-[#333] rounded-xl p-5 w-full max-w-lg fade-up flex flex-col gap-4 mx-4" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bebas text-2xl text-[#c9a84c] tracking-widest">{editing==='new'?'New Character':'Edit Character'}</h3>
            {[{l:'Name *',f:'name',p:'KHALID'},{l:'Actor',f:'actor',p:'Cast member'},{l:'Description',f:'description',p:'Physical description…',rows:3},{l:'Notes',f:'notes',p:'Costume, props…',rows:2}].map(({l,f,p,rows})=>(
              <div key={f}>
                <label className="block text-xs text-[#555] uppercase tracking-widest mb-1.5">{l}</label>
                {rows
                  ? <textarea rows={rows} value={form[f]||''} onChange={e=>setForm(fm=>({...fm,[f]:e.target.value}))} placeholder={p} className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] text-sm rounded px-3 py-2 font-courier outline-none focus:border-[#c9a84c] resize-none"/>
                  : <input value={form[f]||''} onChange={e=>setForm(fm=>({...fm,[f]:e.target.value}))} placeholder={p} className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] text-sm rounded px-3 py-2 font-courier outline-none focus:border-[#c9a84c]"/>
                }
              </div>
            ))}
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setEditing(null)} className="px-4 py-2 text-sm text-[#555]">Cancel</button>
              <button onClick={save} className="px-5 py-2 bg-[#c9a84c] text-black text-sm font-medium rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Locations ─── */
function LocationsTab({ project, updateProject }) {
  const [editing,setEditing]=useState(null)
  const [form,setForm]=useState({})

  const save=()=>{ if(!form.name?.trim())return
    const locs=editing==='new'?[...project.locations,{id:uuid(),...form}]:project.locations.map(l=>l.id===editing?{...l,...form}:l)
    updateProject({locations:locs}); setEditing(null) }
  const del=(id)=>{ if(!confirm('Delete?'))return; updateProject({locations:project.locations.filter(l=>l.id!==id)}) }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#555]">{project.locations.length} location{project.locations.length!==1?'s':''}</p>
        <button onClick={()=>{setForm({name:'',address:'',contact:'',phone:'',permitRequired:false,notes:''});setEditing('new')}}
          className="px-4 py-2 bg-[#c9a84c] text-black text-sm font-medium rounded hover:opacity-85">
          + Add Location
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {project.locations.map(l=>(
          <div key={l.id} className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-courier font-bold uppercase text-[#d8d6cc] text-sm">{l.name}</h3>
                {l.address && <p className="text-xs text-[#555]">{l.address}</p>}
              </div>
              <div className="flex items-center gap-2">
                {l.permitRequired && <span className="text-[10px] bg-amber-900/30 text-amber-400 border border-amber-800/50 px-2 py-0.5 rounded">PERMIT</span>}
                <button onClick={()=>{setForm(l);setEditing(l.id)}} className="text-xs text-[#555] hover:text-[#c9a84c]">Edit</button>
                <button onClick={()=>del(l.id)} className="text-xs text-[#555] hover:text-[#c85050]">Del</button>
              </div>
            </div>
            {l.contact && <p className="text-xs text-[#555]">{l.contact}{l.phone&&` · ${l.phone}`}</p>}
            {l.notes && <p className="text-xs text-[#555] mt-1 line-clamp-2">{l.notes}</p>}
          </div>
        ))}
      </div>
      {editing && (
        <div className="modal-bg" onClick={()=>setEditing(null)}>
          <div className="bg-[#141414] border border-[#333] rounded-xl p-5 w-full max-w-lg fade-up flex flex-col gap-4 mx-4" onClick={e=>e.stopPropagation()}>
            <h3 className="font-bebas text-2xl text-[#c9a84c] tracking-widest">{editing==='new'?'New Location':'Edit Location'}</h3>
            {[{l:'Name *',f:'name',p:'INT. POLICE STATION'},{l:'Address',f:'address',p:'Street, City'},{l:'Contact',f:'contact',p:'Location manager'},{l:'Phone',f:'phone',p:'+92 300 0000000'}].map(({l,f,p})=>(
              <div key={f}>
                <label className="block text-xs text-[#555] uppercase tracking-widest mb-1.5">{l}</label>
                <input value={form[f]||''} onChange={e=>setForm(fm=>({...fm,[f]:e.target.value}))} placeholder={p}
                  className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] text-sm rounded px-3 py-2 font-courier outline-none focus:border-[#c9a84c]"/>
              </div>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form.permitRequired} onChange={e=>setForm(f=>({...f,permitRequired:e.target.checked}))} className="accent-yellow-500 w-4 h-4"/>
              <span className="text-sm text-[#d8d6cc]">Permit required</span>
            </label>
            <div>
              <label className="block text-xs text-[#555] uppercase tracking-widest mb-1.5">Notes</label>
              <textarea rows={2} value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Parking, access, restrictions…"
                className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] text-sm rounded px-3 py-2 font-courier outline-none focus:border-[#c9a84c] resize-none"/>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setEditing(null)} className="px-4 py-2 text-sm text-[#555]">Cancel</button>
              <button onClick={save} className="px-5 py-2 bg-[#c9a84c] text-black text-sm font-medium rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Mood Board ─── */
function MoodBoardTab({ project, updateProject }) {
  const addImage = (e) => {
    Array.from(e.target.files||[]).forEach(file=>{
      const reader = new FileReader()
      reader.onload = ()=>updateProject({moodboard:[...(project.moodboard||[]),{id:uuid(),data:reader.result,caption:''}]})
      reader.readAsDataURL(file)
    })
  }
  const del = (id) => updateProject({moodboard:project.moodboard.filter(m=>m.id!==id)})
  const cap = (id,caption) => updateProject({moodboard:project.moodboard.map(m=>m.id===id?{...m,caption}:m)})

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[#555]">{(project.moodboard||[]).length} images</p>
        <label className="px-4 py-2 bg-[#c9a84c] text-black text-sm font-medium rounded hover:opacity-85 cursor-pointer">
          + Upload <input type="file" accept="image/*" multiple className="hidden" onChange={addImage}/>
        </label>
      </div>
      {(project.moodboard||[]).length===0 ? (
        <label className="flex flex-col items-center py-20 cursor-pointer">
          <div className="text-5xl mb-3">🖼</div>
          <p className="text-sm text-[#555]">Upload reference images</p>
          <input type="file" accept="image/*" multiple className="hidden" onChange={addImage}/>
        </label>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
          {(project.moodboard||[]).map(m=>(
            <div key={m.id} className="break-inside-avoid mb-3 group relative">
              <img src={m.data} alt={m.caption} className="w-full rounded border border-[#2a2a2a] object-cover"/>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col justify-end p-2">
                <input value={m.caption} onChange={e=>cap(m.id,e.target.value)} placeholder="Caption…"
                  className="bg-transparent text-white text-xs border-b border-white/30 outline-none placeholder-white/40 w-full"/>
                <button onClick={()=>del(m.id)} className="absolute top-2 right-2 text-white/70 hover:text-[#c85050]">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Call Sheet ─── */
function CallSheetTab({ project, updateProject, onPrint }) {
  const cs = project.callsheet || { shootDates:[], crew:[], notes:'' }
  const upCS = (patch) => updateProject({ callsheet:{...cs,...patch} })

  const addDate = () => upCS({shootDates:[...cs.shootDates,{id:uuid(),date:'',location:'',callTime:'06:00',scenes:'',notes:''}]})
  const upDate  = (id,f,v) => upCS({shootDates:cs.shootDates.map(d=>d.id===id?{...d,[f]:v}:d)})
  const delDate = (id) => upCS({shootDates:cs.shootDates.filter(d=>d.id!==id)})
  const addCrew = () => upCS({crew:[...cs.crew,{id:uuid(),name:'',role:'',phone:'',callTime:''}]})
  const upCrew  = (id,f,v) => upCS({crew:cs.crew.map(c=>c.id===id?{...c,[f]:v}:c)})
  const delCrew = (id) => upCS({crew:cs.crew.filter(c=>c.id!==id)})

  const inp = 'bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] text-xs rounded px-2 py-1.5 outline-none focus:border-[#c9a84c] w-full'

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-medium text-[#d8d6cc]">Shoot Dates</h3>
            <button onClick={onPrint} className="px-3 py-1 text-xs border border-[#333] text-[#555] rounded hover:text-[#d8d6cc] hover:border-[#c9a84c]">
              🖨 Print Call Sheet
            </button>
          </div>
          <button onClick={addDate} className="px-3 py-1.5 text-xs border border-[#333] text-[#555] rounded hover:text-[#d8d6cc] hover:border-[#c9a84c]">+ Add Date</button>
        </div>
        <div className="flex flex-col gap-3">
          {cs.shootDates.map(d=>(
            <div key={d.id} className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[{l:'Date',f:'date',t:'date'},{l:'Call Time',f:'callTime',t:'time'},{l:'Location',f:'location',t:'text',p:'Scene location'},{l:'Scenes',f:'scenes',t:'text',p:'1A, 2B'},{l:'Notes',f:'notes',t:'text',p:'Notes…'}].map(({l,f,t,p})=>(
                <div key={f}>
                  <label className="block text-[10px] text-[#555] uppercase tracking-widest mb-1">{l}</label>
                  <input type={t} value={d[f]||''} placeholder={p} onChange={e=>upDate(d.id,f,e.target.value)} className={inp}/>
                </div>
              ))}
              <button onClick={()=>delDate(d.id)} className="text-xs text-[#555] hover:text-[#c85050] self-end pb-1.5 col-span-2 sm:col-span-1 text-left sm:text-center">Delete</button>
            </div>
          ))}
          {cs.shootDates.length===0 && <p className="text-sm text-[#555]">No shoot dates scheduled.</p>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[#d8d6cc]">Crew</h3>
          <button onClick={addCrew} className="px-3 py-1.5 text-xs border border-[#333] text-[#555] rounded hover:text-[#d8d6cc] hover:border-[#c9a84c]">+ Add Crew</button>
        </div>
        <div className="border border-[#2a2a2a] rounded-lg overflow-x-auto">
          <table className="w-full text-xs min-w-[500px]">
            <thead><tr className="bg-[#1c1c1c] border-b border-[#2a2a2a]">
              {['Name','Role','Phone','Call Time',''].map((h,i)=><th key={i} className="text-left px-3 py-2 text-[10px] text-[#555] uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {cs.crew.length===0
                ? <tr><td colSpan={5} className="px-3 py-6 text-center text-[#555]">No crew added yet.</td></tr>
                : cs.crew.map((c,i)=>(
                  <tr key={c.id} className={`border-b border-[#2a2a2a] ${i%2===0?'bg-[#0a0a0a]':'bg-[#141414]'}`}>
                    {[{f:'name',p:'Name'},{f:'role',p:'Director, DP…'},{f:'phone',p:'+92…'},{f:'callTime',p:'07:00',t:'time'}].map(({f,p,t})=>(
                      <td key={f} className="px-2 py-1.5">
                        <input type={t||'text'} value={c[f]||''} placeholder={p} onChange={e=>upCrew(c.id,f,e.target.value)} className={inp}/>
                      </td>
                    ))}
                    <td className="px-2 py-1.5"><button onClick={()=>delCrew(c.id)} className="text-[#555] hover:text-[#c85050]">✕</button></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#555] uppercase tracking-widest mb-2">Production Notes</label>
        <textarea rows={4} value={cs.notes||''} onChange={e=>upCS({notes:e.target.value})}
          placeholder="General notes, safety briefings, equipment lists…"
          className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] text-sm rounded px-3 py-2 font-courier outline-none focus:border-[#c9a84c] resize-none"/>
      </div>
    </div>
  )
}

/* ══════════════════════════════
   MAIN PAGE
══════════════════════════════ */
const TABS = [
  {id:'storyboard',label:'🎬',full:'Storyboard'},
  {id:'shotlist',  label:'📋',full:'Shot List'},
  {id:'characters',label:'👥',full:'Characters'},
  {id:'locations', label:'📍',full:'Locations'},
  {id:'moodboard', label:'🖼', full:'Mood Board'},
  {id:'callsheet', label:'📅',full:'Call Sheet'},
]

export default function ProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project,      setProject]      = useState(null)
  const [tab,          setTab]          = useState('storyboard')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal,     setTitleVal]     = useState('')
  const [showExport,   setShowExport]   = useState(false)

  useEffect(()=>{
    const p = loadProjects().find(p=>p.id===id)
    if(!p){router.push('/');return}
    setProject(p); setTitleVal(p.title)
  },[id,router])

  const updateProject = useCallback((patch)=>{
    setProject(prev=>{
      if(!prev) return prev
      const updated = {...prev,...patch,updatedAt:Date.now()}
      saveProjects(loadProjects().map(p=>p.id===updated.id?updated:p))
      return updated
    })
  },[])

  const saveTitle = () => { if(titleVal.trim()) updateProject({title:titleVal.trim()}); setEditingTitle(false) }

  if(!project) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="text-[#555] text-sm">Loading…</div></div>

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Top nav */}
      <header className="border-b border-[#2a2a2a] bg-[#141414] sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-13 py-2.5 flex items-center gap-3">
          <button onClick={()=>router.push('/')} className="text-[#555] hover:text-[#d8d6cc] text-sm transition-colors flex items-center gap-1 flex-shrink-0">
            ←<span className="hidden sm:inline"> Back</span>
          </button>
          <div className="w-px h-4 bg-[#2a2a2a] hidden sm:block"/>
          <span className="font-bebas text-lg sm:text-xl text-[#c9a84c] tracking-widest hidden sm:inline flex-shrink-0">OpenFrame</span>

          <div className="flex-1 flex justify-center min-w-0">
            {editingTitle ? (
              <input autoFocus value={titleVal} onChange={e=>setTitleVal(e.target.value)}
                onBlur={saveTitle} onKeyDown={e=>{if(e.key==='Enter')saveTitle();if(e.key==='Escape')setEditingTitle(false)}}
                className="text-center bg-[#1c1c1c] border border-[#c9a84c] rounded px-3 py-1 font-bebas text-lg tracking-widest text-[#d8d6cc] outline-none w-full max-w-xs"/>
            ) : (
              <button onClick={()=>setEditingTitle(true)} className="font-bebas text-lg sm:text-xl tracking-widest text-[#d8d6cc] hover:text-[#c9a84c] transition-colors truncate max-w-[200px] sm:max-w-xs">
                {project.title}
              </button>
            )}
          </div>

          {/* Export menu */}
          <div className="relative flex-shrink-0">
            <button onClick={()=>setShowExport(!showExport)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#333] text-[#555] text-xs rounded hover:text-[#d8d6cc] hover:border-[#c9a84c] transition-all">
              ↓ Export
            </button>
            {showExport && (
              <>
                <div className="fixed inset-0 z-40" onClick={()=>setShowExport(false)}/>
                <div className="absolute right-0 top-9 bg-[#141414] border border-[#333] rounded-lg overflow-hidden z-50 w-52 shadow-xl fade-up">
                  {[
                    {label:'📄 PDF — Storyboard',  action:()=>{printMode('print-storyboard','Storyboard',project);setShowExport(false)}},
                    {label:'📋 PDF — Shot List',    action:()=>{printMode('print-shotlist','Shot List',project);setShowExport(false)}},
                    {label:'📅 PDF — Call Sheet',   action:()=>{printMode('print-callsheet','Call Sheet',project);setShowExport(false)}},
                    {label:'💾 JSON Backup',        action:()=>{exportJSON(project);setShowExport(false)}},
                  ].map(({label,action})=>(
                    <button key={label} onClick={action}
                      className="w-full text-left px-4 py-3 text-sm text-[#d8d6cc] hover:bg-[#1c1c1c] hover:text-[#c9a84c] transition-colors border-b border-[#2a2a2a] last:border-0">
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Tab bar — scrollable on mobile */}
      <div className="border-b border-[#2a2a2a] bg-[#141414] sticky top-[52px] z-40 overflow-x-auto">
        <div className="flex min-w-max sm:min-w-0 px-2 sm:px-6 sm:justify-start">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-4 sm:px-5 py-3 text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 flex items-center gap-1.5 ${
                tab===t.id ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-transparent text-[#555] hover:text-[#d8d6cc]'
              }`}>
              <span>{t.label}</span>
              <span className="hidden sm:inline">{t.full}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {tab==='storyboard' && <StoryboardTab project={project} updateProject={updateProject}/>}
        {tab==='shotlist'   && <ShotListTab   project={project} onPrint={()=>printMode('print-shotlist','Shot List',project)}/>}
        {tab==='characters' && <CharactersTab  project={project} updateProject={updateProject}/>}
        {tab==='locations'  && <LocationsTab   project={project} updateProject={updateProject}/>}
        {tab==='moodboard'  && <MoodBoardTab   project={project} updateProject={updateProject}/>}
        {tab==='callsheet'  && <CallSheetTab   project={project} updateProject={updateProject} onPrint={()=>printMode('print-callsheet','Call Sheet',project)}/>}
      </main>

      {/* Hidden print root */}
      <div id="print-root" style={{display:'none'}}/>
    </div>
  )
}
