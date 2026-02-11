import BlogHeader from '@/components/BlogHeader';
import Footer from '@/components/Footer';
import Image from 'next/image';

const blogPosts = [
  {
    id: 1,
    title: '체리부로 TMS 도입 현황 및 서비스 방안',
    date: '2025-12-12',
    author: 'ZORO',
    tags: ['체리부로', 'TMS', '기술 검토'],
    link: '/blog/1/cheriburo_tms_template.html',
    thumbnail: '/blog/1/frame-1.png'
  },
  {
    id: 2,
    title: '확장 가능한 농장 관리 플랫폼 구축하기',
    date: '2024-03-12',
    author: '이지은',
    tags: ['인프라', '확장성', '개발']
  },
  {
    id: 3,
    title: 'Paiptree 브랜드 리뉴얼 스토리',
    date: '2024-03-10',
    author: '박서연',
    tags: ['브랜딩', 'UX', '디자인']
  },
  {
    id: 4,
    title: '데이터 기반 양계 농장 최적화',
    date: '2024-03-08',
    author: '정우진',
    tags: ['데이터', '최적화', '비즈니스']
  },
  {
    id: 5,
    title: '사용자 중심의 디자인 시스템 구축',
    date: '2024-03-05',
    author: '조영연',
    tags: ['디자인시스템', 'UI/UX', '디자인']
  },
  {
    id: 6,
    title: 'Paiptree의 성장 여정',
    date: '2024-03-01',
    author: '최현우',
    tags: ['스타트업', '성장', '문화']
  }
];

const categories = ['전체', '브랜드', '개발', '디자인', '비즈니스', '문화'];

const popularTags = [
  'AI', '스마트팜', '데이터분석', 'IoT',
  '개발', '디자인', '브랜딩', '인프라',
  '확장성', 'UX', '스타트업', '성장',
  '혁신', '최적화', '농업테크', '플랫폼'
];

export default function BlogPage() {
  return (
    <div className="min-h-screen overflow-x-hidden blog-light-theme">
      <BlogHeader />
      
      <main className="pt-20">
        {/* Category Filter - Text Links */}
        <section className="px-6 py-6">
          <div className="container-max">
            <div className="flex flex-wrap items-center gap-6">
              {categories.map((category) => (
                <a
                  key={category}
                  href="#"
                  className={`category-link ${category === '전체' ? 'category-link-active' : ''}`}
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts List with Sidebar - 2 Column Layout */}
        <section className="px-6 py-8">
          <div className="container-max">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
              {/* Left: Blog Posts List */}
              <div className="space-y-0" style={{ maxWidth: '800px' }}>
                {blogPosts.map((post) => {
                  const cardContent = (
                    <>
                      {/* Content - Tags, Title, Author & Date */}
                      <div className="content-section">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="blog-tag-inline">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Title */}
                        <h3 className="blog-list-title-light mb-3 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>
                        
                        {/* Author & Date */}
                        <div className="flex items-center gap-2 text-sm" style={{ color: '#9CA3AF' }}>
                          <span>{post.author}</span>
                          <span>|</span>
                          <span>{new Date(post.date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}</span>
                        </div>
                      </div>
                      
                      {/* Thumbnail - Right Side */}
                      <div className="thumbnail-section">
                        {post.thumbnail ? (
                          <Image
                            src={post.thumbnail}
                            alt={`${post.title} 썸네일`}
                            width={192}
                            height={128}
                            className="w-48 h-32 rounded-lg object-cover flex-shrink-0"
                            style={{ border: '1px solid rgba(0, 0, 0, 0.6)' }}
                          />
                        ) : (
                          <div className="w-48 h-32 blog-thumbnail rounded-lg flex-shrink-0"></div>
                        )}
                      </div>
                    </>
                  );
                  
                  if (post.link) {
                    return (
                      <a
                        key={post.id}
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="blog-list-item group cursor-pointer"
                      >
                        {cardContent}
                      </a>
                    );
                  }
                  
                  return (
                    <div key={post.id} className="blog-list-item group cursor-pointer">
                      {cardContent}
                    </div>
                  );
                })}
              </div>
              
              {/* Right: Tags Sidebar */}
              <aside className="tags-sidebar">
                <div className="sticky top-24">
                  <h3 className="text-lg font-semibold mb-4 blog-light-title">
                    태그
                  </h3>
                  <div className="tag-cloud">
                    {popularTags.map((tag, index) => (
                      <button
                        key={index}
                        className="tag-cloud-item-light"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
}
