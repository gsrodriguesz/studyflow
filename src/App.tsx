import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import Notes from './pages/Notes'
import Planning from './pages/Planning'
import Progress from './pages/Progress'
import Simulations from './pages/Simulations'
import ExamCalendar from './pages/ExamCalendar'
import Settings from './pages/Settings'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { FocusProvider } from './context/FocusContext'

function App() {
  return (
    <BrowserRouter>
      <FocusProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/simulations" element={<Simulations />} />
            <Route path="/calendar" element={<ExamCalendar />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FocusProvider>
    </BrowserRouter>
  )
}

export default App
