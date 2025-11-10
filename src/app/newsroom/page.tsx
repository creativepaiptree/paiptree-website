import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';

const newsArticles = [
  {
    id: 1,
    title: 'Paiptree Announces Breakthrough in AI Safety Research',
    excerpt: 'Our latest research introduces novel approaches to content filtering and safety measures in large-scale generative models, setting new industry standards.',
    date: '2024-03-15',
    category: 'Press Release',
    type: 'press',
    featured: true
  },
  {
    id: 2,
    title: 'Series A Funding: $101M to Democratize AI Technology',
    excerpt: 'Led by Lightspeed Venture Partners and Coatue Management, this funding will accelerate our mission to make AI accessible to everyone.',
    date: '2024-03-10',
    category: 'Company News',
    type: 'news',
    featured: false
  },
  {
    id: 3,
    title: 'Strategic Partnership with Adobe Creative Cloud',
    excerpt: 'Bringing Stable Diffusion directly into Creative Cloud applications, empowering millions of creators worldwide.',
    date: '2024-02-28',
    category: 'Partnership',
    type: 'press',
    featured: false
  }
];

const mediaArticles = [
  {
    title: 'TechCrunch: Paiptree Leads the Next Wave of AI Innovation',
    outlet: 'TechCrunch',
    date: '2024-03-12',
    url: '#'
  },
  {
    title: 'The Verge: How Paiptree is Making AI More Accessible',
    outlet: 'The Verge',
    date: '2024-03-08',
    url: '#'
  },
  {
    title: 'Wired: The Future of Creative AI with Paiptree',
    outlet: 'Wired',
    date: '2024-02-25',
    url: '#'
  }
];

export default function NewsroomPage() {
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
                <span className="body-sm">Newsroom</span>
              </div>
              
              <h1 className="heading-xl mb-8">
                <span className="gradient-text">Paiptree</span> Newsroom
              </h1>
              
              <p className="body-lg mb-12 max-w-4xl mx-auto">
                Stay updated with the latest news, press releases, and media coverage about Paiptree. 
                Get the inside story on our innovations, partnerships, and company milestones.
              </p>
            </div>
          </div>
        </section>

        {/* Latest News Section */}
        <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container-max">
            <h2 className="heading-lg text-center mb-16">
              Latest <span className="gradient-text">Updates</span>
            </h2>
            
            {/* Featured Article */}
            {newsArticles.filter(article => article.featured).map((article) => (
              <div key={article.id} className="glass-card mb-12 group cursor-pointer">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full">
                        Featured
                      </span>
                      <span className="body-sm" style={{ color: 'var(--text-secondary)' }}>{article.category}</span>
                    </div>
                    
                    <h3 className="heading-md mb-4 group-hover:text-purple-300 transition-colors">{article.title}</h3>
                    <p className="body-md mb-6">{article.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="body-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <button className="text-purple-400 hover:text-purple-300 font-medium">
                        Read Full Story →
                      </button>
                    </div>
                  </div>
                  
                  <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center">
                    <div className="text-6xl opacity-50">📰</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Other News */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {newsArticles.filter(article => !article.featured).map((article) => (
                <div key={article.id} className="glass-card group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg mb-6 flex items-center justify-center">
                    <div className="text-4xl opacity-50">
                      {article.type === 'press' ? '📋' : '📢'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-purple-400 body-sm font-medium">{article.category}</span>
                  </div>
                  
                  <h4 className="heading-sm mb-3 group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </h4>
                  
                  <p className="body-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="body-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <button className="text-purple-400 hover:text-purple-300 body-sm font-medium">
                      Read More →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Coverage */}
        <section className="section-padding">
          <div className="container-max">
            <h2 className="heading-lg text-center mb-16">
              Media <span className="gradient-text">Coverage</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mediaArticles.map((article, index) => (
                <div key={index} className="glass-card group cursor-pointer">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-xl">📰</span>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-400">{article.outlet}</div>
                      <div className="body-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="heading-sm mb-4 group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </h4>
                  
                  <button className="text-purple-400 hover:text-purple-300 body-sm font-medium">
                    Read Article →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Media Kit */}
        <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="heading-lg mb-8">
                  Media <span className="gradient-text">Kit</span>
                </h2>
                <p className="body-lg mb-8">
                  Download our official logos, brand assets, and company information for your stories and articles.
                </p>
                
                <div className="space-y-4">
                  <div className="glass-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">Brand Logos</h4>
                        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>Official Paiptree logos in various formats</p>
                      </div>
                      <button className="btn-secondary">
                        Download
                      </button>
                    </div>
                  </div>
                  
                  <div className="glass-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">Product Screenshots</h4>
                        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>High-resolution product images</p>
                      </div>
                      <button className="btn-secondary">
                        Download
                      </button>
                    </div>
                  </div>
                  
                  <div className="glass-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">Company Fact Sheet</h4>
                        <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>Key company information and statistics</p>
                      </div>
                      <button className="btn-secondary">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="glass-card">
                <h3 className="heading-sm mb-6">Press Contact</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Media Inquiries</h4>
                    <p className="body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      For press and media-related questions
                    </p>
                    <a href="mailto:press@paiptree.com" className="text-purple-400 hover:text-purple-300">
                      press@paiptree.com
                    </a>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">General Contact</h4>
                    <p className="body-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      For general inquiries and information
                    </p>
                    <a href="mailto:hello@paiptree.com" className="text-purple-400 hover:text-purple-300">
                      hello@paiptree.com
                    </a>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Phone</h4>
                    <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="heading-lg mb-6">
                Stay <span className="gradient-text">Updated</span>
              </h2>
              
              <p className="body-lg mb-8">
                Subscribe to our newsletter and get the latest Paiptree news delivered directly to your inbox.
              </p>
              
              <div className="glass-card max-w-md mx-auto">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  <button className="btn-primary">
                    Subscribe
                  </button>
                </div>
                <p className="body-sm mt-3" style={{ color: 'var(--text-muted)' }}>
                  By subscribing, you agree to our Privacy Policy and Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}