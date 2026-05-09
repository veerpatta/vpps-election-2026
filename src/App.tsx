import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AdminShell } from './components/layout/AdminShell'
import { AuthProvider } from './context/AuthContext'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { CandidateManagementPage } from './pages/admin/CandidateManagementPage'
import { DashboardPage } from './pages/admin/DashboardPage'
import { ResultsPage } from './pages/admin/ResultsPage'
import { VoterManagementPage } from './pages/admin/VoterManagementPage'
import { VotingControlPage } from './pages/admin/VotingControlPage'
import { VotePage } from './pages/voter/VotePage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/vote" replace />} />
        <Route path="/vote" element={<VotePage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminShell />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/candidates" element={<CandidateManagementPage />} />
          <Route path="/admin/voters" element={<VoterManagementPage />} />
          <Route path="/admin/control" element={<VotingControlPage />} />
          <Route path="/admin/results" element={<ResultsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/vote" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
