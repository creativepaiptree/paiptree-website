# Paiptree Website 리구조링 계획서

## 📋 프로젝트 개요

### 목표
기존 Paiptree 웹사이트를 사용자 친화적이고 전문적인 AI 기업 사이트로 리구조링

### 레퍼런스
- **사이트 구조**: [강남언니 팀 사이트](https://team.gangnamunni.com/) - 직관적이고 깔끔한 네비게이션 구조
- **디자인 스타일**: [Palantir](https://www.palantir.com/) - 프로페셔널한 다크 테마와 미니멀리즘

---

## 🗂️ 새로운 사이트 구조

### 네비게이션 메뉴
```
Header Navigation:
├── 회사소개 (About) - 메인 랜딩 페이지 역할
├── 서비스 (Services) - AI 서비스 통합 소개
├── 조직문화 (Culture) - 회사 문화 및 가치
├── 블로그 (Blog) - 기술 블로그 및 인사이트
├── 뉴스룸 (Newsroom) - API 연동 뉴스 피드
└── 인재영입 (Careers) - 채용 정보
```

### 라우팅 구조
```
기존 → 변경
/ (메인페이지) → /about (회사소개)
/research → 삭제 (About에 통합)
/partners → 삭제 (About에 통합)
/stable-image → 삭제 (Services에 통합)
/news → /newsroom (기능 확장)
/careers → 유지 (내용 개선)

신규 페이지:
/services (신설)
/culture (신설)
/blog (신설)
```

---

## 🎨 디자인 시스템 (Palantir 스타일)

### 색상 팔레트
```css
/* Primary Colors */
--bg-primary: #0A0A0A;        /* 메인 배경 (팔란티어 스타일) */
--bg-secondary: #1A1A1A;      /* 섹션 배경 */
--bg-card: rgba(255,255,255,0.05); /* 카드 배경 (글래스 효과) */

/* Accent Colors */
--accent-from: #8B5CF6;       /* 그라디언트 시작 (보라) */
--accent-to: #3B82F6;         /* 그라디언트 끝 (블루) */

/* Text Colors */
--text-primary: #FFFFFF;      /* 메인 텍스트 */
--text-secondary: #A1A1AA;    /* 보조 텍스트 */
--text-muted: #6B7280;        /* 비활성 텍스트 */

/* Border & Effects */
--border-subtle: rgba(255,255,255,0.1);
--shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
```

### 타이포그래피
```css
/* Headlines */
h1: text-8xl font-bold (팔란티어 스타일 대형 헤드라인)
h2: text-6xl font-bold
h3: text-4xl font-semibold
h4: text-2xl font-semibold

/* Body Text */
body: text-lg leading-relaxed
small: text-sm text-secondary
```

### 레이아웃 패턴
- **풀스크린 섹션**: 각 섹션이 화면을 가득 채움
- **12컬럼 그리드**: 정교한 그리드 시스템
- **넓은 여백**: 섹션 간 충분한 패딩 (py-24)
- **중앙 정렬**: max-w-7xl mx-auto 패턴

---

## 📄 페이지별 상세 구조

### 1. 회사소개 (`/about`) - 메인 랜딩 페이지

#### 구조 (강남언니 스타일)
```
├── Hero Section - 회사 비전/미션
├── Company Story - 창립 배경 및 발전 과정
├── Core Values - 핵심 가치 (3-4개 카드)
├── Team Introduction - 주요 임원진/팀 리더
├── Partnership - 주요 파트너사 (기존 PartnersSection 활용)
├── Research Highlights - 연구 성과 (기존 Research 통합)
└── Achievements - 성과 지표 및 타임라인
```

#### 디자인 (팔란티어 스타일)
- **Hero**: 대형 타이포그래피 + 서브틀한 애니메이션
- **Values**: 미니멀한 아이콘 + 다크 카드
- **Team**: 프로페셔널한 사진 + 그리드 레이아웃
- **Metrics**: 데이터 시각화 컴포넌트

#### 활용 컴포넌트
- VideoHeroSection (텍스트 변경)
- PlatformSection (구조 재사용)
- PartnersSection (이동)
- 신규: DataVisualization, TeamGrid

### 2. 서비스 (`/services`) - 신설

#### 구조
```
├── Hero Section - "AI Solutions for Enterprise"
├── Service Overview - 전체 서비스 생태계 설명
├── Main Services - 주요 서비스 카드 (2x2 그리드)
│   ├── Stable Image (기존 내용 통합)
│   ├── API Platform
│   ├── Enterprise Solutions
│   └── Developer Tools
├── Technology Stack - 사용 기술 소개
├── API Documentation - 코드 예제 및 문서
├── Roadmap - 향후 서비스 계획
└── CTA Section - 서비스 문의/체험
```

#### 디자인
- **Service Cards**: 대형 카드, 호버 효과
- **Tech Stack**: 로고 그리드, 다크 배경
- **API Docs**: 터미널 스타일 코드 블록
- **Roadmap**: 타임라인 시각화

#### 활용 컴포넌트
- VideoHeroSection
- InfiniteCarouselSection (서비스 슬라이더)
- 신규: ServiceCard, CodeBlock, TechStack

### 3. 조직문화 (`/culture`) - 신설

#### 구조
```
├── Hero Section - "함께 성장하는 문화"
├── Core Culture - 핵심 문화 키워드 (4-6개)
├── Work Style - 업무 프로세스 및 협업 방식
├── Growth Support - 교육, 컨퍼런스, 도서 지원
├── Work-Life Balance - 유연근무, 휴가 제도
├── Office Environment - 사무실 사진, 편의시설
├── Employee Stories - 직원 인터뷰 및 경험담
└── Benefits - 복리후생 상세 정보
```

#### 디자인
- **Culture Keywords**: 대형 텍스트 중심
- **Employee Stories**: 다크 배경 카드, 인용구 스타일
- **Office Photos**: 고품질 이미지 그리드
- **Benefits**: 아이콘 + 설명 카드

#### 활용 컴포넌트
- VideoHeroSection
- 기존 careers의 benefits 섹션 활용
- 신규: CultureCard, EmployeeStory, BenefitGrid

### 4. 블로그 (`/blog`) - 신설

#### 구조
```
├── Hero Section - "기술과 인사이트를 공유합니다"
├── Featured Posts - 추천 포스트 (상단 배너)
├── Category Filter - 기술, 개발, AI, 트렌드 등
├── Posts Grid - 3열 카드 레이아웃
├── Search Function - 제목/내용 검색
├── Tag Cloud - 인기 태그
└── Pagination - 페이지 네비게이션
```

#### 디자인
- **Post Cards**: 미니멀한 디자인, 다크 테마
- **Categories**: 서브틀한 태그 스타일
- **Search**: 다크 테마 인풋 필드
- **Pagination**: 심플한 번호 네비게이션

#### 활용 컴포넌트
- VideoHeroSection
- 기존 news 페이지의 필터 구조 활용
- 신규: BlogCard, SearchBar, TagCloud

### 5. 뉴스룸 (`/newsroom`) - 기존 확장

#### 구조
```
├── Hero Section - "Paiptree 소식"
├── Latest News - API 연동 실시간 뉴스 피드
├── Press Releases - 공식 보도자료
├── Media Coverage - 언론사 기사 링크
├── Media Kit - 로고, 이미지 다운로드
├── Press Contact - 미디어 문의 정보
└── Newsletter Signup - 뉴스레터 구독
```

#### 디자인
- **News Feed**: 타임라인 스타일
- **Press Kit**: 다운로드 버튼, 미니멀 디자인
- **Media Coverage**: 언론사 로고 + 기사 링크

#### 활용 컴포넌트
- 기존 NewsSection 확장
- 신규: Timeline, MediaKit, PressCard

### 6. 인재영입 (`/careers`) - 기존 개선

#### 구조 (기존 유지)
```
├── Hero Section
├── Company Values (Culture로 일부 이동)
├── Benefits
├── Open Positions
├── Application Process
└── CTA Section
```

#### 개선사항
- 조직문화 관련 내용 → `/culture`로 분리
- 팔란티어 스타일 디자인 적용
- 채용 프로세스에 집중

---

## 🔧 기술적 구현 계획

### 기존 컴포넌트 활용 전략

#### 재사용 컴포넌트
```
VideoHeroSection → 모든 페이지 히어로 (텍스트만 변경)
ParticleBackground → 전체 페이지 일관성 유지
InfiniteCarouselSection → 서비스 슬라이더로 활용
PlatformSection → About 페이지 섹션으로 활용
PartnersSection → About 페이지로 이동
NewsSection → Newsroom 기본 구조로 활용
CTACardsSection → 각 페이지 CTA 섹션
```

#### 스타일 업데이트
```css
/* 기존 glass-card 클래스 업데이트 */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

/* 기존 gradient-text 업데이트 */
.gradient-text {
  background: linear-gradient(135deg, #8B5CF6, #3B82F6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 신규 컴포넌트 필요

#### 공통 컴포넌트
- `PageHero`: 각 페이지별 히어로 섹션
- `ContentSection`: 일관된 섹션 레이아웃
- `CardGrid`: 카드 형태 콘텐츠 표시

#### 전용 컴포넌트
- `DataVisualization`: 성과 지표 표시
- `CodeBlock`: API 문서용 코드 블록
- `Timeline`: 뉴스룸 타임라인
- `MetricCard`: 수치 표시 카드
- `ServiceCard`: 서비스 소개 카드
- `BlogCard`: 블로그 포스트 카드
- `TeamGrid`: 팀 멤버 그리드
- `TechStack`: 기술 스택 표시

### 다국어 지원 확장

#### 번역 파일 추가
```
src/data/translations/
├── common.ts (기존)
├── home.ts → about.ts (변경)
├── services.ts (신규)
├── culture.ts (신규)
├── blog.ts (신규)
├── newsroom.ts (신규)
└── careers.ts (기존 확장)
```

### API 연동 준비

#### 뉴스룸 API
```typescript
// hooks/useNewsAPI.ts
export const useNewsAPI = () => {
  // 외부 뉴스 API 연동 로직
  // RSS 피드 또는 CMS 연동
};
```

#### 블로그 시스템
```typescript
// hooks/useBlog.ts
export const useBlog = () => {
  // 마크다운 파일 또는 Headless CMS 연동
  // 블로그 포스트 관리 로직
};
```

---

## 🚀 구현 우선순위 및 일정

### Phase 1: 기반 작업 (1-2일)
1. **디자인 시스템 업데이트**
   - CSS 변수 및 색상 팔레트 변경
   - 타이포그래피 스타일 조정
   - 기존 컴포넌트 스타일 업데이트

2. **Header 네비게이션 구조 변경**
   - 메뉴 항목 업데이트
   - 라우팅 설정
   - 다국어 번역 추가

### Phase 2: 핵심 페이지 (3-4일)
3. **About 페이지** (기존 메인 페이지 전환)
   - 기존 컴포넌트 재배치
   - 팔란티어 스타일 적용
   - 콘텐츠 업데이트

4. **Services 페이지** (신규, 최우선)
   - 서비스 통합 소개 페이지
   - 기존 stable-image 내용 통합
   - API 문서 섹션 추가

### Phase 3: 문화 및 콘텐츠 페이지 (2-3일)
5. **Culture 페이지** (신규)
   - 조직문화 콘텐츠 작성
   - 직원 인터뷰 섹션
   - 복리후생 정보

6. **Blog 페이지** (신규)
   - 블로그 시스템 구축
   - 포스트 관리 기능
   - 검색 및 필터링

### Phase 4: 뉴스 및 채용 (1-2일)
7. **Newsroom 페이지** (기존 확장)
   - API 연동 뉴스 피드
   - 프레스 키트 섹션
   - 미디어 연락처

8. **Careers 페이지** (기존 개선)
   - 팔란티어 스타일 적용
   - 조직문화 내용 분리
   - 채용 프로세스 개선

### Phase 5: 최적화 및 테스트 (1일)
9. **성능 최적화**
   - 이미지 최적화
   - 코드 스플리팅
   - SEO 개선

10. **테스트 및 배포**
    - 반응형 테스트
    - 다국어 테스트
    - 최종 배포

---

## 📝 주요 고려사항

### 기존 자산 보존
- 현재 잘 작동하는 컴포넌트들 최대한 재활용
- 기존 다국어 시스템 확장 활용
- ParticleBackground 등 브랜드 요소 유지

### 사용자 경험 개선
- 직관적인 네비게이션 구조
- 일관된 디자인 언어
- 빠른 로딩 속도

### 확장성 고려
- 모듈화된 컴포넌트 구조
- API 연동 준비
- CMS 연동 가능한 구조

### SEO 최적화
- 메타 태그 최적화
- 구조화된 데이터 추가
- 사이트맵 업데이트

---

## 🎯 성공 지표

### 기술적 지표
- 페이지 로딩 속도 < 3초
- 모바일 반응형 100% 지원
- 접근성 점수 AA 등급 이상

### 사용자 경험 지표
- 직관적인 네비게이션 구조
- 일관된 디자인 시스템
- 다국어 지원 완성도

### 비즈니스 지표
- 전문적이고 신뢰할 수 있는 기업 이미지
- 서비스 소개 효과성 증대
- 채용 및 파트너십 문의 증가

---

*이 계획서는 Paiptree 웹사이트의 성공적인 리구조링을 위한 종합적인 가이드라인입니다.*