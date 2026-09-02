import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'
const api = axios.create({ baseURL })

// ─── Leads ────────────────────────────────────────────────────
export const getLeads    = (params) => api.get('/leads', { params })
export const createLead  = (data)   => api.post('/leads', data)
export const updateLead  = (id, d)  => api.put(`/leads/${id}`, d)
export const setStatus   = (id, s)  => api.put(`/leads/${id}/status`, { status: s })
export const deleteLead  = (id)     => api.delete(`/leads/${id}`)
export const deleteAll   = ()       => api.delete('/leads')
export const getStats    = ()       => api.get('/stats')

// ─── Search ───────────────────────────────────────────────────
export const startSearch    = (data) => api.post('/search-leads', data)
export const getSearchStatus = ()    => api.get('/search-status')

// ─── Messages ─────────────────────────────────────────────────
export const sendMessage = (data) => api.post('/send-message', data)

// ─── Templates ────────────────────────────────────────────────
export const getTemplates    = ()          => api.get('/templates')
export const createTemplate  = (data)      => api.post('/templates', data)
export const updateTemplate  = (id, data)  => api.put(`/templates/${id}`, data)
export const deleteTemplate  = (id)        => api.delete(`/templates/${id}`)
