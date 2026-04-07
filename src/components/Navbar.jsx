import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="bg-mac-card border-b border-mac-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-mac-text">ContentHub</Link>
        <div className="flex gap-6 items-center">
          <Link to="/tutorials" className="text-mac-text hover:text-mac-blue">Tutorials</Link>
          <Link to="/tools" className="text-mac-text hover:text-mac-blue">Tools</Link>
          <Link to="/forum" className="text-mac-text hover:text-mac-blue">Forum</Link>
          {user ? (
            <button onClick={signOut} className="px-4 py-2 bg-mac-blue text-white rounded-lg text-sm">
              Sign Out
            </button>
          ) : (
            <Link to="/auth" className="px-4 py-2 bg-mac-blue text-white rounded-lg text-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
