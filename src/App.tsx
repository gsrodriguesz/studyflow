import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Focus from './pages/Focus'
import Notes from './pages/Notes'
import Planning from './pages/Planning'
import Progress from './pages/Progress'
import Simulations from './pages/Simulations'
import ExamCalendar from './pages/ExamCalendar'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/planning" element={<Planning />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/simulations" element={<Simulations />} />
          <Route path="/calendar" element={<ExamCalendar />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
