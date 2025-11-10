import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import { redirect } from 'next/navigation';

export default function PartnersPage() {
  // Partners 페이지는 About 페이지로 리다이렉트 (파트너 내용이 About에 통합됨)
  redirect('/about');
}
    description: 'Embed our AI models directly into your applications and workflows.',
    icon: '🔧',
    benefits: ['API Access', 'Custom Models', 'Technical Support', 'Co-marketing']
  },
  {
    title: 'Distribution Partnership',
    description: 'Help us reach new audiences and markets with your platform.',
    icon: '🌐',
    benefits: ['Revenue Share', 'Marketing Support', 'Priority Features', 'Joint GTM']
  },
  {
    title: 'Research Collaboration',
    description: 'Work together on cutting-edge AI research and development.',
    icon: '🔬',
    benefits: ['Joint Research', 'Publication Rights', 'Early Access', 'Funding Support']
  },
  {
    title: 'Enterprise Solutions',
    description: 'Custom AI solutions for large-scale enterprise deployments.',
    icon: '🏢',
    benefits: ['Custom Training', 'Dedicated Support', 'SLA Guarantees', 'On-premise Options']
  }
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-stability-dark text-white overflow-x-hidden">
      <ParticleBackground />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                Our <span className="gradient-text">Partners</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
                Paiptree collaborates with leading companies and organizations to democratize AI and 
                bring generative models to creators, developers, and businesses worldwide.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="btn-primary">
                  Become a Partner
                </button>
                <button className="btn-secondary px-8 py-4 text-lg">
                  Partnership Inquiry
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Showcase */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Trusted <span className="gradient-text">Collaborators</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner, index) => (
                <div key={index} className="glass-card hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="text-4xl">{partner.logo}</div>
                    <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full">
                      {partner.partnership}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{partner.name}</h3>
                  <p className="text-purple-400 text-sm mb-4">{partner.category}</p>
                  <p className="text-gray-400 leading-relaxed">{partner.description}</p>
                  
                  <button className="mt-6 text-purple-400 hover:text-purple-300 font-medium group-hover:translate-x-1 transition-all duration-300">
                    Learn more →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Types */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6">
                Partnership <span className="gradient-text">Opportunities</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Explore different ways to collaborate with Paiptree and unlock the potential of generative AI for your business.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {partnershipTypes.map((type, index) => (
                <div key={index} className="glass-card hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center mb-6">
                    <div className="text-3xl mr-4">{type.icon}</div>
                    <h3 className="text-2xl font-bold">{type.title}</h3>
                  </div>
                  
                  <p className="text-gray-400 mb-6 leading-relaxed">{type.description}</p>
                  
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-purple-300">Key Benefits:</h4>
                    <ul className="space-y-2">
                      {type.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-gray-300">
                          <svg className="w-4 h-4 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button className="btn-primary mt-6 w-full py-3">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Success <span className="gradient-text">Stories</span>
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="glass-card">
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">🎨</div>
                  <div>
                    <h3 className="text-xl font-bold">Adobe Creative Cloud</h3>
                    <p className="text-purple-400">Creative Tools Integration</p>
                  </div>
                </div>
                
                <blockquote className="text-lg text-gray-300 mb-6 italic">
                  &quot;Integrating Paiptree&apos;s models into Creative Cloud has revolutionized how our users approach creative work. 
                  The seamless AI-powered image generation has increased user engagement by 300%.&quot;
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">AS</span>
                  </div>
                  <div>
                    <div className="font-semibold">Alex Smith</div>
                    <div className="text-gray-400 text-sm">VP of Product, Adobe</div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card">
                <div className="flex items-center mb-6">
                  <div className="text-4xl mr-4">🎯</div>
                  <div>
                    <h3 className="text-xl font-bold">Canva</h3>
                    <p className="text-purple-400">Design Platform Partnership</p>
                  </div>
                </div>
                
                <blockquote className="text-lg text-gray-300 mb-6 italic">
                  &quot;The partnership with Paiptree has enabled us to offer cutting-edge AI design tools to millions of users. 
                  Our AI-powered features now account for 40% of all designs created on our platform.&quot;
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold">MJ</span>
                  </div>
                  <div>
                    <div className="font-semibold">Maria Johnson</div>
                    <div className="text-gray-400 text-sm">Head of AI, Canva</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to <span className="gradient-text">Partner</span> with Us?
            </h2>
            
            <p className="text-xl text-gray-400 mb-12">
              Join our ecosystem of partners and help shape the future of generative AI. 
              Let&apos;s build something amazing together.
            </p>
            
            <div className="glass-card max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-6">Partnership Application</h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="email"
                    placeholder="Contact Email"
                    className="px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                <select className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500">
                  <option value="">Select Partnership Type</option>
                  <option value="technology">Technology Integration</option>
                  <option value="distribution">Distribution Partnership</option>
                  <option value="research">Research Collaboration</option>
                  <option value="enterprise">Enterprise Solutions</option>
                </select>
                
                <textarea
                  rows={4}
                  placeholder="Tell us about your partnership proposal..."
                  className="w-full px-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
                ></textarea>
                
                <button className="btn-primary w-full py-3">
                  Submit Application
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}