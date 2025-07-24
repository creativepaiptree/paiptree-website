export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-brand-orange to-brand-teal bg-clip-text text-transparent">
            Paiptree
          </h1>
          <p className="text-xl text-brand-gray max-w-2xl mx-auto">
            Professional design system and UI component library for modern web development
          </p>
        </div>

        {/* Quick Start */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-brand-navy">
              🚀 Quick Start
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-brand-navy">
                  Design System
                </h3>
                <p className="text-brand-gray mb-4">
                  Comprehensive design tokens, components, and guidelines
                </p>
                <button className="bg-brand-teal text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors">
                  Download Figma Kit
                </button>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-brand-navy">
                  Component Library
                </h3>
                <p className="text-brand-gray mb-4">
                  React components ready for production use
                </p>
                <button className="bg-brand-orange text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Browse Components
                </button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-brand-orange rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-brand-navy">
                Design Tokens
              </h3>
              <p className="text-brand-gray">
                Consistent colors, typography, and spacing across all platforms
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-brand-teal rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-brand-navy">
                Fast Development
              </h3>
              <p className="text-brand-gray">
                Pre-built components to accelerate your development workflow
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-brand-navy rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-brand-navy">
                Responsive
              </h3>
              <p className="text-brand-gray">
                Mobile-first design approach with responsive components
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
