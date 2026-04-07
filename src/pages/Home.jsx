export default function Home() {
  return (
    <div className="min-h-screen bg-mac-bg">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-mac-text mb-4">Welcome to ContentHub</h1>
        <p className="text-xl text-mac-secondary mb-8">Your platform for tutorials, tools, and community</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-mac-card rounded-mac shadow-mac p-6 hover:shadow-mac-hover transition">
            <h3 className="text-xl font-semibold mb-2">Tutorials</h3>
            <p className="text-mac-secondary">Learn from comprehensive guides</p>
          </div>
          <div className="bg-mac-card rounded-mac shadow-mac p-6 hover:shadow-mac-hover transition">
            <h3 className="text-xl font-semibold mb-2">Tools</h3>
            <p className="text-mac-secondary">Discover useful resources</p>
          </div>
          <div className="bg-mac-card rounded-mac shadow-mac p-6 hover:shadow-mac-hover transition">
            <h3 className="text-xl font-semibold mb-2">Forum</h3>
            <p className="text-mac-secondary">Connect with the community</p>
          </div>
        </div>
      </div>
    </div>
  )
}
