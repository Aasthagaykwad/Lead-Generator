import { useState, useEffect, useCallback } from 'react'
import { Users, UserCheck, TrendingUp, PhoneCall, Star, RefreshCw } from 'lucide-react'
import { getStats, getLeads } from '../api/api'
import StatsCard from '../components/StatsCard'
import StatusBadge from '../components/StatusBadge'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#a855f7', '#ef4444']

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [recent, setRecent]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sr, lr] = await Promise.all([getStats(), getLeads({ status: 'all' })])
      setStats(sr.data)
      setRecent(lr.data.leads.slice(0, 6))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const chartData = stats ? [
    { name: 'New',         value: stats.new,            fill: COLORS[0] },
    { name: 'Contacted',   value: stats.contacted,      fill: COLORS[2] },
    { name: 'Interested',  value: stats.interested,     fill: COLORS[1] },
    { name: 'Converted',   value: stats.converted,      fill: COLORS[3] },
    { name: 'Not Int.',    value: stats.not_interested, fill: COLORS[4] },
  ] : []

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Overview of your Nagpur student leads</p>
        </div>
        <button onClick={load} className="btn-ghost" disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          <StatsCard label="Total Leads"    value={stats.total}        icon={Users}     color="brand"  />
          <StatsCard label="Interested"     value={stats.interested}   icon={Star}      color="green"  />
          <StatsCard label="Contacted"      value={stats.contacted}    icon={PhoneCall} color="yellow" />
          <StatsCard label="New Leads"      value={stats.new}          icon={TrendingUp} color="blue"  />
          <StatsCard label="Converted"      value={stats.converted}    icon={UserCheck} color="purple" />
          <StatsCard
            label="Conversion Rate"
            value={stats.total ? `${Math.round((stats.converted / stats.total) * 100)}%` : '0%'}
            icon={TrendingUp}
            color="pink"
            sub="Enrolled / Total"
          />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="glass-card p-5">
          <h2 className="section-title mb-4">Lead Status Breakdown</h2>
          {stats && stats.total > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={32}>
                <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '10px', color: '#e0e7ff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-gray-500 text-sm">No leads yet. Go to <strong className="text-brand-400">Find Leads</strong> to start!</p>
            </div>
          )}
        </div>

        {/* Recent Leads */}
        <div className="glass-card p-5">
          <h2 className="section-title mb-4">Recent Leads</h2>
          {recent.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500 text-sm">No leads yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map(lead => (
                <div key={lead.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600
                                  flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(lead.name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                    <p className="text-xs text-gray-500 truncate">{lead.college || 'Nagpur'}</p>
                  </div>
                  <StatusBadge status={lead.status} small />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick tips */}
      <div className="glass-card p-5">
        <h2 className="section-title mb-3">💡 Quick Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { icon: '🔍', title: 'Find Leads', text: 'Use "Find Leads" to auto-search Google, Internshala & Nagpur college websites.' },
            { icon: '📱', title: 'WhatsApp & LinkedIn', text: 'Click the green/blue buttons on any lead to send a pre-filled message instantly.' },
            { icon: '⭐', title: 'Smart Filter', text: 'Only leads scoring 15+ are shown. Higher scores = more likely interested students.' },
          ].map(tip => (
            <div key={tip.title} className="bg-white/5 rounded-xl p-4">
              <p className="text-xl mb-2">{tip.icon}</p>
              <p className="font-semibold text-white text-sm mb-1">{tip.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
