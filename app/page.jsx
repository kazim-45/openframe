'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'

function ProjectCard({ project, onOpen, onDelete }) {
  const shots   = project.scenes?.reduce((a, s) => a + (s.shots?.length || 0), 0) || 0
  const updated = new Date(project.updatedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })

  return (
    <div
      className="group relative bg-[#141414] border border-[#2a2a2a] rounded-lg p-5 cursor-pointer hover:border-[#c9a84c] transition-all duration-150 active:scale-[.98]"
      onClick={() => onOpen(project.id)}
    >
      <div className="absolute top-0 left-0 right-0 flex justify-between px-3 pointer-events-none">
        {Array.from({length:8}).map((_,i)=>(
          <div key={i} className="w-3 h-2 bg-[#0a0a0a] rounded-b-sm border border-[#2a2a2a] border-t-0"/>
        ))}
      </div>
      <div className="mt-3">
        <h3 className="font-bebas text-xl text-[#d8d6cc] tracking-wider mb-1 truncate">{project.title}</h3>
        <p className="text-[#555] text-xs mb-4 truncate">{project.logline || 'No logline yet'}</p>
        <div className="flex gap-4 text-xs text-[#555]">
          <span><span className="text-[#c9a84c] font-medium">{project.scenes?.length||0}</span> scenes</span>
          <span><span className="text-[#c9a84c] font-medium">{shots}</span> shots</span>
          <span><span className="text-[#c9a84c] font-medium">{project.characters?.length||0}</span> chars</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2a2a2a]">
          <span className="text-xs text-[#555]">{updated}</span>
          <button
            onClick={e=>{e.stopPropagation();onDelete(project.id)}}
            className="text-xs text-[#555] hover:text-[#c85050] transition-colors px-2 py-1 opacity-0 group-hover:opacity-100"
          >Delete</button>
        </div>
      </div>
    </div>
  )
}

function NewProjectModal({ onClose, onCreate }) {
  const [title,  setTitle]  = useState('')
  const [logline,setLogline]= useState('')
  const [genre,  setGenre]  = useState('')
  const genres = ['Drama','Thriller','Comedy','Horror','Action','Romance','Documentary','Sci-Fi','Crime','Other']

  const handleCreate = () => { if(!title.trim()) return; onCreate({title:title.trim(),logline:logline.trim(),genre}) }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="bg-[#141414] border border-[#333] rounded-xl p-6 w-full max-w-md fade-up mx-4" onClick={e=>e.stopPropagation()}>
        <h2 className="font-bebas text-3xl text-[#c9a84c] tracking-widest mb-5">New Project</h2>

        <label className="block text-xs text-[#555] uppercase tracking-widest mb-1.5">Title *</label>
        <input autoFocus className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] rounded px-3 py-2.5 mb-4 font-courier text-sm outline-none focus:border-[#c9a84c]"
          placeholder="THE LAST SHOT" value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleCreate()}/>

        <label className="block text-xs text-[#555] uppercase tracking-widest mb-1.5">Logline</label>
        <textarea className="w-full bg-[#1c1c1c] border border-[#333] text-[#d8d6cc] rounded px-3 py-2 mb-4 font-courier text-sm outline-none focus:border-[#c9a84c] resize-none"
          placeholder="A one-sentence summary…" rows={2} value={logline} onChange={e=>setLogline(e.target.value)}/>

        <label className="block text-xs text-[#555] uppercase tracking-widest mb-2">Genre</label>
        <div className="flex flex-wrap gap-2 mb-5">
          {genres.map(g=>(
            <button key={g} onClick={()=>setGenre(g===genre?'':g)}
              className={`px-3 py-1.5 rounded text-xs border transition-all ${genre===g?'bg-[#c9a84c] text-black border-[#c9a84c] font-medium':'border-[#333] text-[#555] hover:text-[#d8d6cc] hover:border-[#7a6030]'}`}>
              {g}
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-[#555] border border-[#333] rounded hover:text-[#d8d6cc]">Cancel</button>
          <button onClick={handleCreate} disabled={!title.trim()}
            className="px-5 py-2.5 text-sm font-medium bg-[#c9a84c] text-black rounded hover:opacity-85 disabled:opacity-40">
            Create Project
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [showNew,  setShowNew]  = useState(false)

  useEffect(()=>{ try{ const r=localStorage.getItem('openframe_projects'); if(r) setProjects(JSON.parse(r)) }catch{} },[])

  const save = (list) => { setProjects(list); localStorage.setItem('openframe_projects', JSON.stringify(list)) }

  const createProject = ({title,logline,genre}) => {
    const proj = { id:uuid(), title, logline, genre, createdAt:Date.now(), updatedAt:Date.now(),
      scenes:[], characters:[], locations:[], moodboard:[], callsheet:{shootDates:[],crew:[],notes:''} }
    save([proj,...projects]); setShowNew(false); router.push(`/project/${proj.id}`)
  }

  const deleteProject = (id) => { if(!confirm('Delete this project?')) return; save(projects.filter(p=>p.id!==id)) }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-[#2a2a2a] bg-[#141414] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="18" rx="2"/>
              <line x1="2" y1="8" x2="22" y2="8"/>
              <circle cx="6" cy="5.5" r="1" fill="#c9a84c" stroke="none"/>
              <circle cx="10" cy="5.5" r="1" fill="#c9a84c" stroke="none"/>
            </svg>
            <span className="font-bebas text-xl sm:text-2xl text-[#c9a84c] tracking-widest">OpenFrame</span>
          </div>
          <button onClick={()=>setShowNew(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#c9a84c] text-black text-sm font-medium rounded hover:opacity-85 active:scale-95 transition-all">
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {projects.length===0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <div className="font-bebas text-5xl sm:text-6xl text-[#2a2a2a] tracking-widest mb-4">OPENFRAME</div>
            <p className="text-[#555] text-sm mb-8 max-w-xs">Pre-production suite for filmmakers. Storyboard, shot list, characters, locations, call sheets.</p>
            <button onClick={()=>setShowNew(true)} className="px-6 py-3 bg-[#c9a84c] text-black text-sm font-medium rounded hover:opacity-85">
              Create Your First Project
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-bebas text-2xl sm:text-3xl tracking-widest text-[#d8d6cc]">Projects</h1>
              <span className="text-[#555] text-sm">{projects.length} project{projects.length!==1?'s':''}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(p=>(
                <ProjectCard key={p.id} project={p} onOpen={id=>router.push(`/project/${id}`)} onDelete={deleteProject}/>
              ))}
            </div>
          </>
        )}
      </main>

      {showNew && <NewProjectModal onClose={()=>setShowNew(false)} onCreate={createProject}/>}
    </div>
  )
}
