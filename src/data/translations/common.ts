// 공통 번역 (Header, Footer 등)
export const commonTranslations = {
  ko: {
    // Header Navigation
    header: {
      nav: {
        about: "회사소개",
        services: "서비스",
        culture: "조직문화",
        blog: "블로그",
        newsroom: "뉴스룸",
        careers: "인재영입"
      }
    },
    // Footer Section
    footer: {
      description: "AI 기반 스마트 양계 플랫폼으로 농장부터 유통까지 연결합니다.",
      categories: {
        company: "회사",
        models: "모델",
        deployment: "배포",
        resources: "리소스"
      },
      links: {
        company: {
          boardOfDirectors: "이사회",
          partners: "파트너",
          safety: "안전",
          research: "연구",
          careers: "채용",
          news: "뉴스"
        },
        models: {
          image: "이미지",
          video: "비디오",
          audio: "오디오",
          "3d": "3D"
        },
        deployment: {
          selfHosted: "자체 호스팅 라이선스",
          platformApi: "플랫폼 API",
          cloudPlatforms: "클라우드 플랫폼"
        },
        resources: {
          learningHub: "학습 허브",
          customerStories: "고객 사례",
          contactUs: "문의하기"
        }
      },
      copyright: "© {year} Paiptree Ltd. All Rights Reserved."
    }
  },
  en: {
    // Header Navigation
    header: {
      nav: {
        about: "About",
        services: "Services",
        culture: "Culture",
        blog: "Blog",
        newsroom: "Newsroom",
        careers: "Careers"
      }
    },
    // Footer Section
    footer: {
      description: "Unlocking the power of open-source generative AI to expand human creativity.",
      categories: {
        company: "Company",
        models: "Models",
        deployment: "Deployment",
        resources: "Resources"
      },
      links: {
        company: {
          boardOfDirectors: "Board of Directors",
          partners: "Partners",
          safety: "Safety",
          research: "Research",
          careers: "Careers",
          news: "News"
        },
        models: {
          image: "Image",
          video: "Video",
          audio: "Audio",
          "3d": "3D"
        },
        deployment: {
          selfHosted: "Self-Hosted License",
          platformApi: "Platform API",
          cloudPlatforms: "Cloud Platforms"
        },
        resources: {
          learningHub: "Learning Hub",
          customerStories: "Customer Stories",
          contactUs: "Contact Us"
        }
      },
      copyright: "© {year} Paiptree Ltd. All Rights Reserved."
    }
  }
} as const;
