export default function StatsCard({ label, value, icon: Icon, color, sub }) {
  const colors = {
    blue:   'from-blue-600/20 to-blue-800/10 border-blue-500/20 text-blue-400',
    green:  'from-green-600/20 to-green-800/10 border-green-500/20 text-green-400',
    purple: 'from-purple-600/20 to-purple-800/10 border-purple-500/20 text-purple-400',
    yellow: 'from-yellow-600/20 to-yellow-800/10 border-yellow-500/20 text-yellow-400',
    pink:   'from-pink-600/20 to-pink-800/10 border-pink-500/20 text-pink-400',
    brand:  'from-brand-600/20 to-brand-800/10 border-brand-500/20 text-brand-400',
  }
  const cls = colors[color] || colors.brand
  return (
    <div className={`bg-gradient-to-br ${cls} border rounded-2xl p-5 flex items-start gap-4 transition-all hover:scale-[1.02] duration-200`}>
      <div className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className="opacity-80" />
      </div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}
