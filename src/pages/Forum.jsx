import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Forum() {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    supabase.from('posts').select('*').order('created_at', { ascending: false }).then(({ data }) => setPosts(data || []))
  }, [])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!user) return
    await supabase.from('posts').insert({ content, user_id: user.id })
    setContent('')
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
  }

  return (
    <div className="min-h-screen bg-mac-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-mac-text mb-6">Forum</h1>
        {user && (
          <form onSubmit={handlePost} className="bg-mac-card rounded-mac shadow-mac p-6 mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 rounded-lg border border-mac-border focus:outline-none focus:ring-2 focus:ring-mac-blue"
              rows="3"
            />
            <button className="mt-3 px-6 py-2 bg-mac-blue text-white rounded-lg">Post</button>
          </form>
        )}
        <div className="space-y-4">
          {posts.map(p => (
            <div key={p.id} className="bg-mac-card rounded-mac shadow-mac p-6">
              <p className="text-mac-text">{p.content}</p>
              <p className="text-sm text-mac-secondary mt-2">{new Date(p.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
