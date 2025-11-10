import Header from '@/components/Header';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';

const coreValues = [
  {
    icon: '🚀',
    title: '혁신',
    description: '지속적인 혁신과 창의적인 문제 해결을 통해 가능성의 경계를 넓혀갑니다.',
    color: 'from-purple-600 to-pink-600'
  },
  {
    icon: '🤝',
    title: '협업',
    description: '다양한 관점과 열린 협업이 혁신적인 솔루션으로 이어진다고 믿습니다.',
    color: 'from-blue-600 to-purple-600'
  },
  {
    icon: '📈',
    title: '성장',
    description: '개인과 조직 모두의 지속적인 학습과 발전을 장려합니다.',
    color: 'from-green-600 to-blue-600'
  },
  {
    icon: '🌍',
    title: '임팩트',
    description: '긍정적인 변화를 만들고 AI 기술을 모두에게 제공하는 것에 전념합니다.',
    color: 'from-orange-600 to-red-600'
  }
];

const benefits = [
  {
    category: '건강 & 웰니스',
    items: [
      '종합 건강 보험',
      '정신 건강 지원',
      '웰니스 지원금',
      '헬스장 멤버십'
    ]
  },
  {
    category: '워라밸',
    items: [
      '유연 근무제',
      '재택 근무 옵션',
      '무제한 휴가',
      '안식년 기회'
    ]
  },
  {
    category: '성장 & 개발',
    items: [
      '학습 및 개발 예산',
      '컨퍼런스 참가 지원',
      '사내 멘토링 프로그램',
      '경력 개발 경로'
    ]
  },
  {
    category: '금융 혜택',
    items: [
      '경쟁력 있는 급여',
      '스톡옵션',
      '성과 보너스',
      '퇴직 연금 설계'
    ]
  }
];

const employeeStories = [
  {
    name: '김서연',
    role: '시니어 AI 연구원',
    quote: 'Paiptree에서는 최첨단 연구를 자유롭게 탐구하면서 제 작업이 수백만 사용자에게 직접적인 영향을 미친다는 것을 알 수 있습니다. 이곳의 협업 환경은 타의 추종을 불허합니다.',
    avatar: '👩‍💻'
  },
  {
    name: '이준호',
    role: '프로덕트 매니저',
    quote: '혁신의 문화와 전문적 성장에 대한 지원 덕분에 상상도 못했던 도전을 할 수 있었습니다. 매일 새로운 학습 기회가 찾아옵니다.',
    avatar: '👨‍💼'
  },
  {
    name: '박지민',
    role: '소프트웨어 엔지니어',
    quote: 'Paiptree에서 일한다는 것은 서로의 성공을 진심으로 응원하는 팀의 일원이 되는 것입니다. 워라밸과 유연성은 제 삶을 완전히 바꿔놓았습니다.',
    avatar: '👩‍🔬'
  }
];

export default function CulturePage() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'var(--bg-primary)' }}>
      <ParticleBackground />
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center mb-16">
              <h1 className="heading-xl mb-8">
                함께 <span className="gradient-text">성장하는</span> 문화
              </h1>
              
              <p className="body-lg max-w-3xl mx-auto">
                Paiptree는 위대한 기술은 위대한 사람들로부터 나온다고 믿습니다. 
                우리의 문화는 혁신, 협업, 그리고 모두를 위한 AI 민주화라는 공동의 미션 위에 세워졌습니다.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-6">
                우리의 <span className="gradient-text">가치</span>
              </h2>
              <p className="body-lg max-w-3xl mx-auto">
                이 핵심 가치들은 제품을 만드는 방식부터 서로를 대하는 방식까지 우리가 하는 모든 일을 이끕니다.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreValues.map((value, index) => (
                <div key={index} className="glass-card text-center group">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${value.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{value.icon}</span>
                  </div>
                  <h3 className="heading-sm mb-4">{value.title}</h3>
                  <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Benefits */}
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-6">
                복리후생 & <span className="gradient-text">혜택</span>
              </h2>
              <p className="body-lg max-w-3xl mx-auto">
                건강, 성장, 그리고 전반적인 웰빙을 지원하기 위해 설계된 포괄적인 복리후생을 제공합니다.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((category, index) => (
                <div key={index} className="glass-card">
                  <h3 className="heading-sm mb-6">{category.category}</h3>
                  <ul className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                        <span className="body-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Employee Stories */}
        <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container-max">
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-6">
                우리 <span className="gradient-text">팀</span>의 목소리
              </h2>
              <p className="body-lg max-w-3xl mx-auto">
                Paiptree에서 일하는 경험에 대해 팀원들이 직접 들려주는 이야기입니다.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {employeeStories.map((story, index) => (
                <div key={index} className="glass-card">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-2xl">{story.avatar}</span>
                    </div>
                    <div>
                      <div className="font-semibold">{story.name}</div>
                      <div className="body-sm" style={{ color: 'var(--text-secondary)' }}>{story.role}</div>
                    </div>
                  </div>
                  
                  <blockquote className="body-md italic mb-4" style={{ color: 'var(--text-secondary)' }}>
                    "{story.quote}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* CTA Section */}
        <section className="section-padding">
          <div className="container-max">
            <div className="text-center">
              <h2 className="heading-lg mb-6">
                함께 <span className="gradient-text">하시겠습니까</span>?
              </h2>
              <p className="body-lg mb-12 max-w-2xl mx-auto">
                AI의 미래를 만들어가며 모두가 성장할 수 있는 문화를 구축하는 팀의 일원이 되어보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary">
                  채용 공고 보기
                </button>
                <button className="btn-secondary">
                  복리후생 알아보기
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