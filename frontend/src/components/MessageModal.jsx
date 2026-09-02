import { useState, useEffect } from 'react'
import { X, Send, MessageSquare, Linkedin, Instagram } from 'lucide-react'
import { getTemplates, sendMessage } from '../api/api'
import toast from 'react-hot-toast'

export default function MessageModal({ lead, platform, onClose }) {
  const [templates, setTemplates] = useState([])
  const [selectedTpl, setSelectedTpl] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Load templates filtered by platform
  useEffect(() => {
    getTemplates().then(r => {
      const tpls = r.data.templates.filter(t => t.platform === platform)
      setTemplates(tpls)
      if (tpls.length > 0) {
        setSelectedTpl(tpls[0])
        setMessage(tpls[0].content)
      }
    }).catch(() => {})
  }, [platform])

  const applyTemplate = (tpl) => {
    setSelectedTpl(tpl)
    // Quick personalisation preview
    let msg = tpl.content
    msg = msg.replace(/{name}/g, lead.name || 'Friend')
    msg = msg.replace(/{college}/g, lead.college || 'your college')
    msg = msg.replace(/{course}/g, lead.course_interest || 'IT courses')
    setMessage(msg)
  }

  const handleSend = async () => {
    setSending(true)
    try {
      const res = await sendMessage({ lead_id: lead.id, platform, message })
      const url = res.data.url
      if (url) {
        window.open(url, '_blank')
        toast.success(`${platform === 'whatsapp' ? 'WhatsApp' : 'LinkedIn'} opened! Send the message there.`)
      }
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to open message')
    } finally {
      setSending(false)
    }
  }

  const platformLabel = platform === 'whatsapp' ? 'WhatsApp' : platform === 'instagram' ? 'Instagram' : 'LinkedIn'
  const PlatformIcon = platform === 'whatsapp' ? null : platform === 'instagram' ? Instagram : Linkedin

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-lg glow animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            {platform === 'whatsapp' ? (
              <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-400">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
            ) : platform === 'instagram' ? (
              <div className="w-8 h-8 rounded-lg bg-pink-600/20 flex items-center justify-center">
                <Instagram size={16} className="text-pink-400" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Linkedin size={16} className="text-blue-400" />
              </div>
            )}
            <div>
              <p className="font-semibold text-white text-sm">Send via {platformLabel}</p>
              <p className="text-xs text-gray-400">To: {lead.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Template picker */}
          {templates.length > 0 && (
            <div>
              <label className="label">Message Template</label>
              <div className="flex gap-2 flex-wrap">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      selectedTpl?.id === t.id
                        ? 'bg-brand-600/30 border-brand-500/50 text-brand-300'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message editor */}
          <div>
            <label className="label">Message Preview & Edit</label>
            <textarea
              rows={10}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="input-field resize-none font-mono text-xs leading-relaxed"
              placeholder="Type your message here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {'{name}'}, {'{college}'}, {'{course}'} are replaced automatically.
            </p>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className={platform === 'whatsapp' ? 'btn-whatsapp w-full justify-center' : platform === 'instagram' ? 'btn-instagram w-full justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium shadow-lg shadow-pink-500/20 px-4 py-2 rounded-xl transition-all flex items-center gap-2' : 'btn-linkedin w-full justify-center'}
          >
            <Send size={15} />
            {sending ? 'Opening...' : `Open ${platformLabel} & Send`}
          </button>

          <p className="text-xs text-gray-500 text-center">
            This will open {platformLabel} in a new tab. Click Send there to deliver the message.
          </p>
        </div>
      </div>
    </div>
  )
}
