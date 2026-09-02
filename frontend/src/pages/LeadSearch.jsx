import { useState, useEffect, useRef } from 'react'
import { Search, Zap, CheckCircle, Loader2, AlertCircle, MapPin } from 'lucide-react'
import { startSearch, getSearchStatus } from '../api/api'
import toast from 'react-hot-toast'

const KEYWORDS_SUGGESTIONS = [
  'fresher', 'final year', '3rd year', 'B.Tech student',
  'open to work', 'internship', 'placement', 'Nagpur engineering',
]

export default function LeadSearch() {
  const [keywords, setKeywords] = useState('')
  const [maxLeads, setMaxLeads] = useState(50)
  const [progress, setProgress] = useState({ progress: 0, message: 'Idle', is_running: 0 })
  const [searching, setSearching] = useState(false)
  const pollRef = useRef(null)

  // Poll status while running
  const pollStatus = () => {
    pollRef.current = setInterval(async () => {
      try {
        const r = await getSearchStatus()
        setProgress(r.data)
        if (!r.data.is_running) {
          clearInterval(pollRef.current)
          setSearching(false)
          if (r.data.progress === 100) {
            toast.success(r.data.message || 'Search complete!')
          }
        }
      } catch { clearInterval(pollRef.current); setSearching(false) }
    }, 1500)
  }

  useEffect(() => {
    // Check if already running on mount
    getSearchStatus().then(r => {
      setProgress(r.data)
      if (r.data.is_running) { setSearching(true); pollStatus() }
    }).catch(() => {})
    return () => clearInterval(pollRef.current)
  }, [])

  const handleSearch = async () => {
    try {
      await startSearch({ course: "IT / Tech Courses", keywords, max_leads: maxLeads })
      setSearching(true)
      setProgress({ progress: 1, message: '🚀 Starting...', is_running: 1 })
      pollStatus()
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('A search is already running. Please wait.')
      } else {
        toast.error('Failed to start search')
      }
    }
  }

  const addKeyword = (kw) => {
    setKeywords(prev => prev ? `${prev}, ${kw}` : kw)
  }

  const isDone    = progress.progress === 100 && !progress.is_running
  const isRunning = !!progress.is_running

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-header">Find Leads</h1>
        <p className="text-gray-400 text-sm mt-1">
          Auto-search Google, Internshala & Nagpur college websites for student leads
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Search Form */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="section-title">🔍 Search Settings</h2>

          {/* Keywords */}
          <div>
            <label className="label">Extra Search Keywords (optional)</label>
            <input
              type="text"
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              className="input-field"
              placeholder="e.g. fresher, final year, B.Tech..."
              disabled={isRunning}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {KEYWORDS_SUGGESTIONS.map(kw => (
                <button
                  key={kw}
                  onClick={() => addKeyword(kw)}
                  disabled={isRunning}
                  className="text-xs bg-brand-600/10 hover:bg-brand-600/20 text-brand-300 border border-brand-600/20 px-2 py-0.5 rounded-full transition-all"
                >
                  + {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Max Leads */}
          <div>
            <label className="label">Max Leads to Fetch: <strong className="text-white">{maxLeads}</strong></label>
            <input
              type="range" min={10} max={100} step={5}
              value={maxLeads}
              onChange={e => setMaxLeads(Number(e.target.value))}
              className="w-full accent-brand-500"
              disabled={isRunning}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10</span><span>50</span><span>100</span>
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={isRunning}
            className="btn-primary w-full justify-center text-base py-3"
          >
            {isRunning ? (
              <><Loader2 size={18} className="animate-spin" /> Searching...</>
            ) : (
              <><Zap size={18} /> Start Lead Search</>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
            <MapPin size={11} className="text-brand-400" />
            Searches focused on Nagpur & nearby Maharashtra
          </p>
        </div>

        {/* Progress Panel */}
        <div className="glass-card p-6">
          <h2 className="section-title mb-4">📊 Search Progress</h2>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">{progress.message}</span>
              <span className="text-white font-bold">{progress.progress}%</span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-purple-500 transition-all duration-500"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>

          {/* Status icon */}
          <div className="flex items-center justify-center py-6">
            {isRunning ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-brand-600/20 border-2 border-brand-500/30
                                flex items-center justify-center animate-pulse-fast mb-3">
                  <Search size={28} className="text-brand-400 animate-spin-slow" />
                </div>
                <p className="text-brand-300 font-semibold">Searching the web...</p>
                <p className="text-xs text-gray-500 mt-1">This may take 30–60 seconds</p>
              </div>
            ) : isDone ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-600/20 border-2 border-green-500/30
                                flex items-center justify-center mb-3">
                  <CheckCircle size={28} className="text-green-400" />
                </div>
                <p className="text-green-300 font-semibold">{progress.message}</p>
                <p className="text-xs text-gray-500 mt-1">Go to <strong className="text-brand-400">All Leads</strong> to view results</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-800 flex items-center justify-center mb-3">
                  <Search size={28} className="text-gray-600" />
                </div>
                <p className="text-gray-500">Ready to search</p>
                <p className="text-xs text-gray-600 mt-1">Configure settings and click Start</p>
              </div>
            )}
          </div>

          {/* Sources list */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 font-medium mb-2">Search Sources:</p>
            <div className="space-y-1.5">
              {[
                { name: '🌐 Google Search',     desc: 'LinkedIn profiles + college contacts' },
                { name: '📋 Internshala',        desc: 'Nagpur student internship seekers'    },
                { name: '🏫 Nagpur Colleges',    desc: 'RTMNU, RCOEM, YCCE, VIT & more'      },
              ].map(s => (
                <div key={s.name} className="flex items-start gap-2 bg-white/5 rounded-lg p-2.5">
                  <span className="text-sm">{s.name.split(' ')[0]}</span>
                  <div>
                    <p className="text-xs text-white font-medium">{s.name.slice(2)}</p>
                    <p className="text-[11px] text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-4 border-yellow-500/20 bg-yellow-500/5">
        <div className="flex gap-3">
          <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-300">About Lead Discovery</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              This tool searches publicly available data (Google, Internshala, college websites).
              Phone numbers found depend on what students have made public online.
              For best results, also use <strong className="text-white">Add Lead</strong> to manually enter
              contacts you already know, then use the auto-message buttons to reach them.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
