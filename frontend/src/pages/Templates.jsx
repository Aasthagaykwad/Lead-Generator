import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, MessageSquare, Linkedin, Eye, X, Save } from 'lucide-react'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api/api'
import toast from 'react-hot-toast'

const EMPTY = { name: '', platform: 'whatsapp', content: '' }

const DEFAULT_WA = `Hello {name}! 👋

I came across your profile and wanted to reach out personally.

🎓 We offer *premium IT courses* with *DIRECT PLACEMENT GUARANTEE* in Nagpur!
Including Data Analytics, Python, Java, Web Dev, and MIM.

💼 *500+ students already placed in top companies!*

📍 Located in Nagpur — perfect for local students!

Interested? Just reply *YES* and I'll share all details including fees, schedule & placement record!

Looking forward to hearing from you 😊`

const DEFAULT_LI = `Hi {name},

I noticed your profile and wanted to connect with a special opportunity!

We're offering industry-leading IT courses from Nagpur with DIRECT PLACEMENT ASSISTANCE (Data Analytics, Python, Java, Web Dev, MIM).

Our students from {college} and across Nagpur have landed jobs at top MNCs!

Would you be open to a quick 10-minute call? I'd love to share the details.

Best regards`

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [editing, setEditing]     = useState(null)   // template being edited/created
  const [preview, setPreview]     = useState(null)   // template being previewed
  const [saving, setSaving]       = useState(false)

  const load = async () => {
    try { const r = await getTemplates(); setTemplates(r.data.templates) }
    catch { toast.error('Failed to load templates') }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing({ ...EMPTY })
  }

  const openEdit = (t) => setEditing({ ...t })

  const handleSave = async () => {
    if (!editing.name.trim() || !editing.content.trim()) {
      toast.error('Name and content are required')
      return
    }
    setSaving(true)
    try {
      if (editing.id) {
        await updateTemplate(editing.id, editing)
        toast.success('Template updated!')
      } else {
        await createTemplate(editing)
        toast.success('Template created!')
      }
      setEditing(null)
      load()
    } catch { toast.error('Failed to save template') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this template?')) return
    await deleteTemplate(id)
    toast.success('Template deleted')
    load()
  }

  const previewContent = (content) => {
    return content
      .replace(/{name}/g, 'Rahul Sharma')
      .replace(/{college}/g, 'RTMNU Nagpur')
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">Message Templates</h1>
          <p className="text-gray-400 text-sm mt-1">
            Create reusable WhatsApp & LinkedIn message templates for your course pitch
          </p>
        </div>
        <button onClick={openNew} className="btn-primary">
          <Plus size={16} /> New Template
        </button>
      </div>

      {/* Variables hint */}
      <div className="glass-card p-4 flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0">
          <MessageSquare size={16} className="text-brand-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Dynamic Variables</p>
          <p className="text-xs text-gray-400 mt-1">
            Use these placeholders — they're replaced automatically when you send:&nbsp;
            <code className="bg-brand-600/20 text-brand-300 px-1.5 py-0.5 rounded text-xs">{'{name}'}</code>&nbsp;
            <code className="bg-brand-600/20 text-brand-300 px-1.5 py-0.5 rounded text-xs">{'{college}'}</code>
          </p>
        </div>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {templates.map(t => (
          <div key={t.id} className="glass-card p-5 hover:border-brand-500/30 transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {t.platform === 'whatsapp' ? (
                  <div className="w-9 h-9 rounded-xl bg-green-600/20 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-400">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </div>
                ) : t.platform === 'instagram' ? (
                  <div className="w-9 h-9 rounded-xl bg-pink-600/20 flex items-center justify-center flex-shrink-0">
                    <Instagram size={17} className="text-pink-400" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <Linkedin size={17} className="text-blue-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    t.platform === 'whatsapp'
                      ? 'bg-green-500/20 text-green-300'
                      : t.platform === 'instagram'
                      ? 'bg-pink-500/20 text-pink-300'
                      : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {t.platform === 'whatsapp' ? 'WhatsApp' : t.platform === 'instagram' ? 'Instagram' : 'LinkedIn'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setPreview(t)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Eye size={14} className="text-gray-400 hover:text-white" />
                </button>
                <button onClick={() => openEdit(t)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Edit3 size={14} className="text-gray-400 hover:text-white" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>

            {/* Content preview */}
            <div className="mt-3 bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-mono leading-relaxed line-clamp-4 whitespace-pre-line">
                {t.content}
              </p>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="xl:col-span-2 flex flex-col items-center justify-center py-16 glass-card">
            <MessageSquare size={40} className="text-gray-700 mb-3" />
            <p className="text-gray-400">No templates yet</p>
            <button onClick={openNew} className="btn-primary mt-4 text-sm">
              <Plus size={15} /> Create First Template
            </button>
          </div>
        )}
      </div>

      {/* Quick start templates */}
      {templates.length === 0 && (
        <div className="glass-card p-5">
          <h3 className="section-title mb-3">⚡ Quick Start Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'IT Course Pitch – WhatsApp', platform: 'whatsapp', content: DEFAULT_WA },
              { name: 'IT Course Pitch – LinkedIn',  platform: 'linkedin',  content: DEFAULT_LI },
            ].map(t => (
              <button
                key={t.name}
                onClick={async () => { await createTemplate(t); load(); toast.success('Template added!') }}
                className="text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all"
              >
                <p className="font-medium text-white text-sm">{t.name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.content.slice(0, 80)}...</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="section-title">{editing.id ? 'Edit' : 'New'} Template</h2>
              <button onClick={() => setEditing(null)}><X size={18} className="text-gray-400 hover:text-white" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Template Name</label>
                <input type="text" value={editing.name}
                  onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                  className="input-field" placeholder="e.g. Python Course Pitch" />
              </div>
              <div>
                <label className="label">Platform</label>
                <select value={editing.platform}
                  onChange={e => setEditing(p => ({ ...p, platform: e.target.value }))}
                  className="input-field">
                  <option value="whatsapp">WhatsApp</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Message Content</label>
              <textarea rows={14} value={editing.content}
                onChange={e => setEditing(p => ({ ...p, content: e.target.value }))}
                className="input-field resize-none font-mono text-sm"
                placeholder="Write your message here. Use {name}, {college} as placeholders..." />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                <Save size={15} /> {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Preview: {preview.name}</h2>
              <button onClick={() => setPreview(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-3">Showing with sample data: Rahul Sharma / RTMNU Nagpur / Data Analytics</p>
            <div className={`rounded-xl p-4 whitespace-pre-line text-sm leading-relaxed ${
              preview.platform === 'whatsapp'
                ? 'bg-green-950/50 border border-green-800/30 text-green-100'
                : preview.platform === 'instagram'
                ? 'bg-pink-950/50 border border-pink-800/30 text-pink-100'
                : 'bg-blue-950/50 border border-blue-800/30 text-blue-100'
            }`}>
              {previewContent(preview.content)}
            </div>
            <button onClick={() => setPreview(null)} className="btn-ghost mt-4 w-full justify-center">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
