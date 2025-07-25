import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';

const newsArticles = [
  {
    id: 1,
    title: 'Introducing Stable Diffusion 3.0: Our Most Advanced Model Yet',
    excerpt: 'Today we are excited to announce Stable Diffusion 3.0, featuring improved text rendering, better prompt adherence, and enhanced image quality.',
    date: '2024-03-15',
    category: 'Product Update',
    readTime: '5 min read',
    featured: true
  },
  {
    id: 2,
    title: 'Paiptree Raises $101M Series A to Democratize AI',
    excerpt: 'We are thrilled to announce our Series A funding round led by Lightspeed Venture Partners and Coatue Management.',
    date: '2024-03-10',
    category: 'Company News',
    readTime: '3 min read',
    featured: false
  },
  {
    id: 3,
    title: 'New Research: Improving Safety in Generative AI Models',
    excerpt: 'Our latest research paper explores novel approaches to content filtering and safety measures in large-scale generative models.',
    date: '2024-03-05',
    category: 'Research',
    readTime: '8 min read',
    featured: false
  },
  {
    id: 4,
    title: 'Partnership Announcement: Paiptree x Adobe Creative Cloud',
    excerpt: 'We are partnering with Adobe to bring Stable Diffusion directly into Creative Cloud applications.',
    date: '2024-02-28',
    category: 'Partnership',
    readTime: '4 min read',
    featured: false
  },
  {
    id: 5,
    title: 'Open Source Initiative: Making AI Accessible to Everyone',
    excerpt: 'Learn about our commitment to open source AI and how we are building tools for the global developer community.',
    date: '2024-02-20',
    category: 'Open Source',
    readTime: '6 min read',
    featured: false
  },
  {
    id: 6,
    title: 'Stable Video Diffusion: From Images to Motion',
    excerpt: 'Introducing our latest breakthrough in video generation technology, capable of creating smooth, high-quality video content.',
    date: '2024-02-15',
    category: 'Product Update',
    readTime: '7 min read',
    featured: false
  }
];

const categories = ['All', 'Product Update', 'Company News', 'Research', 'Partnership', 'Open Source'];

export default function NewsPage() {
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
                Latest <span className="gradient-text">News</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
                Stay updated with the latest developments, research breakthroughs, and product announcements from Paiptree.
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-6 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    category === 'All' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Article */}
        <section className="px-6 mb-16">
          <div className="max-w-7xl mx-auto">
            {newsArticles.filter(article => article.featured).map((article) => (
              <div key={article.id} className="glass-card hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full">
                        Featured
                      </span>
                      <span className="text-gray-400 text-sm">{article.category}</span>
                      <span className="text-gray-500 text-sm">•</span>
                      <span className="text-gray-400 text-sm">{article.readTime}</span>
                    </div>
                    
                    <h2 className="text-3xl font-bold mb-4 leading-tight">{article.title}</h2>
                    <p className="text-gray-400 text-lg mb-6 leading-relaxed">{article.excerpt}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <button className="text-purple-400 hover:text-purple-300 font-medium">
                        Read more →
                      </button>
                    </div>
                  </div>
                  
                  <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl flex items-center justify-center">
                    <div className="text-6xl opacity-50">📰</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* News Grid */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsArticles.filter(article => !article.featured).map((article) => (
                <div key={article.id} className="glass-card hover:bg-white/10 transition-all duration-300 cursor-pointer group">
                  <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg mb-6 flex items-center justify-center">
                    <div className="text-4xl opacity-50">
                      {article.category === 'Product Update' && '🚀'}
                      {article.category === 'Company News' && '🏢'}
                      {article.category === 'Research' && '🔬'}
                      {article.category === 'Partnership' && '🤝'}
                      {article.category === 'Open Source' && '💻'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-purple-400 text-sm font-medium">{article.category}</span>
                    <span className="text-gray-500 text-sm">•</span>
                    <span className="text-gray-400 text-sm">{article.readTime}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 leading-tight group-hover:text-purple-300 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">
                      {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                      Read more →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Stay <span className="gradient-text">Informed</span>
            </h2>
            
            <p className="text-xl text-gray-400 mb-8">
              Subscribe to our newsletter and never miss important updates from Paiptree.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-white/5 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-r-lg font-medium hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}