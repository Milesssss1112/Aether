import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Tools() {
  const [tools, setTools] = useState([])

  useEffect(() => {
    supabase.from('tools').select('*').then(({ data }) => setTools(data || []))
  }, [])

  return (
    <div className="min-h-screen bg-mac-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-mac-text mb-6">Tool Directory</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {tools.map(t => (
            <div key={t.id} className="bg-mac-card rounded-mac shadow-mac p-6">
              <h3 className="text-lg font-semibold mb-2">{t.name}</h3>
              <p className="text-mac-secondary text-sm">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
