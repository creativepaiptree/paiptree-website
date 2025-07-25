import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';

export default function StableImagePage() {
  return (
    <div className="min-h-screen bg-stability-dark text-white overflow-x-hidden">
      <ParticleBackground />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm text-gray-300">Image Generation</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="gradient-text">Stable Image</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
                Generate stunning, high-quality images from text descriptions with our state-of-the-art 
                diffusion models. From photorealistic portraits to abstract art, bring your imagination to life.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300">
                  Try Stable Image
                </button>
                <button className="btn-secondary px-8 py-4 text-lg">
                  View API Docs
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎨',
                  title: 'Text-to-Image',
                  description: 'Transform detailed text prompts into stunning visual artwork with unprecedented quality and creativity.',
                  gradient: 'from-stability-purple to-stability-pink'
                },
                {
                  icon: '🖼️',
                  title: 'Image-to-Image',
                  description: 'Modify existing images with text guidance, perfect for editing, style transfer, and creative variations.',
                  gradient: 'from-blue-600 to-purple-600'
                },
                {
                  icon: '🔍',
                  title: 'Upscaling',
                  description: 'Enhance image resolution up to 4x while maintaining quality and adding fine details.',
                  gradient: 'from-green-600 to-blue-600'
                },
                {
                  icon: '🎭',
                  title: 'Style Control',
                  description: 'Fine-tune artistic styles, from photorealistic to abstract, with advanced parameter controls.',
                  gradient: 'from-orange-600 to-red-600'
                },
                {
                  icon: '⚡',
                  title: 'Fast Generation',
                  description: 'Generate high-quality images in seconds with our optimized inference infrastructure.',
                  gradient: 'from-yellow-600 to-orange-600'
                },
                {
                  icon: '🔒',
                  title: 'Commercial Use',
                  description: 'Full commercial licensing included. Use generated images in your projects without restrictions.',
                  gradient: 'from-teal-600 to-green-600'
                }
              ].map((feature, index) => (
                <div key={index} className="glass-card hover:bg-white/10 transition-all duration-300 group">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Model Specifications */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8">
                  Technical <span className="gradient-text">Specifications</span>
                </h2>
                
                <div className="space-y-6">
                  <div className="glass-card">
                    <h3 className="text-lg font-semibold mb-2">Resolution Support</h3>
                    <p className="text-gray-400">Generate images up to 1024x1024 pixels with options for custom aspect ratios</p>
                  </div>
                  
                  <div className="glass-card">
                    <h3 className="text-lg font-semibold mb-2">Model Architecture</h3>
                    <p className="text-gray-400">Based on advanced diffusion models with 2.3B parameters for superior quality</p>
                  </div>
                  
                  <div className="glass-card">
                    <h3 className="text-lg font-semibold mb-2">Inference Speed</h3>
                    <p className="text-gray-400">Average generation time of 2-4 seconds per image with our optimized pipeline</p>
                  </div>
                  
                  <div className="glass-card">
                    <h3 className="text-lg font-semibold mb-2">Safety Features</h3>
                    <p className="text-gray-400">Built-in content filtering and safety measures to ensure responsible AI usage</p>
                  </div>
                </div>
              </div>
              
              <div className="glass-card">
                <h3 className="text-xl font-semibold mb-6">API Example</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400">
{`curl -X POST "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "text_prompts": [
      {
        "text": "A majestic mountain landscape at sunset, photorealistic, 4k"
      }
    ],
    "cfg_scale": 7,
    "height": 1024,
    "width": 1024,
    "samples": 1,
    "steps": 30
  }'`}
                  </pre>
                </div>
                <button className="mt-4 text-purple-400 hover:text-purple-300 text-sm">
                  Copy to clipboard
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">
              Simple <span className="gradient-text">Pricing</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card text-center">
                <h3 className="text-xl font-semibold mb-4">Free Tier</h3>
                <div className="text-3xl font-bold gradient-text mb-4">$0</div>
                <p className="text-gray-400 mb-6">25 images per month</p>
                <ul className="text-sm text-gray-400 space-y-2 mb-6">
                  <li>✓ 512x512 resolution</li>
                  <li>✓ Basic features</li>
                  <li>✓ Community support</li>
                </ul>
                <button className="w-full border border-gray-600 text-white py-2 rounded-lg hover:border-gray-400 transition-colors">
                  Get Started
                </button>
              </div>
              
              <div className="glass-card text-center border-purple-500/50">
                <h3 className="text-xl font-semibold mb-4">Pro</h3>
                <div className="text-3xl font-bold gradient-text mb-4">$20</div>
                <p className="text-gray-400 mb-6">1,000 images per month</p>
                <ul className="text-sm text-gray-400 space-y-2 mb-6">
                  <li>✓ Up to 1024x1024 resolution</li>
                  <li>✓ All features included</li>
                  <li>✓ Priority support</li>
                  <li>✓ Commercial license</li>
                </ul>
                <button className="btn-primary w-full py-2">
                  Choose Pro
                </button>
              </div>
              
              <div className="glass-card text-center">
                <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
                <div className="text-3xl font-bold gradient-text mb-4">Custom</div>
                <p className="text-gray-400 mb-6">Unlimited usage</p>
                <ul className="text-sm text-gray-400 space-y-2 mb-6">
                  <li>✓ Custom resolutions</li>
                  <li>✓ Dedicated support</li>
                  <li>✓ SLA guarantees</li>
                  <li>✓ Custom integrations</li>
                </ul>
                <button className="w-full border border-gray-600 text-white py-2 rounded-lg hover:border-gray-400 transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}