import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';

const researchPapers = [
  {
    title: 'Stable Diffusion 3: Scaling Rectified Flow Transformers for High-Resolution Image Synthesis',
    authors: ['Patrick Esser', 'Sumith Kulal', 'Andreas Blattmann', 'Rahim Entezari'],
    date: '2024-03-05',
    category: 'Computer Vision',
    abstract: 'We present Stable Diffusion 3, a new text-to-image model that significantly improves upon previous versions through architectural innovations and scaling.',
    arxivLink: '#',
    codeLink: '#',
    featured: true
  },
  {
    title: 'SDXL: Improving Latent Diffusion Models for High-Resolution Image Synthesis',
    authors: ['Dustin Podell', 'Zion English', 'Kyle Lacey', 'Andreas Blattmann'],
    date: '2024-02-20',
    category: 'Machine Learning',
    abstract: 'SDXL is a latent diffusion model for text-to-image synthesis that achieves state-of-the-art results in image quality and composition.',
    arxivLink: '#',
    codeLink: '#',
    featured: false
  },
  {
    title: 'High-Resolution Image Synthesis with Latent Diffusion Models',
    authors: ['Robin Rombach', 'Andreas Blattmann', 'Dominik Lorenz', 'Patrick Esser'],
    date: '2024-01-15',
    category: 'Computer Vision',
    abstract: 'By decomposing the image formation process into a sequential application of denoising autoencoders, diffusion models achieve impressive results.',
    arxivLink: '#',
    codeLink: '#',
    featured: false
  },
  {
    title: 'Scaling Autoregressive Video Models',
    authors: ['Wilson Yan', 'Yunzhi Zhang', 'Pieter Abbeel', 'Aravind Srinivas'],
    date: '2024-01-10',
    category: 'Video Generation',
    abstract: 'We explore scaling laws for autoregressive video models and demonstrate significant improvements in video quality and temporal consistency.',
    arxivLink: '#',
    codeLink: '#',
    featured: false
  }
];

const researchAreas = [
  {
    title: 'Generative Models',
    description: 'Advancing the state-of-the-art in diffusion models, GANs, and autoregressive models for high-quality content generation.',
    icon: '🎨',
    papers: 12
  },
  {
    title: 'Multimodal AI',
    description: 'Bridging vision, language, and audio to create more comprehensive and versatile AI systems.',
    icon: '🔗',
    papers: 8
  },
  {
    title: 'AI Safety',
    description: 'Developing robust safety measures and alignment techniques for responsible AI deployment.',
    icon: '🛡️',
    papers: 6
  },
  {
    title: 'Efficiency & Optimization',
    description: 'Making AI models faster, smaller, and more accessible through novel optimization techniques.',
    icon: '⚡',
    papers: 10
  }
];

export default function ResearchPage() {
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
                <span className="gradient-text">Research</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
                Pushing the boundaries of generative AI through cutting-edge research. 
                Paiptree team publishes open research to advance the field and democratize AI knowledge.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300">
                  View All Papers
                </button>
                <button className="btn-secondary px-8 py-4 text-lg">
                  Join Our Team
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Research Areas */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Research <span className="gradient-text">Areas</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {researchAreas.map((area, index) => (
                <div key={index} className="glass-card hover:bg-white/10 transition-all duration-300 text-center group">
                  <div className="text-4xl mb-4">{area.icon}</div>
                  <h3 className="text-xl font-semibold mb-4">{area.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{area.description}</p>
                  <div className="text-purple-400 font-medium">{area.papers} papers</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Research */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Featured <span className="gradient-text">Publications</span>
            </h2>
            
            {/* Featured Paper */}
            {researchPapers.filter(paper => paper.featured).map((paper, index) => (
              <div key={index} className="glass-card mb-12 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full">
                    Featured
                  </span>
                  <span className="text-purple-400 text-sm">{paper.category}</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 leading-tight">{paper.title}</h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {paper.authors.map((author, authorIndex) => (
                    <span key={authorIndex} className="text-gray-400 text-sm">
                      {author}{authorIndex < paper.authors.length - 1 && ','}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">{paper.abstract}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">
                    {new Date(paper.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                  <div className="flex gap-4">
                    <a href={paper.arxivLink} className="text-purple-400 hover:text-purple-300 font-medium">
                      arXiv →
                    </a>
                    <a href={paper.codeLink} className="text-purple-400 hover:text-purple-300 font-medium">
                      Code →
                    </a>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Other Papers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {researchPapers.filter(paper => !paper.featured).map((paper, index) => (
                <div key={index} className="glass-card hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-purple-400 text-sm font-medium">{paper.category}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(paper.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 leading-tight group-hover:text-purple-300 transition-colors">
                    {paper.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {paper.authors.slice(0, 2).map((author, authorIndex) => (
                      <span key={authorIndex} className="text-gray-400 text-xs">
                        {author}{authorIndex < Math.min(paper.authors.length, 2) - 1 && ','}
                      </span>
                    ))}
                    {paper.authors.length > 2 && (
                      <span className="text-gray-400 text-xs">et al.</span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
                    {paper.abstract}
                  </p>
                  
                  <div className="flex gap-4">
                    <a href={paper.arxivLink} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                      arXiv →
                    </a>
                    <a href={paper.codeLink} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                      Code →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Collaboration */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8">
                  Research <span className="gradient-text">Collaboration</span>
                </h2>
                
                <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                  We believe in open science and collaborative research. Partner with us to advance 
                  the frontiers of AI and make breakthrough discoveries together.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-purple-400">🎓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Academic Partnerships</h3>
                      <p className="text-gray-400">Collaborate with leading universities and research institutions worldwide.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-purple-400">💡</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Open Research</h3>
                      <p className="text-gray-400">All our research is published openly to benefit the entire AI community.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4 mt-1">
                      <span className="text-purple-400">🚀</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Innovation Labs</h3>
                      <p className="text-gray-400">State-of-the-art facilities and resources for cutting-edge AI research.</p>
                    </div>
                  </div>
                </div>
                
                <button className="btn-primary mt-8 px-8 py-4">
                  Collaborate With Us
                </button>
              </div>
              
              <div className="glass-card">
                <h3 className="text-2xl font-bold mb-6">Research Metrics</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">50+</div>
                    <div className="text-gray-400 text-sm">Published Papers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">10K+</div>
                    <div className="text-gray-400 text-sm">Citations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">25+</div>
                    <div className="text-gray-400 text-sm">Research Partners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">100+</div>
                    <div className="text-gray-400 text-sm">Researchers</div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-gray-900/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Latest Achievement</h4>
                  <p className="text-gray-400 text-sm">
                    Our Stable Diffusion 3 paper achieved state-of-the-art results on FID scores 
                    and human preference evaluations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}