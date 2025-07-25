'use client';

export default function MiddleSection() {
  return (
    <section className="py-32 bg-stability-dark relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* 첫 번째 좌우 분할 - 스크린샷의 검은 박스 + 텍스트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          {/* 좌측 이미지 - 스크린샷의 검은 박스 */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-3xl flex items-center justify-center">
              <div className="text-7xl opacity-40">📱</div>
            </div>
          </div>
          
          {/* 우측 텍스트 - 스크린샷 정확한 텍스트 */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
              Solve practical problems without creating new ones.
            </h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              Case Study: Enterprise retailers choose Stability AI to generate product imagery at scale while maintaining brand consistency and quality standards.
            </p>
            <button className="bg-white text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors">
              Read case study
            </button>
          </div>
        </div>

        {/* 두 번째 좌우 분할 (순서 반대) - 스크린샷의 또 다른 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* 좌측 텍스트 - 스크린샷 정확한 텍스트 */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
              Your next production requires more than a prompt.
            </h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              The flexible deployment you need to get to the outcomes you want. Enterprise-grade security, custom training, and dedicated support.
            </p>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-black transition-all duration-300">
              Contact sales
            </button>
          </div>
          
          {/* 우측 이미지 - 스크린샷의 밝은 박스 */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-3xl flex items-center justify-center">
              <div className="text-7xl opacity-50">🔓</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}