import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-mac-bg flex items-center justify-center p-4">
      <div className="bg-mac-card rounded-mac shadow-mac p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-mac-text mb-6">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-mac-border focus:outline-none focus:ring-2 focus:ring-mac-blue"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-mac-border focus:outline-none focus:ring-2 focus:ring-mac-blue"
            required
          />
          <button className="w-full bg-mac-blue text-white py-3 rounded-lg hover:opacity-90 transition">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="mt-4 text-mac-blue text-sm">
          {isLogin ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
