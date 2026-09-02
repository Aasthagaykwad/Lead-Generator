import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard   from './pages/Dashboard'
import LeadSearch  from './pages/LeadSearch'
import LeadsList   from './pages/LeadsList'
import AddLead     from './pages/AddLead'
import Templates   from './pages/Templates'

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/"           element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"  element={<Dashboard />} />
          <Route path="/search"     element={<LeadSearch />} />
          <Route path="/leads"      element={<LeadsList />} />
          <Route path="/add"        element={<AddLead />} />
          <Route path="/templates"  element={<Templates />} />
        </Routes>
      </main>
    </div>
  )
}
