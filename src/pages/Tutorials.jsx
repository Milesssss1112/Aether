import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Tutorials() {
  const [tutorials, setTutorials] = useState([])

  useEffect(() => {
    supabase.from('tutorials').select('*').then(({ data }) => setTutorials(data || []))
  }, [])

  return (
    <div className="min-h-screen bg-mac-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-mac-text mb-6">Tutorials</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/tutorials/midjourney" className="bg-mac-card rounded-mac shadow-mac p-6 hover:shadow-mac-hover transition">
            <h3 className="text-xl font-semibold mb-2 text-mac-text">Midjourney Image Generation</h3>
            <p className="text-mac-secondary">Learn how to create high-quality AI images with step-by-step instructions</p>
          </Link>
          {tutorials.map(t => (
            <div key={t.id} className="bg-mac-card rounded-mac shadow-mac p-6">
              <h3 className="text-xl font-semibold mb-2 text-mac-text">{t.title}</h3>
              <p className="text-mac-secondary">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
