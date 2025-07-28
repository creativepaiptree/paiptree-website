// 공통 번역 (Header, Footer 등)
export const commonTranslations = {
  ko: {
    // Header Navigation
    header: {
      nav: {
        products: "제품",
        research: "연구",
        news: "뉴스",
        partners: "파트너",
        careers: "채용"
      }
    },
    // Footer Section
    footer: {
      description: "오픈소스 제너레이티브 AI의 힘을 활용하여 인간의 창의성을 확장합니다.",
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
        products: "Products",
        research: "Research",
        news: "News",
        partners: "Partners",
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