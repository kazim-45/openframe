'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'
import dynamic from 'next/dynamic'
import { ShotTemplateSVG } from '../../components/ShotTemplates'

const PanelEditor = dynamic(() => import('../../components/PanelEditor'), { ssr: false })

/* ─── helpers ─── */
function loadProjects() {
  try { return JSON.parse(localStorage.getItem('openframe_projects') || '[]') } catch { return [] }
}
function saveProjects(list) {
  localStorage.setItem('openframe_projects', JSON.stringify(list))
}

/* ─── Panel thumbnail ─── */
function PanelThumb({ shot, sceneNum, onClick }) {
  return (
    <div className="flex flex-col gap-1.5 cursor-pointer group" onClick={onClick}>
      <div className="panel-frame">
        {/* Visual */}
        {shot.visualMode === 'template' && <ShotTemplateSVG templateKey={shot.templateKey || shot.shotType}/>}
        {shot.visualMode === 'canvas'   && shot.canvasData   && <img src={shot.canvasData}  alt="sketch"    className="w-full h-full object-contain"/>}
        {shot.visualMode === 'upload'   && shot.imageData    && <img src={shot.imageData}   alt="reference" className="w-full h-full object-cover"/>}
        {shot.visualMode === 'ai'       && shot.aiImageUrl   && <img src={shot.aiImageUrl}  alt="AI"        className="w-full h-full object-cover"/>}
        {(!shot.visualMode) && (
          <div className="w-full h-full flex items-center justify-center bg-surface2 text-2xl">+</div>
        )}

        {/* Shot badge */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent px-3 pt-1.5 pb-3 z-10">
          <span className="text-[9px] font-sans font-medium text-white/80">
            {sceneNum}.{shot.number} · {shot.shotType}
          </span>
        </div>

        {/* Camera move badge */}
        {shot.cameraMove && shot.cameraMove !== 'STATIC' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-1.5 pt-3 z-10">
            <span className="text-[9px] font-sans text-accent/90">{shot.cameraMove}</span>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="px-0.5">
        <p className="text-[10px] font-sans text-text truncate">{shot.action || 'No action description'}</p>
        {shot.duration && (
          <span className="text-[9px] text-muted font-sans">{shot.duration}s · {shot.lens}</span>
        )}
      </div>
    </div>
  )
}

/* ─── Storyboard tab ─── */
function StoryboardTab({ project, updateProject }) {
  const [editingPanel, setEditingPanel] = useState(null) // { scene, shot }
  const [addingScene,  setAddingScene]  = useState(false)
  const [sceneName,    setSceneName]    = useState('')

  const addScene = () => {
    if (!sceneName.trim()) return
    const scene = { id: uuid(), number: project.scenes.length + 1, name: sceneName.trim(), shots: [] }
    updateProject({ scenes: [...project.scenes, scene] })
    setSceneName(''); setAddingScene(false)
  }

  const addShot = (sceneId) => {
    const scenes = project.scenes.map(s => {
      if (s.id !== sceneId) return s
      const shot = {
        id: uuid(), number: s.shots.length + 1,
        shotType: 'WS', cameraMove: 'STATIC', lens: '35mm', duration: 3,
        dialogue: '', action: '', notes: '',
        visualMode: 'template', templateKey: 'WS',
        canvasData: null, imageData: null, aiPrompt: '', aiImageUrl: null,
      }
      return { ...s, shots: [...s.shots, shot] }
    })
    updateProject({ scenes })
  }

  const deleteScene = (sceneId) => {
    if (!confirm('Delete this scene and all its shots?')) return
    updateProject({ scenes: project.scenes.filter(s => s.id !== sceneId) })
  }

  const deleteShot = (sceneId, shotId) => {
    const scenes = project.scenes.map(s => {
      if (s.id !== sceneId) return s
      return { ...s, shots: s.shots.filter(sh => sh.id !== shotId) }
    })
    updateProject({ scenes })
  }

  const savePanel = (sceneId, shotId, data) => {
    const scenes = project.scenes.map(s => {
      if (s.id !== sceneId) return s
      return { ...s, shots: s.shots.map(sh => sh.id === shotId ? { ...sh, ...data } : sh) }
    })
    updateProject({ scenes })
    setEditingPanel(null)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted font-sans">
          {project.scenes.length} scene{project.scenes.length !== 1 ? 's' : ''} ·{' '}
          {project.scenes.reduce((a, s) => a + s.shots.length, 0)} shots ·{' '}
          ~{Math.round(project.scenes.reduce((a, s) =>
            a + s.shots.reduce((b, sh) => b + (sh.duration || 0), 0), 0) / 60)}min estimated
        </p>
        <button
          onClick={() => setAddingScene(true)}
          className="flex items-center gap-2 px-4 py-1.5 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85 transition-opacity"
        >
          + Add Scene
        </button>
      </div>

      {/* Add scene modal */}
      {addingScene && (
        <div className="modal-bg" onClick={() => setAddingScene(false)}>
          <div className="bg-surface border border-border2 rounded-xl p-6 w-full max-w-md fade-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-bebas text-2xl text-accent tracking-widest mb-4">New Scene</h3>
            <input
              autoFocus
              className="w-full bg-surface2 border border-border2 text-text rounded px-3 py-2 mb-4 font-courier text-sm outline-none focus:border-accent transition-colors"
              placeholder="INT. POLICE STATION - NIGHT"
              value={sceneName}
              onChange={e => setSceneName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addScene()}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddingScene(false)} className="px-4 py-2 text-sm text-muted hover:text-text font-sans">Cancel</button>
              <button onClick={addScene} className="px-4 py-2 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Scenes */}
      {project.scenes.length === 0 ? (
        <div className="text-center py-24 text-muted">
          <div className="text-5xl mb-4">🎬</div>
          <p className="font-sans text-sm">No scenes yet. Add your first scene to begin storyboarding.</p>
        </div>
      ) : (
        project.scenes.map(scene => (
          <div key={scene.id}>
            {/* Scene header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-sans text-muted bg-surface2 border border-border px-2 py-0.5 rounded">
                  Scene {scene.number}
                </span>
                <span className="font-courier text-sm text-text font-bold uppercase">{scene.name}</span>
              </div>
              <div className="flex-1 h-px bg-border"/>
              <span className="text-xs text-muted font-sans">{scene.shots.length} shots</span>
              <button onClick={() => addShot(scene.id)} className="text-xs text-accent hover:text-text font-sans transition-colors px-2 py-1 border border-accent-dim rounded hover:border-accent">+ Shot</button>
              <button onClick={() => deleteScene(scene.id)} className="text-xs text-muted hover:text-red font-sans transition-colors">Delete</button>
            </div>

            {/* Shot grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-2">
              {scene.shots.map(shot => (
                <div key={shot.id} className="relative group">
                  <PanelThumb
                    shot={shot}
                    sceneNum={scene.number}
                    onClick={() => setEditingPanel({ scene, shot })}
                  />
                  <button
                    onClick={() => deleteShot(scene.id, shot.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center hover:bg-red"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add shot button */}
              <div
                onClick={() => addShot(scene.id)}
                className="flex flex-col items-center justify-center border-2 border-dashed border-border2 rounded hover:border-accent-dim transition-colors cursor-pointer aspect-video"
              >
                <span className="text-2xl text-muted">+</span>
                <span className="text-[9px] font-sans text-muted mt-1">Add Shot</span>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Panel editor modal */}
      {editingPanel && (
        <PanelEditor
          panel={editingPanel.shot}
          sceneNumber={editingPanel.scene.number}
          onClose={() => setEditingPanel(null)}
          onSave={data => savePanel(editingPanel.scene.id, editingPanel.shot.id, data)}
        />
      )}
    </div>
  )
}

/* ─── Shot List tab ─── */
function ShotListTab({ project }) {
  const allShots = project.scenes.flatMap(scene =>
    scene.shots.map(shot => ({ ...shot, sceneName: scene.name, sceneNum: scene.number }))
  )

  const totalDuration = allShots.reduce((a, s) => a + (s.duration || 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted font-sans">
          {allShots.length} shots · ~{Math.floor(totalDuration / 60)}m {totalDuration % 60}s estimated
        </p>
        <button
          onClick={() => window.print()}
          className="px-4 py-1.5 text-sm font-sans border border-border2 text-muted rounded hover:text-text hover:border-accent transition-all"
        >
          🖨 Print Shot List
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="bg-surface2 border-b border-border">
              {['#','Scene','Shot Type','Camera','Lens','Duration','Action','Dialogue'].map(h => (
                <th key={h} className="text-left px-3 py-2.5 text-xs text-muted uppercase tracking-wider font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allShots.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-muted text-xs">No shots yet. Add scenes and shots in the Storyboard tab.</td></tr>
            ) : (
              allShots.map((shot, i) => (
                <tr key={shot.id} className={`border-b border-border ${i % 2 === 0 ? 'bg-bg' : 'bg-surface'}`}>
                  <td className="px-3 py-2.5 text-muted text-xs">{shot.sceneNum}.{shot.number}</td>
                  <td className="px-3 py-2.5 text-text-dim text-xs max-w-[120px] truncate">{shot.sceneName}</td>
                  <td className="px-3 py-2.5"><span className="text-accent text-xs font-medium">{shot.shotType}</span></td>
                  <td className="px-3 py-2.5 text-text-dim text-xs">{shot.cameraMove}</td>
                  <td className="px-3 py-2.5 text-text-dim text-xs">{shot.lens}</td>
                  <td className="px-3 py-2.5 text-text-dim text-xs">{shot.duration}s</td>
                  <td className="px-3 py-2.5 text-text text-xs max-w-[200px] truncate">{shot.action || '—'}</td>
                  <td className="px-3 py-2.5 text-text-dim text-xs max-w-[200px] truncate font-courier">{shot.dialogue || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Characters tab ─── */
function CharactersTab({ project, updateProject }) {
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})

  const openNew  = () => { setForm({ name:'', actor:'', description:'', notes:'' }); setEditing('new') }
  const openEdit = (c) => { setForm(c); setEditing(c.id) }

  const save = () => {
    if (!form.name?.trim()) return
    const chars = editing === 'new'
      ? [...project.characters, { id: uuid(), ...form }]
      : project.characters.map(c => c.id === editing ? { ...c, ...form } : c)
    updateProject({ characters: chars })
    setEditing(null)
  }

  const del = (id) => {
    if (!confirm('Delete this character?')) return
    updateProject({ characters: project.characters.filter(c => c.id !== id) })
  }

  const F = ({ label, field, ph, rows }) => (
    <div>
      <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">{label}</label>
      {rows ? (
        <textarea rows={rows} value={form[field] || ''} onChange={e => setForm(f => ({...f,[field]:e.target.value}))}
          placeholder={ph} className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-3 py-2 font-courier outline-none focus:border-accent resize-none transition-colors"/>
      ) : (
        <input value={form[field] || ''} onChange={e => setForm(f => ({...f,[field]:e.target.value}))}
          placeholder={ph} className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-3 py-2 font-courier outline-none focus:border-accent transition-colors"/>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted font-sans">{project.characters.length} character{project.characters.length !== 1 ? 's' : ''}</p>
        <button onClick={openNew} className="px-4 py-1.5 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85 transition-opacity">+ Add Character</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.characters.map(c => (
          <div key={c.id} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-courier font-bold uppercase text-text">{c.name}</h3>
                {c.actor && <p className="text-xs text-muted font-sans mt-0.5">Played by {c.actor}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="text-xs text-muted hover:text-accent font-sans transition-colors">Edit</button>
                <button onClick={() => del(c.id)} className="text-xs text-muted hover:text-red font-sans transition-colors">Del</button>
              </div>
            </div>
            {c.description && <p className="text-xs text-text-dim font-sans mt-2 line-clamp-3">{c.description}</p>}
          </div>
        ))}
      </div>

      {editing && (
        <div className="modal-bg" onClick={() => setEditing(null)}>
          <div className="bg-surface border border-border2 rounded-xl p-6 w-full max-w-lg fade-up flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bebas text-2xl text-accent tracking-widest">{editing === 'new' ? 'New Character' : 'Edit Character'}</h3>
            <F label="Name *"      field="name"        ph="KHALID"/>
            <F label="Actor"       field="actor"       ph="Cast member name"/>
            <F label="Description" field="description" ph="Physical description, backstory…" rows={3}/>
            <F label="Notes"       field="notes"       ph="Costume, props, scheduling notes…" rows={2}/>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-muted font-sans">Cancel</button>
              <button onClick={save} className="px-5 py-2 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Locations tab ─── */
function LocationsTab({ project, updateProject }) {
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})

  const openNew  = () => { setForm({ name:'', address:'', contact:'', phone:'', permitRequired:false, notes:'' }); setEditing('new') }
  const openEdit = (l) => { setForm(l); setEditing(l.id) }

  const save = () => {
    if (!form.name?.trim()) return
    const locs = editing === 'new'
      ? [...project.locations, { id: uuid(), ...form }]
      : project.locations.map(l => l.id === editing ? { ...l, ...form } : l)
    updateProject({ locations: locs })
    setEditing(null)
  }

  const del = (id) => {
    if (!confirm('Delete this location?')) return
    updateProject({ locations: project.locations.filter(l => l.id !== id) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted font-sans">{project.locations.length} location{project.locations.length !== 1 ? 's' : ''}</p>
        <button onClick={openNew} className="px-4 py-1.5 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85 transition-opacity">+ Add Location</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {project.locations.map(l => (
          <div key={l.id} className="bg-surface border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-courier font-bold uppercase text-text text-sm">{l.name}</h3>
                {l.address && <p className="text-xs text-muted font-sans mt-0.5">{l.address}</p>}
              </div>
              <div className="flex items-center gap-3">
                {l.permitRequired && (
                  <span className="text-[10px] bg-amber/20 text-amber border border-amber/30 px-2 py-0.5 rounded font-sans">PERMIT</span>
                )}
                <button onClick={() => openEdit(l)} className="text-xs text-muted hover:text-accent font-sans">Edit</button>
                <button onClick={() => del(l.id)} className="text-xs text-muted hover:text-red font-sans">Del</button>
              </div>
            </div>
            {l.contact && <p className="text-xs text-text-dim font-sans">Contact: {l.contact} {l.phone && `· ${l.phone}`}</p>}
            {l.notes && <p className="text-xs text-muted font-sans mt-2 line-clamp-2">{l.notes}</p>}
          </div>
        ))}
      </div>

      {editing && (
        <div className="modal-bg" onClick={() => setEditing(null)}>
          <div className="bg-surface border border-border2 rounded-xl p-6 w-full max-w-lg fade-up flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bebas text-2xl text-accent tracking-widest">{editing === 'new' ? 'New Location' : 'Edit Location'}</h3>
            {[
              { label:'Name *',   field:'name',    ph:'INT. POLICE STATION' },
              { label:'Address',  field:'address', ph:'Street, City' },
              { label:'Contact',  field:'contact', ph:'Location manager name' },
              { label:'Phone',    field:'phone',   ph:'+92 300 0000000' },
            ].map(f => (
              <div key={f.field}>
                <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">{f.label}</label>
                <input value={form[f.field] || ''} onChange={e => setForm(fm => ({...fm,[f.field]:e.target.value}))}
                  placeholder={f.ph} className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-3 py-2 font-courier outline-none focus:border-accent transition-colors"/>
              </div>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form.permitRequired} onChange={e => setForm(f => ({...f,permitRequired:e.target.checked}))} className="accent-yellow-500"/>
              <span className="text-sm text-text font-sans">Permit required</span>
            </label>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">Notes</label>
              <textarea rows={2} value={form.notes || ''} onChange={e => setForm(f => ({...f,notes:e.target.value}))}
                placeholder="Parking, access, restrictions…"
                className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-3 py-2 font-courier outline-none focus:border-accent resize-none transition-colors"/>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-muted font-sans">Cancel</button>
              <button onClick={save} className="px-5 py-2 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Mood Board tab ─── */
function MoodBoardTab({ project, updateProject }) {
  const addImage = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = { id: uuid(), data: reader.result, caption: '' }
        updateProject({ moodboard: [...(project.moodboard || []), img] })
      }
      reader.readAsDataURL(file)
    })
  }

  const updateCaption = (id, caption) => {
    updateProject({ moodboard: project.moodboard.map(m => m.id === id ? { ...m, caption } : m) })
  }

  const del = (id) => {
    updateProject({ moodboard: project.moodboard.filter(m => m.id !== id) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted font-sans">{(project.moodboard||[]).length} images</p>
        <label className="px-4 py-1.5 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85 transition-opacity cursor-pointer">
          + Upload Images
          <input type="file" accept="image/*" multiple className="hidden" onChange={addImage}/>
        </label>
      </div>

      {(project.moodboard||[]).length === 0 ? (
        <div className="text-center py-24">
          <label className="cursor-pointer flex flex-col items-center gap-3">
            <div className="text-5xl">🖼</div>
            <p className="text-sm font-sans text-muted">Upload reference images for your mood board</p>
            <input type="file" accept="image/*" multiple className="hidden" onChange={addImage}/>
          </label>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
          {(project.moodboard||[]).map(m => (
            <div key={m.id} className="break-inside-avoid mb-3 group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.data} alt={m.caption} className="w-full rounded border border-border object-cover"/>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex flex-col justify-end p-2">
                <input
                  value={m.caption}
                  onChange={e => updateCaption(m.id, e.target.value)}
                  placeholder="Caption…"
                  className="bg-transparent text-white text-xs font-sans border-b border-white/30 outline-none placeholder-white/40 w-full"
                />
                <button onClick={() => del(m.id)} className="absolute top-2 right-2 text-white/70 hover:text-red text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Call Sheet tab ─── */
function CallSheetTab({ project, updateProject }) {
  const cs = project.callsheet || { shootDates: [], crew: [], notes: '' }

  const addDate = () => {
    const d = { id: uuid(), date: '', location: '', callTime: '06:00', scenes: '', notes: '' }
    updateProject({ callsheet: { ...cs, shootDates: [...cs.shootDates, d] } })
  }

  const updateDate = (id, field, val) => {
    const shootDates = cs.shootDates.map(d => d.id === id ? { ...d, [field]: val } : d)
    updateProject({ callsheet: { ...cs, shootDates } })
  }

  const deleteDate = (id) => {
    updateProject({ callsheet: { ...cs, shootDates: cs.shootDates.filter(d => d.id !== id) } })
  }

  const addCrew = () => {
    const c = { id: uuid(), name: '', role: '', phone: '', callTime: '' }
    updateProject({ callsheet: { ...cs, crew: [...cs.crew, c] } })
  }

  const updateCrew = (id, field, val) => {
    const crew = cs.crew.map(c => c.id === id ? { ...c, [field]: val } : c)
    updateProject({ callsheet: { ...cs, crew } })
  }

  const deleteCrew = (id) => {
    updateProject({ callsheet: { ...cs, crew: cs.crew.filter(c => c.id !== id) } })
  }

  const inp = 'bg-surface2 border border-border2 text-text text-xs rounded px-2 py-1.5 font-sans outline-none focus:border-accent transition-colors w-full'

  return (
    <div className="flex flex-col gap-8">
      {/* Shoot dates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text font-sans">Shoot Dates</h3>
          <button onClick={addDate} className="px-3 py-1 text-xs font-sans border border-border2 text-muted rounded hover:text-text hover:border-accent transition-all">+ Add Date</button>
        </div>
        <div className="flex flex-col gap-3">
          {cs.shootDates.map(d => (
            <div key={d.id} className="bg-surface border border-border rounded-lg p-4 grid grid-cols-2 md:grid-cols-5 gap-3 items-start">
              {[
                { label:'Date',      field:'date',      type:'date' },
                { label:'Call Time', field:'callTime',  type:'time' },
                { label:'Location',  field:'location',  type:'text', ph:'INT. POLICE STATION' },
                { label:'Scenes',    field:'scenes',    type:'text', ph:'1A, 2B, 4' },
                { label:'Notes',     field:'notes',     type:'text', ph:'Special notes…' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-[10px] text-muted uppercase tracking-widest mb-1 font-sans">{f.label}</label>
                  <input type={f.type} value={d[f.field]||''} placeholder={f.ph}
                    onChange={e => updateDate(d.id, f.field, e.target.value)} className={inp}/>
                </div>
              ))}
              <button onClick={() => deleteDate(d.id)} className="text-xs text-muted hover:text-red font-sans self-end pb-1.5">Delete</button>
            </div>
          ))}
          {cs.shootDates.length === 0 && <p className="text-sm text-muted font-sans">No shoot dates scheduled.</p>}
        </div>
      </div>

      {/* Crew */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text font-sans">Crew</h3>
          <button onClick={addCrew} className="px-3 py-1 text-xs font-sans border border-border2 text-muted rounded hover:text-text hover:border-accent transition-all">+ Add Crew Member</button>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="bg-surface2 border-b border-border">
                {['Name','Role','Phone','Call Time',''].map((h,i) => (
                  <th key={i} className="text-left px-3 py-2 text-[10px] text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cs.crew.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-muted">No crew added yet.</td></tr>
              ) : (
                cs.crew.map((c,i) => (
                  <tr key={c.id} className={`border-b border-border ${i%2===0?'bg-bg':'bg-surface'}`}>
                    {[
                      { field:'name',     ph:'Crew Name' },
                      { field:'role',     ph:'Director, DP, etc.' },
                      { field:'phone',    ph:'+92…' },
                      { field:'callTime', ph:'07:00', type:'time' },
                    ].map(f => (
                      <td key={f.field} className="px-2 py-1.5">
                        <input type={f.type||'text'} value={c[f.field]||''} placeholder={f.ph}
                          onChange={e => updateCrew(c.id, f.field, e.target.value)} className={inp}/>
                      </td>
                    ))}
                    <td className="px-2 py-1.5">
                      <button onClick={() => deleteCrew(c.id)} className="text-muted hover:text-red transition-colors">✕</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* General notes */}
      <div>
        <label className="block text-xs text-muted uppercase tracking-widest mb-2 font-sans">Production Notes</label>
        <textarea
          rows={4}
          value={cs.notes || ''}
          onChange={e => updateProject({ callsheet: { ...cs, notes: e.target.value } })}
          placeholder="General production notes, safety briefings, equipment lists…"
          className="w-full bg-surface2 border border-border2 text-text text-sm rounded px-3 py-2 font-courier outline-none focus:border-accent resize-none transition-colors"
        />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN PROJECT PAGE
══════════════════════════════════════ */
const TABS = [
  { id: 'storyboard', label: '🎬 Storyboard' },
  { id: 'shotlist',   label: '📋 Shot List' },
  { id: 'characters', label: '👥 Characters' },
  { id: 'locations',  label: '📍 Locations' },
  { id: 'moodboard',  label: '🖼 Mood Board' },
  { id: 'callsheet',  label: '📅 Call Sheet' },
]

export default function ProjectPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const [project, setProject] = useState(null)
  const [tab,     setTab]     = useState('storyboard')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')

  /* Load project */
  useEffect(() => {
    const projects = loadProjects()
    const found    = projects.find(p => p.id === id)
    if (!found) { router.push('/'); return }
    setProject(found)
    setTitleVal(found.title)
  }, [id, router])

  /* Save project on change */
  const updateProject = useCallback((patch) => {
    setProject(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...patch, updatedAt: Date.now() }
      const projects = loadProjects()
      saveProjects(projects.map(p => p.id === updated.id ? updated : p))
      return updated
    })
  }, [])

  const saveTitle = () => {
    if (titleVal.trim()) updateProject({ title: titleVal.trim() })
    setEditingTitle(false)
  }

  if (!project) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-muted font-sans text-sm">Loading…</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top nav */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-13 py-2 flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-muted hover:text-text font-sans text-sm transition-colors flex items-center gap-1">
            ← Back
          </button>

          <div className="w-px h-4 bg-border"/>

          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="18" rx="2"/>
              <line x1="2" y1="8" x2="22" y2="8"/>
              <circle cx="6" cy="5.5" r="1" fill="#c9a84c" stroke="none"/>
              <circle cx="10" cy="5.5" r="1" fill="#c9a84c" stroke="none"/>
            </svg>
            <span className="font-bebas text-xl text-accent tracking-widest">OpenFrame</span>
          </div>

          <div className="flex-1 flex justify-center">
            {editingTitle ? (
              <input
                autoFocus
                value={titleVal}
                onChange={e => setTitleVal(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => { if(e.key==='Enter') saveTitle(); if(e.key==='Escape') setEditingTitle(false) }}
                className="text-center bg-surface2 border border-accent rounded px-3 py-1 font-bebas text-xl tracking-widest text-text outline-none"
              />
            ) : (
              <button onClick={() => setEditingTitle(true)} className="font-bebas text-xl tracking-widest text-text hover:text-accent transition-colors">
                {project.title}
              </button>
            )}
          </div>

          <span className="text-xs text-muted font-sans">
            Saved {new Date(project.updatedAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
          </span>
        </div>
      </header>

      {/* Tab bar */}
      <div className="border-b border-border bg-surface sticky top-[52px] z-40">
        <div className="max-w-screen-xl mx-auto px-6 flex overflow-x-auto scrollbar-hide">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-sans whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                tab === t.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-8">
        {tab === 'storyboard' && <StoryboardTab project={project} updateProject={updateProject}/>}
        {tab === 'shotlist'   && <ShotListTab   project={project}/>}
        {tab === 'characters' && <CharactersTab  project={project} updateProject={updateProject}/>}
        {tab === 'locations'  && <LocationsTab   project={project} updateProject={updateProject}/>}
        {tab === 'moodboard'  && <MoodBoardTab   project={project} updateProject={updateProject}/>}
        {tab === 'callsheet'  && <CallSheetTab   project={project} updateProject={updateProject}/>}
      </main>
    </div>
  )
}
