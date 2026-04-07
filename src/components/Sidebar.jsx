import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="w-64 bg-mac-sidebar border-r border-mac-border h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <Link to="/" className="text-2xl font-semibold text-mac-text">ContentHub</Link>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        <Link to="/" className="block px-4 py-2 rounded-lg text-mac-text hover:bg-mac-card transition">Home</Link>
        <Link to="/tutorials" className="block px-4 py-2 rounded-lg text-mac-text hover:bg-mac-card transition">Tutorials</Link>
        <Link to="/tools" className="block px-4 py-2 rounded-lg text-mac-text hover:bg-mac-card transition">Tools</Link>
        <Link to="/forum" className="block px-4 py-2 rounded-lg text-mac-text hover:bg-mac-card transition">Forum</Link>
      </nav>
      <div className="p-4 border-t border-mac-border">
        {user ? (
          <button onClick={signOut} className="w-full px-4 py-2 bg-mac-blue text-white rounded-lg text-sm">
            Sign Out
          </button>
        ) : (
          <Link to="/auth" className="block text-center px-4 py-2 bg-mac-blue text-white rounded-lg text-sm">
            Sign In
          </Link>
        )}
      </div>
    </aside>
  )
}
