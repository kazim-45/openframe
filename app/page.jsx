'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'

function ProjectCard({ project, onOpen, onDelete }) {
  const shots = project.scenes?.reduce((a, s) => a + (s.shots?.length || 0), 0) || 0
  const updated = new Date(project.updatedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div
      className="group relative bg-surface border border-border rounded-lg p-5 cursor-pointer hover:border-accent transition-all duration-150 hover:-translate-y-0.5"
      onClick={() => onOpen(project.id)}
    >
      {/* Film strip holes */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-3 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-3 h-2 bg-bg rounded-b-sm border border-border border-t-0" />
        ))}
      </div>

      <div className="mt-3">
        <h3 className="font-bebas text-xl text-text tracking-wider mb-1 truncate">{project.title}</h3>
        <p className="text-text-dim text-xs font-sans mb-4 truncate">{project.logline || 'No logline yet'}</p>

        <div className="flex gap-4 text-xs text-muted font-sans">
          <span><span className="text-accent font-medium">{project.scenes?.length || 0}</span> scenes</span>
          <span><span className="text-accent font-medium">{shots}</span> shots</span>
          <span><span className="text-accent font-medium">{project.characters?.length || 0}</span> characters</span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <span className="text-xs text-text-dim font-sans">{updated}</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(project.id) }}
            className="text-xs text-muted hover:text-red transition-colors px-2 py-1 opacity-0 group-hover:opacity-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function NewProjectModal({ onClose, onCreate }) {
  const [title, setTitle]   = useState('')
  const [logline, setLogline] = useState('')
  const [genre, setGenre]   = useState('')

  const genres = ['Drama', 'Thriller', 'Comedy', 'Horror', 'Action', 'Romance', 'Documentary', 'Sci-Fi', 'Crime', 'Other']

  const handleCreate = () => {
    if (!title.trim()) return
    onCreate({ title: title.trim(), logline: logline.trim(), genre })
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        className="bg-surface border border-border2 rounded-xl p-7 w-full max-w-md fade-up"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-bebas text-3xl text-accent tracking-widest mb-6">New Project</h2>

        <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">Title *</label>
        <input
          autoFocus
          className="w-full bg-surface2 border border-border2 text-text rounded px-3 py-2 mb-4 font-courier text-sm outline-none focus:border-accent transition-colors"
          placeholder="THE LAST SHOT"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />

        <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">Logline</label>
        <textarea
          className="w-full bg-surface2 border border-border2 text-text rounded px-3 py-2 mb-4 font-courier text-sm outline-none focus:border-accent transition-colors resize-none"
          placeholder="A one-sentence summary of your film…"
          rows={2}
          value={logline}
          onChange={e => setLogline(e.target.value)}
        />

        <label className="block text-xs text-muted uppercase tracking-widest mb-1.5 font-sans">Genre</label>
        <div className="flex flex-wrap gap-2 mb-6">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g === genre ? '' : g)}
              className={`px-3 py-1 rounded text-xs font-sans border transition-all ${
                genre === g
                  ? 'bg-accent text-black border-accent font-medium'
                  : 'border-border2 text-muted hover:border-accent-dim hover:text-text'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-sans text-muted border border-border2 rounded hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="px-5 py-2 text-sm font-sans font-medium bg-accent text-black rounded hover:opacity-85 transition-opacity disabled:opacity-40"
          >
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
  const [showNew, setShowNew]   = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('openframe_projects')
      if (raw) setProjects(JSON.parse(raw))
    } catch {}
  }, [])

  const save = (list) => {
    setProjects(list)
    localStorage.setItem('openframe_projects', JSON.stringify(list))
  }

  const createProject = ({ title, logline, genre }) => {
    const proj = {
      id:         uuid(),
      title,
      logline,
      genre,
      createdAt:  Date.now(),
      updatedAt:  Date.now(),
      scenes:     [],
      characters: [],
      locations:  [],
      moodboard:  [],
      callsheet:  { shootDates: [], crew: [], notes: '' },
    }
    save([proj, ...projects])
    setShowNew(false)
    router.push(`/project/${proj.id}`)
  }

  const deleteProject = (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return
    save(projects.filter(p => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="18" rx="2"/>
              <line x1="2" y1="8" x2="22" y2="8"/>
              <circle cx="6" cy="5.5" r="1" fill="#c9a84c" stroke="none"/>
              <circle cx="10" cy="5.5" r="1" fill="#c9a84c" stroke="none"/>
              <circle cx="14" cy="5.5" r="1" fill="#c9a84c" stroke="none"/>
            </svg>
            <span className="font-bebas text-2xl text-accent tracking-widest">OpenFrame</span>
          </div>

          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85 transition-opacity"
          >
            <span className="text-lg leading-none">+</span> New Project
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="font-bebas text-6xl text-border2 tracking-widest mb-4">OPENFRAME</div>
            <p className="text-muted text-sm font-sans mb-8 max-w-xs">
              Your pre-production suite. Storyboard, shot list, characters, locations, call sheets — all in one place.
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="px-6 py-2.5 bg-accent text-black text-sm font-sans font-medium rounded hover:opacity-85 transition-opacity"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-bebas text-3xl tracking-widest text-text">Projects</h1>
              <span className="text-text-dim text-sm font-sans">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onOpen={id => router.push(`/project/${id}`)}
                  onDelete={deleteProject}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {showNew && (
        <NewProjectModal
          onClose={() => setShowNew(false)}
          onCreate={createProject}
        />
      )}
    </div>
  )
}
