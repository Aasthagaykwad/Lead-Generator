import { useState, useEffect, useCallback } from 'react'
import {
  Search, Filter, Download, Trash2, RefreshCw, Send, Users, X,
} from 'lucide-react'
import { getLeads, setStatus, deleteLead, deleteAll } from '../api/api'
import LeadCard from '../components/LeadCard'
import MessageModal from '../components/MessageModal'
import toast from 'react-hot-toast'

const STATUSES = [
  { value: 'all',            label: 'All Leads' },
  { value: 'new',            label: 'New'        },
  { value: 'interested',     label: 'Interested' },
  { value: 'contacted',      label: 'Contacted'  },
  { value: 'converted',      label: 'Converted'  },
  { value: 'not_interested', label: 'Not Int.'   },
]

export default function LeadsList() {
  const [leads, setLeads]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus_]  = useState('all')
  const [msgModal, setMsgModal]     = useState(null)  // { lead, platform }
  const [editLead, setEditLead]     = useState(null)
  const [total, setTotal]           = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await getLeads({ status: statusFilter, search })
      setLeads(r.data.leads)
      setTotal(r.data.count)
    } catch { toast.error('Failed to load leads') }
    finally { setLoading(false) }
  }, [statusFilter, search])

  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [load])

  const handleStatusChange = async (id, s) => {
    await setStatus(id, s)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return
    await deleteLead(id)
    toast.success('Lead deleted')
    load()
  }

  const handleDeleteAll = async () => {
    if (!confirm('Delete ALL leads? This cannot be undone.')) return
    await deleteAll()
    toast.success('All leads cleared')
    load()
  }

  const exportCSV = () => {
    if (leads.length === 0) { toast.error('No leads to export'); return }
    const headers = ['Name', 'Phone', 'Email', 'College', 'Status', 'Score', 'LinkedIn', 'Instagram', 'Source', 'Notes']
    const rows = leads.map(l => [
      l.name, l.phone, l.email, l.college,
      l.status, l.score, l.linkedin_url, l.instagram_url, l.source,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `nagpur-leads-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded!')
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-header">All Leads</h1>
          <p className="text-gray-400 text-sm mt-1">{total} leads found</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={load}         className="btn-ghost text-sm"><RefreshCw size={14} /> Refresh</button>
          <button onClick={exportCSV}    className="btn-ghost text-sm"><Download  size={14} /> Export CSV</button>
          <button onClick={handleDeleteAll} className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 border border-red-500/20">
            <Trash2 size={14} /> Clear All
          </button>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, college..."
            className="input-field pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatus_(s.value)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === s.value
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw size={32} className="animate-spin text-brand-400 mx-auto mb-3" />
            <p className="text-gray-400">Loading leads...</p>
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-card">
          <Users size={48} className="text-gray-700 mb-4" />
          <p className="text-gray-400 font-medium">No leads found</p>
          <p className="text-gray-600 text-sm mt-1">
            {search ? 'Try a different search term' : 'Go to "Find Leads" to discover students'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onSendMessage={(l, platform) => setMsgModal({ lead: l, platform })}
              onEdit={setEditLead}
            />
          ))}
        </div>
      )}

      {/* Message Modal */}
      {msgModal && (
        <MessageModal
          lead={msgModal.lead}
          platform={msgModal.platform}
          onClose={() => { setMsgModal(null); load() }}
        />
      )}

      {/* Edit Modal (inline simple) */}
      {editLead && (
        <EditModal lead={editLead} onClose={() => { setEditLead(null); load() }} />
      )}
    </div>
  )
}

// ─── Inline Edit Modal ────────────────────────────────────────────────────────
import { updateLead as _updateLead } from '../api/api'

function EditModal({ lead, onClose }) {
  const [form, setForm] = useState({ ...lead })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await _updateLead(lead.id, form)
      toast.success('Lead updated!')
      onClose()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const F = ({ label, field, type = 'text' }) => (
    <div>
      <label className="label">{label}</label>
      <input type={type} value={form[field] || ''} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
        className="input-field" />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Edit Lead</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-white" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F label="Name"           field="name" />
          <F label="Phone"          field="phone" />
          <F label="Email"          field="email" />
          <F label="College"        field="college" />
          <F label="LinkedIn URL"   field="linkedin_url" />
          <F label="Instagram URL"  field="instagram_url" />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea rows={3} value={form.notes || ''} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className="input-field resize-none" />
        </div>
        <div>
          <label className="label">Status</label>
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field">
            {['new','contacted','interested','converted','not_interested'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
