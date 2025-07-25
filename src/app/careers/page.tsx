import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';

const jobOpenings = [
  {
    title: 'Senior AI Research Scientist',
    department: 'Research',
    location: 'London, UK',
    type: 'Full-time',
    description: 'Lead cutting-edge research in generative AI models and publish high-impact papers.',
    requirements: ['PhD in ML/AI', '5+ years research experience', 'Strong publication record'],
    featured: true
  },
  {
    title: 'Machine Learning Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Build and scale ML infrastructure for training and serving large-scale AI models.',
    requirements: ['MS in CS/ML', 'Python/PyTorch', 'Distributed systems experience'],
    featured: false
  },
  {
    title: 'Product Manager - AI Platform',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    description: 'Drive product strategy and roadmap for our AI platform and developer tools.',
    requirements: ['5+ years PM experience', 'Technical background', 'AI/ML product experience'],
    featured: false
  },
  {
    title: 'DevOps Engineer',
    department: 'Infrastructure',
    location: 'Berlin, Germany',
    type: 'Full-time',
    description: 'Manage cloud infrastructure and deployment pipelines for AI model serving.',
    requirements: ['Kubernetes experience', 'AWS/GCP', 'CI/CD pipelines'],
    featured: false
  },
  {
    title: 'UX Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Design intuitive interfaces for AI-powered creative tools and developer platforms.',
    requirements: ['5+ years UX design', 'Figma/Sketch', 'AI product experience preferred'],
    featured: false
  },
  {
    title: 'Research Intern',
    department: 'Research',
    location: 'London, UK',
    type: 'Internship',
    description: 'Work alongside our research team on cutting-edge AI projects and publications.',
    requirements: ['PhD student in ML/AI', 'Strong coding skills', 'Research experience'],
    featured: false
  }
];

const benefits = [
  {
    icon: '💰',
    title: 'Competitive Compensation',
    description: 'Top-tier salary, equity, and performance bonuses'
  },
  {
    icon: '🏥',
    title: 'Health & Wellness',
    description: 'Comprehensive health insurance and wellness programs'
  },
  {
    icon: '🏖️',
    title: 'Flexible Time Off',
    description: 'Unlimited PTO and sabbatical opportunities'
  },
  {
    icon: '📚',
    title: 'Learning & Development',
    description: 'Conference attendance, courses, and research time'
  },
  {
    icon: '🌍',
    title: 'Remote-First',
    description: 'Work from anywhere with flexible hours'
  },
  {
    icon: '🚀',
    title: 'Cutting-Edge Work',
    description: 'Work on breakthrough AI research and products'
  }
];

const departments = ['All', 'Research', 'Engineering', 'Product', 'Design', 'Infrastructure'];

export default function CareersPage() {
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
                Join Our <span className="gradient-text">Mission</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
                Help us democratize AI and build the future of generative models. 
                Work with world-class researchers and engineers at Paiptree on breakthrough technology.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300">
                  View Open Positions
                </button>
                <button className="btn-secondary px-8 py-4 text-lg">
                  Life at Paiptree
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Company Values */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Our <span className="gradient-text">Values</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card text-center">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold mb-4">Open & Accessible</h3>
                <p className="text-gray-400 leading-relaxed">
                  We believe AI should be open and accessible to everyone, not controlled by a few.
                </p>
              </div>
              
              <div className="glass-card text-center">
                <div className="text-4xl mb-4">🔬</div>
                <h3 className="text-xl font-semibold mb-4">Research Excellence</h3>
                <p className="text-gray-400 leading-relaxed">
                  We push the boundaries of what's possible through rigorous research and innovation.
                </p>
              </div>
              
              <div className="glass-card text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-4">Collaborative</h3>
                <p className="text-gray-400 leading-relaxed">
                  We work together across disciplines to solve complex challenges and create impact.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Why Work <span className="gradient-text">With Us</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="glass-card hover:bg-white/10 transition-all duration-300">
                  <div className="text-3xl mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Openings */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Open <span className="gradient-text">Positions</span>
            </h2>
            
            {/* Department Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {departments.map((dept) => (
                <button
                  key={dept}
                  className={`px-6 py-2 rounded-full transition-all duration-300 ${
                    dept === 'All' 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Featured Job */}
            {jobOpenings.filter(job => job.featured).map((job, index) => (
              <div key={index} className="glass-card mb-8 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full">
                    Featured
                  </span>
                  <div className="text-right">
                    <span className="text-purple-400 text-sm font-medium">{job.department}</span>
                    <div className="text-gray-400 text-sm">{job.location} • {job.type}</div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{job.title}</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">{job.description}</p>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3">Requirements:</h4>
                  <ul className="space-y-2">
                    {job.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="flex items-center text-gray-300">
                        <svg className="w-4 h-4 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="btn-primary px-8 py-3">
                  Apply Now
                </button>
              </div>
            ))}

            {/* Other Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {jobOpenings.filter(job => !job.featured).map((job, index) => (
                <div key={index} className="glass-card hover:bg-white/10 transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-purple-400 text-sm font-medium">{job.department}</span>
                    <span className="text-gray-400 text-sm">{job.type}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                    {job.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4">{job.location}</p>
                  <p className="text-gray-300 text-sm mb-6 leading-relaxed">{job.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {job.requirements.length} requirements
                    </div>
                    <button className="text-purple-400 hover:text-purple-300 font-medium">
                      Apply →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
              Application <span className="gradient-text">Process</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Apply</h3>
                <p className="text-gray-400 text-sm">Submit your application and resume through our portal</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Screen</h3>
                <p className="text-gray-400 text-sm">Initial screening call with our talent team</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Interview</h3>
                <p className="text-gray-400 text-sm">Technical and cultural fit interviews with the team</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Offer</h3>
                <p className="text-gray-400 text-sm">Receive offer and join our mission to democratize AI</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 bg-stability-gray-900/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to <span className="gradient-text">Make Impact</span>?
            </h2>
            
            <p className="text-xl text-gray-400 mb-12">
              Don't see a role that fits? We're always looking for exceptional talent at Paiptree. 
              Send us your resume and let's start a conversation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-white text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300">
                Send Resume
              </button>
              <button className="btn-secondary px-8 py-4 text-lg">
                Contact Talent Team
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}