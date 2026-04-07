import { Link } from 'react-router-dom'

export default function MidjourneyTutorial() {
  return (
    <div className="min-h-screen bg-mac-bg">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/tutorials" className="text-mac-blue text-sm mb-4 inline-block">← Back to Tutorials</Link>

        <h1 className="text-4xl font-bold text-mac-text mb-4">Generating High-Quality Images with Midjourney</h1>
        <p className="text-mac-secondary mb-8">A beginner's guide to creating stunning AI-generated artwork</p>

        <div className="bg-mac-card rounded-mac shadow-mac p-8 mb-6">
          <h2 className="text-2xl font-semibold text-mac-text mb-4">Getting Started</h2>
          <div className="space-y-4 text-mac-text">
            <div>
              <h3 className="font-semibold text-lg mb-2">Step 1: Join Midjourney</h3>
              <p className="text-mac-secondary">Visit midjourney.com and sign up. You'll need a Discord account to use Midjourney.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Step 2: Access the Bot</h3>
              <p className="text-mac-secondary">Join the Midjourney Discord server or add the bot to your own server. Use the /imagine command to start.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Step 3: Write Your First Prompt</h3>
              <p className="text-mac-secondary">Type <code className="bg-mac-bg px-2 py-1 rounded">/imagine prompt: your description here</code></p>
            </div>
          </div>
        </div>

        <div className="bg-mac-card rounded-mac shadow-mac p-8 mb-6">
          <h2 className="text-2xl font-semibold text-mac-text mb-4">Crafting Effective Prompts</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-mac-text mb-2">Basic Structure</h3>
              <p className="text-mac-secondary mb-3">Subject + Style + Details + Parameters</p>
              <div className="bg-mac-bg p-4 rounded-lg">
                <p className="text-mac-blue font-mono text-sm">a majestic lion, digital art, golden hour lighting, highly detailed --ar 16:9 --v 6</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-mac-text mb-2">Prompt Examples</h3>
              <div className="space-y-3">
                <div className="bg-mac-bg p-3 rounded-lg">
                  <p className="text-mac-secondary text-sm mb-1">Portrait Photography:</p>
                  <p className="text-mac-blue font-mono text-sm">portrait of a woman, natural lighting, 85mm lens, shallow depth of field --ar 2:3</p>
                </div>
                <div className="bg-mac-bg p-3 rounded-lg">
                  <p className="text-mac-secondary text-sm mb-1">Landscape:</p>
                  <p className="text-mac-blue font-mono text-sm">mountain landscape at sunset, dramatic clouds, vibrant colors, cinematic --ar 16:9</p>
                </div>
                <div className="bg-mac-bg p-3 rounded-lg">
                  <p className="text-mac-secondary text-sm mb-1">Abstract Art:</p>
                  <p className="text-mac-blue font-mono text-sm">abstract geometric shapes, pastel colors, minimalist design, modern art --ar 1:1</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-mac-card rounded-mac shadow-mac p-8 mb-6">
          <h2 className="text-2xl font-semibold text-mac-text mb-4">Key Parameters</h2>
          <div className="space-y-3 text-mac-text">
            <div className="flex gap-4">
              <code className="bg-mac-bg px-3 py-1 rounded text-mac-blue">--ar</code>
              <p className="text-mac-secondary">Aspect ratio (e.g., --ar 16:9, --ar 1:1)</p>
            </div>
            <div className="flex gap-4">
              <code className="bg-mac-bg px-3 py-1 rounded text-mac-blue">--v 6</code>
              <p className="text-mac-secondary">Version 6 (latest model)</p>
            </div>
            <div className="flex gap-4">
              <code className="bg-mac-bg px-3 py-1 rounded text-mac-blue">--stylize</code>
              <p className="text-mac-secondary">Control artistic interpretation (0-1000)</p>
            </div>
            <div className="flex gap-4">
              <code className="bg-mac-bg px-3 py-1 rounded text-mac-blue">--chaos</code>
              <p className="text-mac-secondary">Variation level (0-100)</p>
            </div>
          </div>
        </div>

        <div className="bg-mac-card rounded-mac shadow-mac p-8">
          <h2 className="text-2xl font-semibold text-mac-text mb-4">Common Pitfalls</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-mac-text mb-2">❌ Vague Descriptions</h3>
              <p className="text-mac-secondary">Avoid: "a nice picture"</p>
              <p className="text-mac-blue">Better: "a serene lake at dawn, mist rising, soft pastel colors"</p>
            </div>
            <div>
              <h3 className="font-semibold text-mac-text mb-2">❌ Too Many Details</h3>
              <p className="text-mac-secondary">Keep prompts focused. Too many conflicting elements confuse the AI.</p>
            </div>
            <div>
              <h3 className="font-semibold text-mac-text mb-2">❌ Ignoring Aspect Ratios</h3>
              <p className="text-mac-secondary">Always specify --ar for your intended use (social media, prints, etc.)</p>
            </div>
            <div>
              <h3 className="font-semibold text-mac-text mb-2">❌ Not Iterating</h3>
              <p className="text-mac-secondary">Use variations (V buttons) and upscaling (U buttons) to refine results.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
