import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { useTranslation } from '@/hooks/useTranslation';

export default function ServicesPage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      <ParticleBackground />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-8">
                <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mr-2 animate-pulse"></span>
                <span className="body-sm">AI Solutions</span>
              </div>
              
              <h1 className="heading-xl mb-8">
                <span className="gradient-text">AI Solutions</span> for Enterprise
              </h1>
              
              <p className="body-lg mb-12 max-w-4xl mx-auto">
                Transform your business with Paiptree's comprehensive AI platform. 
                From image generation to custom enterprise solutions, we provide the tools you need to innovate.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="btn-primary">
                  Explore Services
                </button>
                <button className="btn-secondary">
                  View API Docs
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Service Overview */}
        <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-6">
                Integrated AI <span className="gradient-text">Ecosystem</span>
              </h2>
              <p className="body-lg max-w-3xl mx-auto">
                From creative tools to enterprise infrastructure, our AI services work together 
                to deliver comprehensive solutions for every business need.
              </p>
            </div>
          </div>
        </section>

        {/* Main Services */}
        <section className="section-padding">
          <div className="container-max">
            <h2 className="heading-lg text-center mb-16">
              Our <span className="gradient-text">Services</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Stable Image Service */}
              <div className="glass-card group">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🎨</span>
                </div>
                <h3 className="heading-sm mb-4">Stable Image</h3>
                <p className="body-md mb-6">
                  Generate stunning, high-quality images from text descriptions with our state-of-the-art 
                  diffusion models. Perfect for creative professionals and businesses.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Text-to-Image Generation
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Image-to-Image Editing
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Commercial Licensing
                  </div>
                </div>
                <button className="btn-secondary w-full">
                  Learn More
                </button>
              </div>

              {/* API Platform */}
              <div className="glass-card group">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="heading-sm mb-4">API Platform</h3>
                <p className="body-md mb-6">
                  Powerful and flexible AI APIs for developers. Integrate our models into your applications 
                  with simple REST APIs and comprehensive documentation.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    RESTful APIs
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    SDKs & Libraries
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    24/7 Support
                  </div>
                </div>
                <button className="btn-secondary w-full">
                  View API Docs
                </button>
              </div>

              {/* Enterprise Solutions */}
              <div className="glass-card group">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🏢</span>
                </div>
                <h3 className="heading-sm mb-4">Enterprise Solutions</h3>
                <p className="body-md mb-6">
                  Custom AI solutions tailored for large-scale enterprises. On-premise deployment, 
                  custom training, and dedicated support for mission-critical applications.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Custom Model Training
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    On-premise Deployment
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    SLA Guarantees
                  </div>
                </div>
                <button className="btn-secondary w-full">
                  Contact Sales
                </button>
              </div>

              {/* Developer Tools */}
              <div className="glass-card group">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">🛠️</span>
                </div>
                <h3 className="heading-sm mb-4">Developer Tools</h3>
                <p className="body-md mb-6">
                  Professional tools for AI model development, fine-tuning, and deployment. 
                  Everything you need to build and scale AI applications.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Model Fine-tuning
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Deployment Pipeline
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                    Monitoring & Analytics
                  </div>
                </div>
                <button className="btn-secondary w-full">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-6">
                Built on <span className="gradient-text">Cutting-Edge</span> Technology
              </h2>
              <p className="body-lg max-w-3xl mx-auto">
                Our AI services are powered by the latest advances in machine learning, 
                deployed on enterprise-grade infrastructure for reliability and scale.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {['PyTorch', 'CUDA', 'Kubernetes', 'AWS', 'Docker', 'TensorRT', 'Redis', 'PostgreSQL'].map((tech, index) => (
                <div key={index} className="glass-card text-center group hover:bg-white/10">
                  <div className="text-2xl mb-2">⚙️</div>
                  <div className="body-sm font-medium">{tech}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Documentation Preview */}
        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="heading-lg mb-8">
                  Developer-First <span className="gradient-text">API</span>
                </h2>
                <p className="body-lg mb-8">
                  Get started in minutes with our intuitive APIs. Comprehensive documentation, 
                  code examples, and SDKs in multiple languages.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black text-sm">✓</span>
                    </span>
                    <span>RESTful API with JSON responses</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black text-sm">✓</span>
                    </span>
                    <span>SDKs for Python, JavaScript, and more</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black text-sm">✓</span>
                    </span>
                    <span>Comprehensive documentation</span>
                  </div>
                </div>
                <button className="btn-primary">
                  View Documentation
                </button>
              </div>
              
              <div className="glass-card">
                <h3 className="heading-sm mb-6">API Example</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400">
{`curl -X POST "https://api.paiptree.com/v1/generate" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "prompt": "A futuristic city at sunset",
    "width": 1024,
    "height": 1024,
    "steps": 30,
    "guidance_scale": 7.5
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
        <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-6">
                Simple <span className="gradient-text">Pricing</span>
              </h2>
              <p className="body-lg">Choose the plan that fits your needs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="glass-card text-center">
                <h3 className="heading-sm mb-4">Starter</h3>
                <div className="text-4xl font-bold gradient-text mb-4">Free</div>
                <p className="body-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Perfect for trying out our services</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center justify-center">
                    <span className="w-4 h-4 text-green-400 mr-3">✓</span>
                    <span className="body-sm">100 API calls/month</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-4 h-4 text-green-400 mr-3">✓</span>
                    <span className="body-sm">Basic support</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-4 h-4 text-green-400 mr-3">✓</span>
                    <span className="body-sm">Community access</span>
                  </li>
                </ul>
                <button className="btn-secondary w-full">
                  Get Started
                </button>
              </div>
              
              <div className="glass-card text-center" style={{ borderColor: 'var(--accent-from)' }}>
                <h3 className="heading-sm mb-4">Professional</h3>
                <div className="text-4xl font-bold gradient-text mb-4">$49</div>
                <p className="body-sm mb-6" style={{ color: 'var(--text-secondary)' }}>For growing businesses</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center justify-center">
                    <span className="w-4 h-4 text-green-400 mr-3">✓</span>
                    <span className="body-sm">10,000 API calls/month</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-4 h-4 text-green-400 mr-3">✓</span>
                    <span className="body-sm">Priority support</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-4 h-4 text-green-400 mr-3">✓</span>
                    <span className="body-sm">Advanced features</span>
                  </li>
                </ul>
                <button className="btn-primary w-full">
                  Choose Pro
                </button>
              </div>
              
              <div className="glass-card text-center">
                <h3 className="heading-sm mb-4">Enterprise</h3>
                <div className="text-4xl font-bold gradient-text mb-4">Custom</div>
                <p className="body-sm mb-6" style={{ color: 'var(--text-secondary)' }}>For large organizations</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center justify-center">
                    <span className="w-4 h-4 text-green-400 mr-3">✓</span>
                    <span className="body-sm">Unlimited API calls</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-4 h-4 text-green-400 mr-3">✓</span>
                    <span className="body-sm">Dedicated support</span>
                  </li>
                  <li className="flex items-center justify-center">
                    <span className="w-4 h-4 text-green-400 mr-3">✓</span>
                    <span className="body-sm">Custom solutions</span>
                  </li>
                </ul>
                <button className="btn-secondary w-full">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center">
              <h2 className="heading-lg mb-6">
                Ready to <span className="gradient-text">Get Started</span>?
              </h2>
              <p className="body-lg mb-12 max-w-2xl mx-auto">
                Join thousands of developers and businesses already using Paiptree's AI services 
                to transform their applications and workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary">
                  Start Building
                </button>
                <button className="btn-secondary">
                  Schedule Demo
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