import clsx from 'clsx'

const STATUS_MAP = {
  new:            { label: 'New',            cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30'   },
  contacted:      { label: 'Contacted',      cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  interested:     { label: 'Interested',     cls: 'bg-green-500/20 text-green-300 border-green-500/30'  },
  converted:      { label: 'Converted ✓',   cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30'},
  not_interested: { label: 'Not Interested', cls: 'bg-red-500/20 text-red-300 border-red-500/30'     },
}

export default function StatusBadge({ status, onClick, small = false }) {
  const { label, cls } = STATUS_MAP[status] || STATUS_MAP.new
  return (
    <span
      onClick={onClick}
      className={clsx(
        'border rounded-full font-medium cursor-pointer transition-all',
        small ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        cls,
        onClick && 'hover:opacity-80'
      )}
    >
      {label}
    </span>
  )
}
