import { useState } from 'react'
import { UserPlus, CheckCircle, Phone, Mail, Linkedin, GraduationCap, BookOpen, FileText, Instagram } from 'lucide-react'
import { createLead } from '../api/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const COURSES = [
  'Data Analytics', 'Python Programming', 'Java Development',
  'MIM', 'Web Development', 'Machine Learning', 'Full Stack Development',
  'Digital Marketing', 'Business Analytics', 'AI & ML', 'Other',
]

const COLLEGES = [
  '', 'RTMNU Nagpur', 'RCOEM Nagpur', 'YCCE Nagpur', 'VIT Nagpur',
  'G.H. Raisoni Nagpur', 'KDK College Nagpur', 'Priyadarshini Nagpur',
  'Hislop College Nagpur', 'Laxminarayan Institute Nagpur',
  'Datta Meghe Nagpur', 'Shivaji Science College Nagpur', 'Other',
]

const EMPTY = {
  name: '', phone: '', email: '', college: '', course_interest: 'IT Courses',
  linkedin_url: '', instagram_url: '', notes: '', status: 'new',
}

export default function AddLead() {
  const [form, setForm]       = useState({ ...EMPTY })
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate              = useNavigate()

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.phone.trim() && !form.email.trim() && !form.linkedin_url.trim()) {
      toast.error('Please provide at least one contact: phone, email, or LinkedIn')
      return
    }

    setSaving(true)
    try {
      await createLead(form)
      toast.success(`Lead "${form.name}" added successfully!`)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setForm({ ...EMPTY })
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add lead')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, icon: Icon, required = false, children }) => (
    <div>
      <label className="label flex items-center gap-1.5">
        {Icon && <Icon size={13} className="text-brand-400" />}
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-header">Add Lead Manually</h1>
        <p className="text-gray-400 text-sm mt-1">
          Add a student lead you already know — from referral, social media, or event
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form */}
        <div className="xl:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            {/* Name */}
            <Field label="Full Name" icon={UserPlus} required>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                className="input-field" placeholder="e.g. Rahul Sharma" />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <Field label="WhatsApp Number" icon={Phone}>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="input-field" placeholder="9876543210" maxLength={10} />
                <p className="text-xs text-gray-500 mt-1">10-digit Indian mobile number</p>
              </Field>

              {/* Email */}
              <Field label="Email Address" icon={Mail}>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="input-field" placeholder="rahul@gmail.com" />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* College */}
              <Field label="College / Institute" icon={GraduationCap}>
                <select value={form.college} onChange={e => set('college', e.target.value)} className="input-field">
                  {COLLEGES.map(c => <option key={c} value={c}>{c || '— Select College —'}</option>)}
                </select>
              </Field>
            </div>

            {/* LinkedIn & Instagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="LinkedIn Profile URL" icon={Linkedin}>
                <input type="url" value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)}
                  className="input-field" placeholder="https://linkedin.com/in/..." />
              </Field>
              <Field label="Instagram Profile URL / ID" icon={Instagram}>
                <input type="text" value={form.instagram_url} onChange={e => set('instagram_url', e.target.value)}
                  className="input-field" placeholder="https://instagram.com/... or username" />
              </Field>
            </div>

            {/* Notes */}
            <Field label="Notes / Source" icon={FileText}>
              <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
                className="input-field resize-none"
                placeholder="How you found this lead, their interests, where you met them..." />
            </Field>

            {/* Status */}
            <Field label="Initial Status">
              <div className="flex gap-2 flex-wrap">
                {['new','interested','contacted'].map(s => (
                  <label key={s} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm ${
                    form.status === s
                      ? 'bg-brand-600/20 border-brand-500/40 text-brand-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}>
                    <input type="radio" name="status" value={s} checked={form.status === s}
                      onChange={() => set('status', s)} className="hidden" />
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </label>
                ))}
              </div>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={saving}
              className={`btn-primary w-full justify-center py-3 text-base transition-all duration-300 ${
                success ? 'bg-green-600 hover:bg-green-600' : ''
              }`}
            >
              {success ? (
                <><CheckCircle size={18} /> Lead Added!</>
              ) : saving ? (
                'Saving...'
              ) : (
                <><UserPlus size={18} /> Add Lead</>
              )}
            </button>
          </form>
        </div>

        {/* Tips sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-3">💡 Where to find leads?</h3>
            <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
              {[
                { emoji: '📱', text: 'WhatsApp groups of Nagpur college students' },
                { emoji: '👥', text: 'LinkedIn connections from Nagpur colleges' },
                { emoji: '🎓', text: 'College placement drives & campus events' },
                { emoji: '📊', text: 'Internshala & Naukri student profiles' },
                { emoji: '🤝', text: 'Referrals from existing students' },
              ].map(({ emoji, text }) => (
                <div key={text} className="flex gap-2">
                  <span>{emoji}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-5 border-brand-500/20 bg-brand-600/5">
            <h3 className="font-semibold text-white mb-2">🚀 After Adding</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              After adding a lead, go to <strong className="text-brand-300">All Leads</strong> and
              click the <strong className="text-green-400">WhatsApp</strong> or
              <strong className="text-blue-400"> LinkedIn</strong> button to send
              your course pitch message instantly!
            </p>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-2">📋 Our IT Courses</h3>
            <div className="space-y-1">
              {['Data Analytics', 'Python Programming', 'Java Development', 'MIM', 'Web Development', 'Machine Learning'].map(c => (
                <div key={c} className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  {c}
                </div>
              ))}
              <div className="mt-2 text-xs text-green-400 font-medium">✅ Direct Placement Guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
