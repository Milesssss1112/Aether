import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Tutorials from './pages/Tutorials'
import Tools from './pages/Tools'
import Forum from './pages/Forum'
import Auth from './components/Auth'
import MidjourneyTutorial from './pages/MidjourneyTutorial'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  return user ? children : <Navigate to="/auth" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Sidebar />
        <div className="ml-64">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/tutorials/midjourney" element={<MidjourneyTutorial />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
