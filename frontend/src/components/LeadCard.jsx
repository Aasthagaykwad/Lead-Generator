import { useState } from 'react'
import { GraduationCap, Phone, Mail, Linkedin, Instagram, MapPin, Trash2, Edit3, ChevronDown } from 'lucide-react'
import StatusBadge from './StatusBadge'
import clsx from 'clsx'

const STATUS_CYCLE = ['new', 'contacted', 'interested', 'converted', 'not_interested']

const scoreColor = (s) => {
  if (s >= 60) return 'bg-green-500'
  if (s >= 40) return 'bg-yellow-500'
  if (s >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

export default function LeadCard({ lead, onDelete, onStatusChange, onSendMessage, onEdit }) {
  const [expanded, setExpanded] = useState(false)

  const cycleStatus = () => {
    const idx = STATUS_CYCLE.indexOf(lead.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    onStatusChange(lead.id, next)
  }

  const score = Math.min(lead.score || 0, 100)

  return (
    <div className="glass-card p-4 hover:border-brand-500/30 transition-all duration-200 animate-fade-in">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600
                          flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(lead.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{lead.name}</p>
            {lead.college && (
              <p className="text-xs text-gray-400 flex items-center gap-1 truncate mt-0.5">
                <GraduationCap size={11} /> {lead.college}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <StatusBadge status={lead.status} onClick={cycleStatus} small />
              {lead.source && (
                <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-full">
                  {lead.source}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-gray-400">Score</span>
          <span className={clsx(
            'text-xs font-bold px-2 py-0.5 rounded-full',
            score >= 60 ? 'bg-green-500/20 text-green-300' :
            score >= 40 ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-orange-500/20 text-orange-300'
          )}>{score}</span>
          <div className="w-12 score-bar">
            <div className={`score-fill ${scoreColor(score)}`} style={{ width: `${Math.min(score, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Contact row */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {lead.phone && (
          <span className="flex items-center gap-1 text-xs text-gray-300">
            <Phone size={11} className="text-green-400" /> {lead.phone}
          </span>
        )}
        {lead.email && (
          <span className="flex items-center gap-1 text-xs text-gray-300 truncate max-w-[160px]">
            <Mail size={11} className="text-blue-400" /> {lead.email}
          </span>
        )}
        {lead.linkedin_url && (
          <a href={lead.linkedin_url} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
            <Linkedin size={11} /> LinkedIn
          </a>
        )}
        {lead.instagram_url && (
          <a href={lead.instagram_url.startsWith('http') ? lead.instagram_url : `https://instagram.com/${lead.instagram_url.replace('@', '')}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-xs text-pink-400 hover:underline">
            <Instagram size={11} /> Instagram
          </a>
        )}
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={11} /> {lead.location || 'Nagpur'}
        </span>
      </div>

      {/* Notes expand */}
      {lead.notes && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors"
        >
          <ChevronDown size={12} className={clsx('transition-transform', expanded && 'rotate-180')} />
          {expanded ? 'Hide' : 'Show'} notes
        </button>
      )}
      {expanded && lead.notes && (
        <p className="mt-2 text-xs text-gray-400 bg-white/5 rounded-lg p-2 leading-relaxed">
          {lead.notes}
        </p>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {lead.phone && (
          <button
            onClick={() => onSendMessage(lead, 'whatsapp')}
            className="btn-whatsapp text-xs py-1.5 px-3"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </button>
        )}
        <button
          onClick={() => onSendMessage(lead, 'linkedin')}
          className="btn-linkedin text-xs py-1.5 px-3"
        >
          <Linkedin size={13} /> LinkedIn
        </button>
        {lead.instagram_url && (
          <button
            onClick={() => onSendMessage(lead, 'instagram')}
            className="text-xs py-1.5 px-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium shadow-lg shadow-pink-500/20 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Instagram size={13} /> Instagram DM
          </button>
        )}
        <button onClick={() => onEdit(lead)} className="btn-ghost text-xs py-1.5 px-3">
          <Edit3 size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(lead.id)}
          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1.5 rounded-xl transition-all flex items-center gap-1"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
