export default function Home() {
  return (
    <>
      {/* Header/Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-brand-primary" style={{ fontFamily: 'Gmarket Sans, sans-serif' }}>
              paiptree.
            </span>
          </div>
          
          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#platform" className="text-brand-dark hover:text-brand-primary transition-colors">
              Platform
            </a>
            <a href="#global" className="text-brand-dark hover:text-brand-primary transition-colors">
              Global
            </a>
            <a href="#partnership" className="text-brand-dark hover:text-brand-primary transition-colors">
              Partnership
            </a>
            <button className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Contact
            </button>
          </div>
          
          {/* Mobile menu button */}
          <button className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
      
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-block mb-6 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium">
            🤖 AI-driven Smart Agriculture
          </div>
          
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary bg-clip-text text-transparent">
            PAIPTREE
          </h1>
          
          <p className="text-2xl font-light mb-4 text-brand-dark">
            SEED THE FUTURE, NOT THE PRESENT
          </p>
          
          <p className="text-lg text-brand-dark/80 max-w-3xl mx-auto mb-8">
            AI 기반 스마트 양계 솔루션으로 농장 생산성을 혁신하고, 데이터 중심의 지속가능한 농업 생태계를 구축합니다.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button className="bg-brand-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors">
              FarmersMind 체험하기
            </button>
            <button className="border-2 border-brand-primary text-brand-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-brand-primary hover:text-white transition-colors">
              성과 보기
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {[
            { number: '360+', label: '관리 농장', desc: '전국 상업양계농장 22.6% 점유율' },
            { number: '90%', label: '중량예측 정확도', desc: 'AI 모델 기반 실시간 분석' },
            { number: '6개국', label: '해외 진출', desc: '아시아-아프리카 기술이전 완료' },
            { number: '5배', label: '수익성 향상', desc: '리노베이션 + AI 시스템 효과' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold mb-2 text-brand-primary">
                {stat.number}
              </div>
              <div className="text-lg font-semibold mb-1 text-brand-dark">
                {stat.label}
              </div>
              <div className="text-sm text-brand-dark/60">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
        
        {/* Core Platform */}
        <div id="platform" className="max-w-6xl mx-auto mb-20">
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-brand-dark">
                🌱 FarmersMind AI Platform
              </h2>
              <p className="text-xl text-brand-dark/70">
                농장 생산성과 수익성을 동시에 향상시키는 통합 AI 솔루션
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 rounded-2xl">
                <div className="w-16 h-16 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-brand-dark">
                  AI 중량 예측
                </h3>
                <p className="text-brand-dark/70 mb-4">
                  CCTV 기반 실시간 가축 중량 분석으로 최적 출하시점 예측
                </p>
                <ul className="text-sm text-brand-dark/60 space-y-1">
                  <li>• 중량 예측 정확도 90% 이상</li>
                  <li>• 개체별 성장 트렌드 분석</li>
                  <li>• 출하일정 자동 예측</li>
                </ul>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-brand-secondary/5 to-brand-accent/5 rounded-2xl">
                <div className="w-16 h-16 bg-brand-secondary/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-brand-dark">
                  스마트 환경제어
                </h3>
                <p className="text-brand-dark/70 mb-4">
                  온도, 습도, 환기를 자동 제어하여 사육환경 최적화
                </p>
                <ul className="text-sm text-brand-dark/60 space-y-1">
                  <li>• 24시간 실시간 모니터링</li>
                  <li>• 이상징후 조기 감지</li>
                  <li>• 사료효율 30% 향상</li>
                </ul>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-brand-accent/5 to-brand-primary/5 rounded-2xl">
                <div className="w-16 h-16 bg-brand-accent/20 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-2xl">🔗</span>
                </div>
                <h3 className="text-xl font-bold mb-4 text-brand-dark">
                  공급망 연계
                </h3>
                <p className="text-brand-dark/70 mb-4">
                  생산부터 출하까지 데이터 기반 통합 관리 시스템
                </p>
                <ul className="text-sm text-brand-dark/60 space-y-1">
                  <li>• 위탁사육 계약 자동화</li>
                  <li>• 수급 계획 정량화</li>
                  <li>• 품질 기준 추적 관리</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Global Expansion */}
        <div id="global" className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-8 text-brand-dark">
            🌍 글로벌 확산
          </h2>
          <p className="text-xl text-brand-dark/70 mb-12">
            6개국 기술이전 완료, 아시아-아프리카 시장 선도
          </p>
          
          <div className="grid md:grid-cols-6 gap-8 items-center">
            {[
              { country: 'Korea', status: '상용화', farms: '360+' },
              { country: 'Japan', status: '기술협력', farms: 'TOHZAI' },
              { country: 'Taiwan', status: '시범운영', farms: 'Crownmate' },
              { country: 'Indonesia', status: '확산중', farms: 'CJ F&C' },
              { country: 'Madagascar', status: '실증완료', farms: '18개월' },
              { country: 'Laos', status: '도입예정', farms: 'DDC Group' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl text-brand-primary font-bold">
                    {item.country.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="font-semibold text-brand-dark mb-1">
                  {item.country}
                </div>
                <div className="text-sm text-brand-primary mb-1">
                  {item.status}
                </div>
                <div className="text-xs text-brand-dark/60">
                  {item.farms}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Partnership */}
        <div id="partnership" className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            🤝 파트너십 & 성과
          </h2>
          <p className="text-xl mb-8 opacity-90">
            전 세계 주요 기업들과 협력하여 농업 혁신을 선도하고 있습니다
          </p>
          
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {[
              { name: 'CP Group (Thailand)', desc: '세계 최대 축산유통기업' },
              { name: 'CJ Feed & Care', desc: '한국 대표 사료기업' },
              { name: 'KOICA CTS', desc: '개발협력 프로그램' },
              { name: 'UNIDO', desc: 'UN 산업개발기구' }
            ].map((partner, index) => (
              <div key={index}>
                <div className="font-bold mb-2">
                  {partner.name}
                </div>
                <div className="text-sm opacity-80">
                  {partner.desc}
                </div>
              </div>
            ))}
          </div>
          
          <button className="bg-white text-brand-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors">
            파트너십 문의하기
          </button>
        </div>
        
      </div>
    </main>
    </>
  )
}
